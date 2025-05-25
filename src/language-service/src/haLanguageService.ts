import {
  CompletionItem,
  CompletionList,
  Definition,
  DefinitionLink,
  Diagnostic,
  FormattingOptions,
  Hover,
  Position,
  Range,
  SymbolInformation,
  TextDocument,
  TextEdit,
} from "vscode-languageserver-protocol";
import { getLineOffsets } from "yaml-language-server/out/server/src/languageservice/utils/arrUtils";
import {
  LanguageService,
  LanguageSettings,
} from "yaml-language-server/out/server/src/languageservice/yamlLanguageService";
import { SchemaServiceForIncludes } from "./schemas/schemaService";
import { AreaCompletionContribution } from "./completionHelpers/areas";
import { EntityIdCompletionContribution } from "./completionHelpers/entityIds";
import { FloorCompletionContribution } from "./completionHelpers/floors";
import { LabelCompletionContribution } from "./completionHelpers/labels";
import { HaConnection } from "./home-assistant/haConnection";
import { ServicesCompletionContribution } from "./completionHelpers/services";
import { DomainCompletionContribution } from "./completionHelpers/domains";
import { DefinitionProvider } from "./definition/definition";
import { HomeAssistantConfiguration } from "./haConfig/haConfig";
import { Includetype } from "./haConfig/dto";

export class HomeAssistantLanguageService {
  constructor(
    private yamlLanguageService: LanguageService,
    private haConfig: HomeAssistantConfiguration,
    private haConnection: HaConnection,
    private definitionProviders: DefinitionProvider[],
    private schemaServiceForIncludes: SchemaServiceForIncludes,
    private sendDiagnostics: (
      fileUri: string,
      diagnostics: Diagnostic[],
    ) => void,
    private diagnoseAllFiles: () => void,
  ) {}

  public findAndApplySchemas = (): void => {
    try {
      const haFiles = this.haConfig.getAllFiles();
      if (haFiles && haFiles.length > 0) {
        console.log(
          `Applying schemas to ${haFiles.length} of your configuration files...`,
        );
      }

      this.yamlLanguageService.configure({
        validate: true,
        customTags: this.getValidYamlTags(),
        completion: true,
        format: true,
        hover: true,
        isKubernetes: false,
        schemas: this.schemaServiceForIncludes.getSchemaContributions(haFiles),
      } as LanguageSettings);

      this.diagnoseAllFiles();
    } catch (error) {
      const message: string = error.message;
      console.error(
        `Unexpected error updating the schemas, message: ${message}`,
        error,
      );
    }
    console.log("Schemas updated!");
  };

  private getValidYamlTags(): string[] {
    const validTags: string[] = [];
    for (const item in Includetype) {
      if (Number.isNaN(Number(item))) {
        validTags.push(`!${item} scalar`);
      }
    }
    validTags.push("!env_var scalar");
    validTags.push("!input scalar");
    validTags.push("!secret scalar");

    return validTags;
  }

  private onDocumentChangeDebounce: NodeJS.Timeout | undefined;

  public onDocumentChange = (document: TextDocument): void => {
    if (this.onDocumentChangeDebounce !== undefined) {
      clearTimeout(this.onDocumentChangeDebounce);
    }

    this.onDocumentChangeDebounce = setTimeout(async (): Promise<void> => {
      const singleFileUpdate = await this.haConfig.updateFile(document.uri);
      if (singleFileUpdate.isValidYaml && singleFileUpdate.newFilesFound) {
        console.log(
          `Discover all configuration files because ${document.uri} got updated and new files were found...`,
        );
        await this.haConfig.discoverFiles();
        this.findAndApplySchemas();
      }

      const diagnostics = await this.getDiagnostics(document);

      this.sendDiagnostics(document.uri, diagnostics);
    }, 600);
  };

  public onDocumentOpen = async (document: TextDocument): Promise<void> => {
    const diagnostics = await this.getDiagnostics(document);

    this.sendDiagnostics(document.uri, diagnostics);
  };

  public getDiagnostics = async (
    document: TextDocument,
  ): Promise<Diagnostic[]> => {
    if (!document || document.getText().length === 0) {
      return [];
    }

    const diagnosticResults = await this.yamlLanguageService.doValidation(
      document,
      false,
    );

    if (!diagnosticResults) {
      return [];
    }
    const diagnostics: Diagnostic[] = [];
    for (const diagnosticItem of diagnosticResults) {
      // Fetch the text before the error, this might be "!secret"
      const possibleSecret = document.getText(
        Range.create(
          diagnosticItem.range.start.line,
          diagnosticItem.range.start.character - 8,
          diagnosticItem.range.end.line,
          diagnosticItem.range.start.character - 1,
        ),
      );

      // Skip errors about secrets, we simply have no idea what is in them
      if (possibleSecret === "!secret") {
        continue;
      }

      // Fetch the text before the error, this might be "!input"
      const possibleInput = document.getText(
        Range.create(
          diagnosticItem.range.start.line,
          diagnosticItem.range.start.character - 7,
          diagnosticItem.range.end.line,
          diagnosticItem.range.start.character - 1,
        ),
      );

      // Skip errors about input, that is up to the Blueprint creator
      if (possibleInput === "!input") {
        continue;
      }

      // Fetch the text before the error, this might be "!include"
      const possibleInclude = document.getText(
        Range.create(
          diagnosticItem.range.start.line,
          diagnosticItem.range.start.character - 9,
          diagnosticItem.range.end.line,
          diagnosticItem.range.start.character - 1,
        ),
      );

      // Skip errors about include, everything can be included
      if (possibleInclude === "!include") {
        continue;
      }

      diagnosticItem.severity = 1; // Convert all warnings to errors
      diagnostics.push(diagnosticItem);
    }

    // Add entity validation diagnostics
    const entityValidationDiagnostics = await this.validateEntityIds(document);
    diagnostics.push(...entityValidationDiagnostics);

    // Add area validation diagnostics
    const areaValidationDiagnostics = await this.validateAreaIds(document);
    diagnostics.push(...areaValidationDiagnostics);

    return diagnostics;
  };

  private validateEntityIds = async (
    document: TextDocument,
  ): Promise<Diagnostic[]> => {
    const diagnostics: Diagnostic[] = [];
    
    try {
      // Get all entities from Home Assistant
      const entities = await this.haConnection.getHassEntities();
      if (!entities) {
        // If we can't get entities (e.g., not connected), don't validate
        console.log("Entity validation skipped: No entities available from Home Assistant");
        return diagnostics;
      }

      const entityIds = Object.keys(entities);
      console.log(`Entity validation: Found ${entityIds.length} entities from Home Assistant`);
      
      const text = document.getText();
      const lines = text.split("\n");

      // Iterate through each line to find entity references
      for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex];
        
        // Find entity ID properties that need validation
        for (const propertyName of EntityIdCompletionContribution.propertyMatches) {
          const propertyRegex = new RegExp(`\\s*${propertyName}\\s*:\\s*([^\\s\\n#]+)`, "g");
          let match;
          
          while ((match = propertyRegex.exec(line)) !== null) {
            const entityValue = match[1].trim();
            
            // Remove quotes if present
            const cleanEntityValue = entityValue.replace(/^["']|["']$/g, "");
            
            // Skip template entities (containing {{ }})
            if (cleanEntityValue.includes("{{") || cleanEntityValue.includes("}}")) {
              continue;
            }
            
            // Skip entities that are variables or templates
            if (cleanEntityValue.startsWith("!")) {
              continue;
            }
            
            // Check if this looks like an entity ID (domain.entity format)
            if (!/^[a-z_]+\.[a-z0-9_]+$/.test(cleanEntityValue)) {
              continue;
            }
            
            // Check if entity exists in Home Assistant
            if (!entityIds.includes(cleanEntityValue)) {
              console.log(`Entity validation: Found unknown entity '${cleanEntityValue}' at line ${lineIndex + 1}`);
              const startColumn = match.index! + match[0].indexOf(entityValue);
              const endColumn = startColumn + entityValue.length;
              
              const diagnostic: Diagnostic = {
                severity: 2, // Warning
                range: Range.create(
                  lineIndex,
                  startColumn,
                  lineIndex,
                  endColumn,
                ),
                message: `Entity '${cleanEntityValue}' does not exist in your Home Assistant instance`,
                source: "home-assistant",
                code: "unknown-entity",
              };
              
              diagnostics.push(diagnostic);
            }
          }
          
          // Also check for entity arrays (entity_id: [entity1, entity2])
          const arrayPropertyRegex = new RegExp(`\\s*${propertyName}\\s*:\\s*\\[([^\\]]+)\\]`, "g");
          let arrayMatch;
          
          while ((arrayMatch = arrayPropertyRegex.exec(line)) !== null) {
            const entitiesInArray = arrayMatch[1];
            const entityArray = entitiesInArray.split(",").map(e => e.trim().replace(/^["']|["']$/g, ""));
            
            for (const entityInArray of entityArray) {
              const cleanEntityValue = entityInArray.trim();
              
              // Skip template entities and variables
              if (cleanEntityValue.includes("{{") || cleanEntityValue.includes("}}") || cleanEntityValue.startsWith("!")) {
                continue;
              }
              
              // Check if this looks like an entity ID
              if (!/^[a-z_]+\.[a-z0-9_]+$/.test(cleanEntityValue)) {
                continue;
              }
              
              // Check if entity exists
              if (!entityIds.includes(cleanEntityValue)) {
                const entityStartInArray = entitiesInArray.indexOf(entityInArray);
                const startColumn = arrayMatch.index! + arrayMatch[0].indexOf("[") + 1 + entityStartInArray;
                const endColumn = startColumn + entityInArray.length;
                
                const diagnostic: Diagnostic = {
                  severity: 2, // Warning
                  range: Range.create(
                    lineIndex,
                    startColumn,
                    lineIndex,
                    endColumn,
                  ),
                  message: `Entity '${cleanEntityValue}' does not exist in your Home Assistant instance`,
                  source: "home-assistant",
                  code: "unknown-entity",
                };
                
                diagnostics.push(diagnostic);
              }
            }
          }
        }
        
        // Handle multi-line entity arrays
        if (line.trim().startsWith("- ")) {
          // Check if we're in an entity list context by looking at previous lines
          let currentLineIndex = lineIndex - 1;
          let foundEntityProperty = false;
          
          while (currentLineIndex >= 0 && lines[currentLineIndex].trim() !== "") {
            const prevLine = lines[currentLineIndex];
            
            for (const propertyName of EntityIdCompletionContribution.propertyMatches) {
              if (new RegExp(`\\s*${propertyName}\\s*:\\s*$`).test(prevLine)) {
                foundEntityProperty = true;
                break;
              }
            }
            
            if (foundEntityProperty) {
              break;
            }
            currentLineIndex--;
          }
          
          if (foundEntityProperty) {
            const entityMatch = line.match(/^\s*-\s*([^#\n]+)/);
            if (entityMatch) {
              const entityValue = entityMatch[1].trim().replace(/^["']|["']$/g, "");
              
              // Skip template entities and variables
              if (entityValue.includes("{{") || entityValue.includes("}}") || entityValue.startsWith("!")) {
                continue;
              }
              
              // Check if this looks like an entity ID
              if (!/^[a-z_]+\.[a-z0-9_]+$/.test(entityValue)) {
                continue;
              }
              
              // Check if entity exists
              if (!entityIds.includes(entityValue)) {
                const startColumn = entityMatch.index! + entityMatch[0].indexOf(entityValue);
                const endColumn = startColumn + entityValue.length;
                
                const diagnostic: Diagnostic = {
                  severity: 2, // Warning
                  range: Range.create(
                    lineIndex,
                    startColumn,
                    lineIndex,
                    endColumn,
                  ),
                  message: `Entity '${entityValue}' does not exist in your Home Assistant instance`,
                  source: "home-assistant",
                  code: "unknown-entity",
                };
                
                diagnostics.push(diagnostic);
              }
            }
          }
        }
      }
    } catch (error) {
      // If validation fails (e.g., HA not connected), silently skip
      console.log("Entity validation skipped:", error);
    }
    
    return diagnostics;
  };

  private validateAreaIds = async (
    document: TextDocument,
  ): Promise<Diagnostic[]> => {
    const diagnostics: Diagnostic[] = [];
    
    try {
      // Get all areas from Home Assistant
      const areaCompletions = await this.haConnection.getAreaCompletions();
      if (!areaCompletions || areaCompletions.length === 0) {
        // If we can't get areas (e.g., not connected), don't validate
        console.log("Area validation skipped: No areas available from Home Assistant");
        return diagnostics;
      }

      const areaIds = areaCompletions.map(area => area.label as string);
      console.log(`Area validation: Found ${areaIds.length} areas from Home Assistant`);
      
      const text = document.getText();
      const lines = text.split("\n");
      
      // Track positions where we've already added diagnostics to avoid duplicates
      const processedPositions = new Set<string>();

      // Iterate through each line to find area references
      for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex];
        
        // Find area ID properties that need validation
        for (const propertyName of AreaCompletionContribution.propertyMatches) {
          // Check for single area values first: area_id: area_name
          const propertyRegex = new RegExp(`\\s*${propertyName}\\s*:\\s*([^\\s\\n#\\[]+)`, "g");
          let match;
          
          while ((match = propertyRegex.exec(line)) !== null) {
            const areaValue = match[1].trim();
            
            // Remove quotes if present
            const cleanAreaValue = areaValue.replace(/^["']|["']$/g, "");
            
            // Skip template areas (containing {{ }})
            if (cleanAreaValue.includes("{{") || cleanAreaValue.includes("}}")) {
              continue;
            }
            
            // Skip areas that are variables or templates
            if (cleanAreaValue.startsWith("!")) {
              continue;
            }
            
            // Skip special values like "none" or "all"
            if (cleanAreaValue === "none" || cleanAreaValue === "all") {
              continue;
            }
            
            // Check if area exists in Home Assistant
            if (!areaIds.includes(cleanAreaValue)) {
              const startColumn = match.index! + match[0].indexOf(areaValue);
              const endColumn = startColumn + areaValue.length;
              
              // Create a unique key for this position
              const positionKey = `${lineIndex}:${startColumn}:${endColumn}`;
              
              // Skip if we've already processed this position
              if (processedPositions.has(positionKey)) {
                continue;
              }
              
              processedPositions.add(positionKey);
              
              console.log(`Area validation: Found unknown area '${cleanAreaValue}' at line ${lineIndex + 1}`);
              
              const diagnostic: Diagnostic = {
                severity: 2, // Warning
                range: Range.create(
                  lineIndex,
                  startColumn,
                  lineIndex,
                  endColumn,
                ),
                message: `Area '${cleanAreaValue}' does not exist in your Home Assistant instance`,
                source: "home-assistant",
                code: "unknown-area",
              };
              
              diagnostics.push(diagnostic);
            }
          }
          
          // Also check for area arrays (area_id: [area1, area2])
          const arrayPropertyRegex = new RegExp(`\\s*${propertyName}\\s*:\\s*\\[([^\\]]+)\\]`, "g");
          let arrayMatch;
          
          while ((arrayMatch = arrayPropertyRegex.exec(line)) !== null) {
            const areasInArray = arrayMatch[1];
            const areaArray = areasInArray.split(",").map(e => e.trim().replace(/^["']|["']$/g, ""));
            
            for (const areaInArray of areaArray) {
              const cleanAreaValue = areaInArray.trim();
              
              // Skip template areas and variables
              if (cleanAreaValue.includes("{{") || cleanAreaValue.includes("}}") || cleanAreaValue.startsWith("!")) {
                continue;
              }
              
              // Skip special values like "none" or "all"
              if (cleanAreaValue === "none" || cleanAreaValue === "all") {
                continue;
              }
              
              // Check if area exists
              if (!areaIds.includes(cleanAreaValue)) {
                const areaStartInArray = areasInArray.indexOf(areaInArray);
                const startColumn = arrayMatch.index! + arrayMatch[0].indexOf("[") + 1 + areaStartInArray;
                const endColumn = startColumn + areaInArray.length;
                
                // Create a unique key for this position
                const positionKey = `${lineIndex}:${startColumn}:${endColumn}`;
                
                // Skip if we've already processed this position
                if (processedPositions.has(positionKey)) {
                  continue;
                }
                
                processedPositions.add(positionKey);
                
                const diagnostic: Diagnostic = {
                  severity: 2, // Warning
                  range: Range.create(
                    lineIndex,
                    startColumn,
                    lineIndex,
                    endColumn,
                  ),
                  message: `Area '${cleanAreaValue}' does not exist in your Home Assistant instance`,
                  source: "home-assistant",
                  code: "unknown-area",
                };
                
                diagnostics.push(diagnostic);
              }
            }
          }
        }
        
        // Handle multi-line area arrays
        if (line.trim().startsWith("- ")) {
          // Check if we're in an area list context by looking at previous lines
          let currentLineIndex = lineIndex - 1;
          let foundAreaProperty = false;
          
          while (currentLineIndex >= 0 && lines[currentLineIndex].trim() !== "") {
            const prevLine = lines[currentLineIndex];
            
            for (const propertyName of AreaCompletionContribution.propertyMatches) {
              if (new RegExp(`\\s*${propertyName}\\s*:\\s*$`).test(prevLine)) {
                foundAreaProperty = true;
                break;
              }
            }
            
            if (foundAreaProperty) {
              break;
            }
            currentLineIndex--;
          }
          
          if (foundAreaProperty) {
            const areaMatch = line.match(/^\s*-\s*([^#\n]+)/);
            if (areaMatch) {
              const areaValue = areaMatch[1].trim().replace(/^["']|["']$/g, "");
              
              // Skip template areas and variables
              if (areaValue.includes("{{") || areaValue.includes("}}") || areaValue.startsWith("!")) {
                continue;
              }
              
              // Skip special values like "none" or "all"
              if (areaValue === "none" || areaValue === "all") {
                continue;
              }
              
              // Check if area exists
              if (!areaIds.includes(areaValue)) {
                const startColumn = areaMatch.index! + areaMatch[0].indexOf(areaValue);
                const endColumn = startColumn + areaValue.length;
                
                // Create a unique key for this position
                const positionKey = `${lineIndex}:${startColumn}:${endColumn}`;
                
                // Skip if we've already processed this position
                if (processedPositions.has(positionKey)) {
                  continue;
                }
                
                processedPositions.add(positionKey);
                
                const diagnostic: Diagnostic = {
                  severity: 2, // Warning
                  range: Range.create(
                    lineIndex,
                    startColumn,
                    lineIndex,
                    endColumn,
                  ),
                  message: `Area '${areaValue}' does not exist in your Home Assistant instance`,
                  source: "home-assistant",
                  code: "unknown-area",
                };
                
                diagnostics.push(diagnostic);
              }
            }
          }
        }
      }
    } catch (error) {
      // If validation fails (e.g., HA not connected), silently skip
      console.log("Area validation skipped:", error);
    }
    
    return diagnostics;
  };

  public onDocumentSymbol = (document: TextDocument): SymbolInformation[] => {
    if (!document) {
      return [];
    }

    return this.yamlLanguageService.findDocumentSymbols(document, {});
  };

  public onDocumentFormatting = async (
    document: TextDocument,
    options: FormattingOptions,
  ): Promise<TextEdit[]> => {
    if (!document) {
      return [];
    }

    // copied defaults from YAML Language Service
    const settings = {
      tabWidth: options.tabSize,
      singleQuote: false,
      bracketSpacing: true,
      proseWrap: "preserve",
      printWidth: 80,
      enable: true,
    };

    return await this.yamlLanguageService.doFormat(document, settings);
  };

  public onCompletion = async (
    textDocument: TextDocument,
    position: Position,
  ): Promise<CompletionList> => {
    const result: CompletionList = {
      items: [],
      isIncomplete: false,
    };

    if (!textDocument) {
      return Promise.resolve(result);
    }

    const currentCompletions: CompletionList =
      await this.yamlLanguageService.doComplete(textDocument, position, false);

    const additionalCompletions = await this.getServiceAndEntityCompletions(
      textDocument,
      position,
      currentCompletions,
    );

    if (additionalCompletions.length === 0) {
      return currentCompletions;
    }

    return CompletionList.create(additionalCompletions, false);
  };

  public onCompletionResolve = async (
    completionItem: CompletionItem,
  ): Promise<CompletionItem> => completionItem;

  public onHover = async (
    document: TextDocument,
    position: Position,
  ): Promise<Hover | null> => {
    if (!document) {
      return null;
    }

    return this.yamlLanguageService.doHover(document, position);
  };

  public onDefinition = async (
    textDocument: TextDocument,
    position: Position,
  ): Promise<Definition | DefinitionLink[] | undefined> => {
    if (!textDocument) {
      return undefined;
    }
    const lineOffsets: number[] = getLineOffsets(textDocument.getText());
    const start: number = lineOffsets[position.line];
    const end: number = lineOffsets[position.line + 1];
    const thisLine = textDocument.getText().substring(start, end);

    let results = [];
    for (const provider of this.definitionProviders) {
      results.push(provider.onDefinition(thisLine, textDocument.uri));
    }
    results = await Promise.all(results);

    let definitions: any = [];
    for (const result of results) {
      if (result) {
        definitions = definitions.concat(result);
      }
    }

    return definitions;
  };

  private getServiceAndEntityCompletions = async (
    document: TextDocument,
    textDocumentPosition: Position,
    currentCompletions: CompletionList,
  ): Promise<CompletionItem[]> => {
    // sadly this is needed here.
    // the normal completion engine cannot provide completions for type `string | string[]`
    // updating the type to only one of the 2 types will break the yaml-validation.
    // so we tap in here, iterate over the lines of the text file to see if this if
    // we need to add entity_id's to the completion list

    const properties: { [provider: string]: string[] } = {};
    properties.areas = AreaCompletionContribution.propertyMatches;
    properties.entities = EntityIdCompletionContribution.propertyMatches;
    properties.floors = FloorCompletionContribution.propertyMatches;
    properties.labels = LabelCompletionContribution.propertyMatches;
    properties.services = ServicesCompletionContribution.propertyMatches;
    properties.domains = DomainCompletionContribution.propertyMatches;

    const additionalCompletionProvider = this.findAutoCompletionProperty(
      document,
      textDocumentPosition,
      properties,
    );
    let additionalCompletion: CompletionItem[] = [];
    switch (additionalCompletionProvider) {
      case "areas":
        if (!currentCompletions.items.some((x) => x.data && x.data.isArea)) {
          additionalCompletion = await this.haConnection.getAreaCompletions();
        }
        break;
      case "entities":
        // sometimes the entities are already added, do not add them twice

        if (!currentCompletions.items.some((x) => x.data && x.data.isEntity)) {
          additionalCompletion = await this.haConnection.getEntityCompletions();
        }
        break;
      case "domains":
        // sometimes the domains are already added, do not add them twice

        if (!currentCompletions.items.some((x) => x.data && x.data.isDomain)) {
          additionalCompletion = await this.haConnection.getDomainCompletions();
        }
        break;
      case "floors":
        if (!currentCompletions.items.some((x) => x.data && x.data.isFloor)) {
          additionalCompletion = await this.haConnection.getFloorCompletions();
        }
        break;
      case "labels":
        if (!currentCompletions.items.some((x) => x.data && x.data.isLabel)) {
          additionalCompletion = await this.haConnection.getLabelCompletions();
        }
        break;
      case "services":
        if (!currentCompletions.items.some((x) => x.data && x.data.isService)) {
          additionalCompletion =
            await this.haConnection.getServiceCompletions();
        }
        break;
    }
    return additionalCompletion;
  };

  private findAutoCompletionProperty = (
    document: TextDocument,
    textDocumentPosition: Position,
    properties: { [provider: string]: string[] },
  ): string | null => {
    let currentLine = textDocumentPosition.line;
    while (currentLine >= 0) {
      const lineOffsets: number[] = getLineOffsets(document.getText());
      const start: number = lineOffsets[currentLine];
      let end = 0;
      if (lineOffsets[currentLine + 1] !== undefined) {
        end = lineOffsets[currentLine + 1] - 1;
      } else {
        end = document.getText().length;
      }
      const thisLine = document.getText().substring(start, end);

      const isOtherItemInList = thisLine.match(
        /-\s*([-"\w]+)?(\.)?([-"\w]+?)?\s*$/,
      );
      if (isOtherItemInList) {
        currentLine -= 1;
        continue;
      }
      for (const key in properties) {
        if (
          properties[key].some((propertyName) =>
            // eslint-disable-next-line no-useless-escape
            new RegExp(`(.*)${propertyName}(:)([\s]*)([\w]*)(\s*)`).test(
              thisLine,
            ),
          )
        ) {
          return key;
        }
      }
      return null;
    }
    return null;
  };
}
