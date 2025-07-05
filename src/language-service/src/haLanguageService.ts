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
  CompletionItemKind,
} from "vscode-languageserver-protocol";
import { getLineOffsets } from "yaml-language-server/out/server/src/languageservice/utils/arrUtils";
import {
  LanguageService,
  LanguageSettings,
} from "yaml-language-server/out/server/src/languageservice/yamlLanguageService";
import { SchemaServiceForIncludes } from "./schemas/schemaService";
import { AreaCompletionContribution } from "./completionHelpers/areas";
import { DeviceCompletionContribution } from "./completionHelpers/deviceIds";
import { EntityIdCompletionContribution } from "./completionHelpers/entityIds";
import { FloorCompletionContribution } from "./completionHelpers/floors";
import { LabelCompletionContribution } from "./completionHelpers/labels";
import { HaConnection } from "./home-assistant/haConnection";
import { ServicesCompletionContribution } from "./completionHelpers/services";
import { DomainCompletionContribution } from "./completionHelpers/domains";
import { UuidCompletionContribution } from "./completionHelpers/uuids";
import { SecretsCompletionContribution } from "./completionHelpers/secrets";
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
      const startChar = diagnosticItem.range.start.character;
      const startLine = diagnosticItem.range.start.line;
      const endLine = diagnosticItem.range.end.line;
      
      // Fetch the text before the error, this might be "!secret"
      // Ensure we don't go negative with character positions
      const secretStartChar = Math.max(0, startChar - 8);
      const secretEndChar = Math.max(0, startChar - 1);
      
      if (secretStartChar < secretEndChar) {
        const possibleSecret = document.getText(
          Range.create(
            startLine,
            secretStartChar,
            endLine,
            secretEndChar,
          ),
        );

        // Skip errors about secrets, we simply have no idea what is in them
        if (possibleSecret === "!secret") {
          continue;
        }
      }

      // Fetch the text before the error, this might be "!input"
      const inputStartChar = Math.max(0, startChar - 7);
      const inputEndChar = Math.max(0, startChar - 1);
      
      if (inputStartChar < inputEndChar) {
        const possibleInput = document.getText(
          Range.create(
            startLine,
            inputStartChar,
            endLine,
            inputEndChar,
          ),
        );

        // Skip errors about input, that is up to the Blueprint creator
        if (possibleInput === "!input") {
          continue;
        }
      }

      // Fetch the text before the error, this might be "!include"
      const includeStartChar = Math.max(0, startChar - 9);
      const includeEndChar = Math.max(0, startChar - 1);
      
      if (includeStartChar < includeEndChar) {
        const possibleInclude = document.getText(
          Range.create(
            startLine,
            includeStartChar,
            endLine,
            includeEndChar,
          ),
        );

        // Skip errors about include, everything can be included
        if (possibleInclude === "!include") {
          continue;
        }
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

    // Add device validation diagnostics
    const deviceValidationDiagnostics = await this.validateDeviceIds(document);
    diagnostics.push(...deviceValidationDiagnostics);

    // Add floor validation diagnostics
    const floorValidationDiagnostics = await this.validateFloorIds(document);
    diagnostics.push(...floorValidationDiagnostics);

    // Add secrets validation diagnostics
    const secretsValidationDiagnostics = await this.validateSecrets(document);
    diagnostics.push(...secretsValidationDiagnostics);

    // Add label validation diagnostics
    const labelValidationDiagnostics = await this.validateLabelIds(document);
    diagnostics.push(...labelValidationDiagnostics);

    // Add service validation diagnostics
    const actionValidationDiagnostics = await this.validateActionIds(document);
    diagnostics.push(...actionValidationDiagnostics);

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
        
        // Skip commented lines (lines that start with # after optional whitespace)
        if (line.trim().startsWith("#")) {
          continue;
        }
        
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
        
        // Skip commented lines (lines that start with # after optional whitespace)
        if (line.trim().startsWith("#")) {
          continue;
        }
        
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

  private validateDeviceIds = async (
    document: TextDocument,
  ): Promise<Diagnostic[]> => {
    const diagnostics: Diagnostic[] = [];
    
    try {
      // Get all devices from Home Assistant
      const deviceCompletions = await this.haConnection.getDeviceCompletions();
      if (!deviceCompletions || deviceCompletions.length === 0) {
        // If we can't get devices (e.g., not connected), don't validate
        console.log("Device validation skipped: No devices available from Home Assistant");
        return diagnostics;
      }

      const deviceIds = deviceCompletions.map(device => device.label as string);
      console.log(`Device validation: Found ${deviceIds.length} devices from Home Assistant`);
      
      const text = document.getText();
      const lines = text.split("\n");
      
      // Track positions where we've already added diagnostics to avoid duplicates
      const processedPositions = new Set<string>();

      // Iterate through each line to find device references
      for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex];
        
        // Skip commented lines (lines that start with # after optional whitespace)
        if (line.trim().startsWith("#")) {
          continue;
        }
        
        // Find device ID properties that need validation
        for (const propertyName of DeviceCompletionContribution.propertyMatches) {
          // Check for single device values first: device_id: device_name
          const propertyRegex = new RegExp(`\\s*${propertyName}\\s*:\\s*([^\\s\\n#\\[]+)`, "g");
          let match;
          
          while ((match = propertyRegex.exec(line)) !== null) {
            const deviceValue = match[1].trim();
            
            // Remove quotes if present
            const cleanDeviceValue = deviceValue.replace(/^["']|["']$/g, "");
            
            // Skip template devices (containing {{ }})
            if (cleanDeviceValue.includes("{{") || cleanDeviceValue.includes("}}")) {
              continue;
            }
            
            // Skip devices that are variables or templates
            if (cleanDeviceValue.startsWith("!")) {
              continue;
            }
            
            // Skip special values like "none" or "all"
            if (cleanDeviceValue === "none" || cleanDeviceValue === "all") {
              continue;
            }
            
            // Check if device exists in Home Assistant
            if (!deviceIds.includes(cleanDeviceValue)) {
              const startColumn = match.index! + match[0].indexOf(deviceValue);
              const endColumn = startColumn + deviceValue.length;
              
              // Create a unique key for this position
              const positionKey = `${lineIndex}:${startColumn}:${endColumn}`;
              
              // Skip if we've already processed this position
              if (processedPositions.has(positionKey)) {
                continue;
              }
              
              processedPositions.add(positionKey);
              
              console.log(`Device validation: Found unknown device '${cleanDeviceValue}' at line ${lineIndex + 1}`);
              
              const diagnostic: Diagnostic = {
                severity: 2, // Warning
                range: Range.create(
                  lineIndex,
                  startColumn,
                  lineIndex,
                  endColumn,
                ),
                message: `Device '${cleanDeviceValue}' does not exist in your Home Assistant instance`,
                source: "home-assistant",
                code: "unknown-device",
              };
              
              diagnostics.push(diagnostic);
            }
          }
          
          // Also check for device arrays (device_id: [device1, device2])
          const arrayPropertyRegex = new RegExp(`\\s*${propertyName}\\s*:\\s*\\[([^\\]]+)\\]`, "g");
          let arrayMatch;
          
          while ((arrayMatch = arrayPropertyRegex.exec(line)) !== null) {
            const devicesInArray = arrayMatch[1];
            const deviceArray = devicesInArray.split(",").map(e => e.trim().replace(/^["']|["']$/g, ""));
            
            for (const deviceInArray of deviceArray) {
              const cleanDeviceValue = deviceInArray.trim();
              
              // Skip template devices and variables
              if (cleanDeviceValue.includes("{{") || cleanDeviceValue.includes("}}") || cleanDeviceValue.startsWith("!")) {
                continue;
              }
              
              // Skip special values like "none" or "all"
              if (cleanDeviceValue === "none" || cleanDeviceValue === "all") {
                continue;
              }
              
              // Check if device exists
              if (!deviceIds.includes(cleanDeviceValue)) {
                const deviceStartInArray = devicesInArray.indexOf(deviceInArray);
                const startColumn = arrayMatch.index! + arrayMatch[0].indexOf("[") + 1 + deviceStartInArray;
                const endColumn = startColumn + deviceInArray.length;
                
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
                  message: `Device '${cleanDeviceValue}' does not exist in your Home Assistant instance`,
                  source: "home-assistant",
                  code: "unknown-device",
                };
                
                diagnostics.push(diagnostic);
              }
            }
          }
        }
        
        // Handle multi-line device arrays
        if (line.trim().startsWith("- ")) {
          // Check if we're in a device list context by looking at previous lines
          let currentLineIndex = lineIndex - 1;
          let foundDeviceProperty = false;
          
          while (currentLineIndex >= 0 && lines[currentLineIndex].trim() !== "") {
            const prevLine = lines[currentLineIndex];
            
            for (const propertyName of DeviceCompletionContribution.propertyMatches) {
              if (new RegExp(`\\s*${propertyName}\\s*:\\s*$`).test(prevLine)) {
                foundDeviceProperty = true;
                break;
              }
            }
            
            if (foundDeviceProperty) {
              break;
            }
            currentLineIndex--;
          }
          
          if (foundDeviceProperty) {
            const deviceMatch = line.match(/^\s*-\s*([^#\n]+)/);
            if (deviceMatch) {
              const deviceValue = deviceMatch[1].trim().replace(/^["']|["']$/g, "");
              
              // Skip template devices and variables
              if (deviceValue.includes("{{") || deviceValue.includes("}}") || deviceValue.startsWith("!")) {
                continue;
              }
              
              // Skip special values like "none" or "all"
              if (deviceValue === "none" || deviceValue === "all") {
                continue;
              }
              
              // Check if device exists
              if (!deviceIds.includes(deviceValue)) {
                const startColumn = deviceMatch.index! + deviceMatch[0].indexOf(deviceValue);
                const endColumn = startColumn + deviceValue.length;
                
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
                  message: `Device '${deviceValue}' does not exist in your Home Assistant instance`,
                  source: "home-assistant",
                  code: "unknown-device",
                };
                
                diagnostics.push(diagnostic);
              }
            }
          }
        }
      }
    } catch (error) {
      // If validation fails (e.g., HA not connected), silently skip
      console.log("Device validation skipped:", error);
    }
    
    return diagnostics;
  };

  private validateFloorIds = async (
    document: TextDocument,
  ): Promise<Diagnostic[]> => {
    const diagnostics: Diagnostic[] = [];
    
    try {
      // Get all floors from Home Assistant
      const floorCompletions = await this.haConnection.getFloorCompletions();
      if (!floorCompletions || floorCompletions.length === 0) {
        // If we can't get floors (e.g., not connected), don't validate
        console.log("Floor validation skipped: No floors available from Home Assistant");
        return diagnostics;
      }

      const floorIds = floorCompletions.map(floor => floor.label as string);
      console.log(`Floor validation: Found ${floorIds.length} floors from Home Assistant`);
      
      const text = document.getText();
      const lines = text.split("\n");
      
      // Track positions where we've already added diagnostics to avoid duplicates
      const processedPositions = new Set<string>();

      // Iterate through each line to find floor references
      for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex];
        
        // Skip commented lines (lines that start with # after optional whitespace)
        if (line.trim().startsWith("#")) {
          continue;
        }
        
        // Find floor ID properties that need validation
        for (const propertyName of FloorCompletionContribution.propertyMatches) {
          // Check for single floor values first: floor_id: floor_name
          const propertyRegex = new RegExp(`\\s*${propertyName}\\s*:\\s*([^\\s\\n#\\[]+)`, "g");
          let match;
          
          while ((match = propertyRegex.exec(line)) !== null) {
            const floorValue = match[1].trim();
            
            // Remove quotes if present
            const cleanFloorValue = floorValue.replace(/^["']|["']$/g, "");
            
            // Skip template floors (containing {{ }})
            if (cleanFloorValue.includes("{{") || cleanFloorValue.includes("}}")) {
              continue;
            }
            
            // Skip floors that are variables or templates
            if (cleanFloorValue.startsWith("!")) {
              continue;
            }
            
            // Skip special values like "none" or "all"
            if (cleanFloorValue === "none" || cleanFloorValue === "all") {
              continue;
            }
            
            // Check if floor exists in Home Assistant
            if (!floorIds.includes(cleanFloorValue)) {
              const startColumn = match.index! + match[0].indexOf(floorValue);
              const endColumn = startColumn + floorValue.length;
              
              // Create a unique key for this position
              const positionKey = `${lineIndex}:${startColumn}:${endColumn}`;
              
              // Skip if we've already processed this position
              if (processedPositions.has(positionKey)) {
                continue;
              }
              
              processedPositions.add(positionKey);
              
              console.log(`Floor validation: Found unknown floor '${cleanFloorValue}' at line ${lineIndex + 1}`);
              
              const diagnostic: Diagnostic = {
                severity: 2, // Warning
                range: Range.create(
                  lineIndex,
                  startColumn,
                  lineIndex,
                  endColumn,
                ),
                message: `Floor '${cleanFloorValue}' does not exist in your Home Assistant instance`,
                source: "home-assistant",
                code: "unknown-floor",
              };
              
              diagnostics.push(diagnostic);
            }
          }
          
          // Also check for floor arrays (floor_id: [floor1, floor2])
          const arrayPropertyRegex = new RegExp(`\\s*${propertyName}\\s*:\\s*\\[([^\\]]+)\\]`, "g");
          let arrayMatch;
          
          while ((arrayMatch = arrayPropertyRegex.exec(line)) !== null) {
            const floorsInArray = arrayMatch[1];
            const floorArray = floorsInArray.split(",").map(e => e.trim().replace(/^["']|["']$/g, ""));
            
            for (const floorInArray of floorArray) {
              const cleanFloorValue = floorInArray.trim();
              
              // Skip template floors and variables
              if (cleanFloorValue.includes("{{") || cleanFloorValue.includes("}}") || cleanFloorValue.startsWith("!")) {
                continue;
              }
              
              // Skip special values like "none" or "all"
              if (cleanFloorValue === "none" || cleanFloorValue === "all") {
                continue;
              }
              
              // Check if floor exists
              if (!floorIds.includes(cleanFloorValue)) {
                const floorStartInArray = floorsInArray.indexOf(floorInArray);
                const startColumn = arrayMatch.index! + arrayMatch[0].indexOf("[") + 1 + floorStartInArray;
                const endColumn = startColumn + floorInArray.length;
                
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
                  message: `Floor '${cleanFloorValue}' does not exist in your Home Assistant instance`,
                  source: "home-assistant",
                  code: "unknown-floor",
                };
                
                diagnostics.push(diagnostic);
              }
            }
          }
        }
        
        // Handle multi-line floor arrays
        if (line.trim().startsWith("- ")) {
          // Check if we're in a floor list context by looking at previous lines
          let currentLineIndex = lineIndex - 1;
          let foundFloorProperty = false;
          
          while (currentLineIndex >= 0 && lines[currentLineIndex].trim() !== "") {
            const prevLine = lines[currentLineIndex];
            
            for (const propertyName of FloorCompletionContribution.propertyMatches) {
              if (new RegExp(`\\s*${propertyName}\\s*:\\s*$`).test(prevLine)) {
                foundFloorProperty = true;
                break;
              }
            }
            
            if (foundFloorProperty) {
              break;
            }
            currentLineIndex--;
          }
          
          if (foundFloorProperty) {
            const floorMatch = line.match(/^\s*-\s*([^#\n]+)/);
            if (floorMatch) {
              const floorValue = floorMatch[1].trim().replace(/^["']|["']$/g, "");
              
              // Skip template floors and variables
              if (floorValue.includes("{{") || floorValue.includes("}}") || floorValue.startsWith("!")) {
                continue;
              }
              
              // Skip special values like "none" or "all"
              if (floorValue === "none" || floorValue === "all") {
                continue;
              }
              
              // Check if floor exists
              if (!floorIds.includes(floorValue)) {
                const startColumn = floorMatch.index! + floorMatch[0].indexOf(floorValue);
                const endColumn = startColumn + floorValue.length;
                
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
                  message: `Floor '${floorValue}' does not exist in your Home Assistant instance`,
                  source: "home-assistant",
                  code: "unknown-floor",
                };
                
                diagnostics.push(diagnostic);
              }
            }
          }
        }
      }
    } catch (error) {
      // If validation fails (e.g., HA not connected), silently skip
      console.log("Floor validation skipped:", error);
    }
    
    return diagnostics;
  };

  private validateSecrets = async (
    document: TextDocument,
  ): Promise<Diagnostic[]> => {
    const diagnostics: Diagnostic[] = [];
    
    try {
      // Get all available secrets from secrets.yaml file
      const fileAccessor = this.haConfig.getFileAccessor();
      const secretsHelper = new SecretsCompletionContribution(fileAccessor);
      const availableSecrets = await secretsHelper.getAvailableSecrets();
      
      if (!availableSecrets || availableSecrets.length === 0) {
        // If we can't get secrets (e.g., no secrets.yaml file), don't validate
        console.log("Secrets validation skipped: No secrets available from secrets.yaml");
        return diagnostics;
      }

      console.log(`Secrets validation: Found ${availableSecrets.length} secrets from secrets.yaml`);
      
      const text = document.getText();
      const lines = text.split("\n");

      // Iterate through each line to find !secret references
      for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex];
        
        // Skip commented lines (lines that start with # after optional whitespace)
        if (line.trim().startsWith("#")) {
          continue;
        }
        
        // Find !secret tag usage: !secret secret_name
        const secretRegex = /!secret\s+([a-zA-Z0-9_]+)/g;
        let match;
        
        while ((match = secretRegex.exec(line)) !== null) {
          const secretName = match[1].trim();
          
          // Check if secret exists in secrets.yaml
          if (!availableSecrets.includes(secretName)) {
            console.log(`Secrets validation: Found unknown secret '${secretName}' at line ${lineIndex + 1}`);
            const startColumn = match.index! + match[0].indexOf(secretName);
            const endColumn = startColumn + secretName.length;
            
            const diagnostic: Diagnostic = {
              severity: 2, // Warning
              range: Range.create(
                lineIndex,
                startColumn,
                lineIndex,
                endColumn,
              ),
              message: `Secret '${secretName}' does not exist in your secrets.yaml file`,
              source: "home-assistant",
              code: "unknown-secret",
            };
            
            diagnostics.push(diagnostic);
          }
        }
      }
    } catch (error) {
      // If validation fails (e.g., HA not connected), silently skip
      console.log("Secrets validation skipped:", error);
    }
    
    return diagnostics;
  };

  private isInActionContext(lines: string[], currentLineIndex: number): boolean {
    // Check if we're within an automation action section or script sequence
    const currentLine = lines[currentLineIndex];
    
    // Get the indentation level of the current line
    const currentIndentMatch = currentLine.match(/^(\s*)/);
    const currentIndentLevel = currentIndentMatch ? currentIndentMatch[1].length : 0;
    
    // Track contexts as we go up
    let inActionOrSequenceBlock = false;
    let inAutomationOrScript = false;
    let lowestRelevantIndent = currentIndentLevel;
    
    // Look backwards through the file to understand context
    for (let i = currentLineIndex - 1; i >= 0; i--) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // Skip empty lines and comments
      if (trimmedLine === "" || trimmedLine.startsWith("#")) {
        continue;
      }
      
      // Get indentation of this line
      const indentMatch = line.match(/^(\s*)/);
      const lineIndent = indentMatch ? indentMatch[1].length : 0;
      
      // Only look at lines that could be parent contexts (less indented)
      if (lineIndent < lowestRelevantIndent) {
        lowestRelevantIndent = lineIndent;
        
        // Check for action/actions/sequence blocks
        if (trimmedLine.match(/^(action|actions|sequence)\s*:\s*$/)) {
          inActionOrSequenceBlock = true;
        }
        
        // Check for automation or script at root level
        if (lineIndent === 0) {
          if (trimmedLine.match(/^(automation|script)\s*:/)) {
            inAutomationOrScript = true;
          }
          // Stop if we hit another root-level key
          else if (!trimmedLine.startsWith("#")) {
            break;
          }
        }
      }
    }
    
    // We're in a valid action context if we're inside an action/sequence block
    // within an automation or script section
    return inActionOrSequenceBlock && inAutomationOrScript;
  }

  private validateLabelIds = async (
    document: TextDocument,
  ): Promise<Diagnostic[]> => {
    const diagnostics: Diagnostic[] = [];
    
    try {
      // Get all labels from Home Assistant
      const labelCompletions = await this.haConnection.getLabelCompletions();
      if (!labelCompletions || labelCompletions.length === 0) {
        // If we can't get labels (e.g., not connected), don't validate
        console.log("Label validation skipped: No labels available from Home Assistant");
        return diagnostics;
      }

      const labelIds = labelCompletions.map(label => label.label as string);
      console.log(`Label validation: Found ${labelIds.length} labels from Home Assistant`);
      
      const text = document.getText();
      const lines = text.split("\n");
      
      // Track positions where we've already added diagnostics to avoid duplicates
      const processedPositions = new Set<string>();

      // Iterate through each line to find label references
      for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex];
        
        // Skip commented lines (lines that start with # after optional whitespace)
        if (line.trim().startsWith("#")) {
          continue;
        }
        
        // Find label ID properties that need validation
        for (const propertyName of LabelCompletionContribution.propertyMatches) {
          // Check for single label values first: label_id: label_name
          const propertyRegex = new RegExp(`\\s*${propertyName}\\s*:\\s*([^\\s\\n#\\[]+)`, "g");
          let match;
          
          while ((match = propertyRegex.exec(line)) !== null) {
            const labelValue = match[1].trim();
            
            // Remove quotes if present
            const cleanLabelValue = labelValue.replace(/^["']|["']$/g, "");
            
            // Skip template labels (containing {{ }})
            if (cleanLabelValue.includes("{{") || cleanLabelValue.includes("}}")) {
              continue;
            }
            
            // Skip labels that are variables or templates
            if (cleanLabelValue.startsWith("!")) {
              continue;
            }
            
            // Skip special values like "none" or "all"
            if (cleanLabelValue === "none" || cleanLabelValue === "all") {
              continue;
            }
            
            // Skip empty strings and null values
            if (cleanLabelValue === "" || cleanLabelValue === "null" || cleanLabelValue === "~") {
              continue;
            }
            
            // Check if label exists in Home Assistant
            if (!labelIds.includes(cleanLabelValue)) {
              const startColumn = match.index! + match[0].indexOf(labelValue);
              const endColumn = startColumn + labelValue.length;
              
              // Create a unique key for this position
              const positionKey = `${lineIndex}:${startColumn}:${endColumn}`;
              
              // Skip if we've already processed this position
              if (processedPositions.has(positionKey)) {
                continue;
              }
              
              processedPositions.add(positionKey);
              
              console.log(`Label validation: Found unknown label '${cleanLabelValue}' at line ${lineIndex + 1}`);
              
              const diagnostic: Diagnostic = {
                severity: 2, // Warning
                range: Range.create(
                  lineIndex,
                  startColumn,
                  lineIndex,
                  endColumn,
                ),
                message: `Label '${cleanLabelValue}' does not exist in your Home Assistant instance`,
                source: "home-assistant",
                code: "unknown-label",
              };
              
              diagnostics.push(diagnostic);
            }
          }
          
          // Also check for label arrays (label_id: [label1, label2])
          const arrayPropertyRegex = new RegExp(`\\s*${propertyName}\\s*:\\s*\\[([^\\]]+)\\]`, "g");
          let arrayMatch;
          
          while ((arrayMatch = arrayPropertyRegex.exec(line)) !== null) {
            const labelsInArray = arrayMatch[1];
            const labelArray = labelsInArray.split(",").map(e => e.trim().replace(/^["']|["']$/g, ""));
            
            for (const labelInArray of labelArray) {
              const cleanLabelValue = labelInArray.trim();
              
              // Skip template labels and variables
              if (cleanLabelValue.includes("{{") || cleanLabelValue.includes("}}") || cleanLabelValue.startsWith("!")) {
                continue;
              }
              
              // Skip special values like "none" or "all"
              if (cleanLabelValue === "none" || cleanLabelValue === "all") {
                continue;
              }
              
              // Skip empty strings and null values
              if (cleanLabelValue === "" || cleanLabelValue === "null" || cleanLabelValue === "~") {
                continue;
              }
              
              // Check if label exists
              if (!labelIds.includes(cleanLabelValue)) {
                const labelStartInArray = labelsInArray.indexOf(labelInArray);
                const startColumn = arrayMatch.index! + arrayMatch[0].indexOf("[") + 1 + labelStartInArray;
                const endColumn = startColumn + labelInArray.length;
                
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
                  message: `Label '${cleanLabelValue}' does not exist in your Home Assistant instance`,
                  source: "home-assistant",
                  code: "unknown-label",
                };
                
                diagnostics.push(diagnostic);
              }
            }
          }
        }
        
        // Handle multi-line label arrays
        if (line.trim().startsWith("- ")) {
          // Check if we're in a label list context by looking at previous lines
          let currentLineIndex = lineIndex - 1;
          let foundLabelProperty = false;
          
          while (currentLineIndex >= 0 && lines[currentLineIndex].trim() !== "") {
            const prevLine = lines[currentLineIndex];
            
            for (const propertyName of LabelCompletionContribution.propertyMatches) {
              if (new RegExp(`\\s*${propertyName}\\s*:\\s*$`).test(prevLine)) {
                foundLabelProperty = true;
                break;
              }
            }
            
            if (foundLabelProperty) {
              break;
            }
            currentLineIndex--;
          }
          
          if (foundLabelProperty) {
            const labelMatch = line.match(/^\s*-\s*([^#\n]+)/);
            if (labelMatch) {
              const labelValue = labelMatch[1].trim().replace(/^["']|["']$/g, "");
              
              // Skip template labels and variables
              if (labelValue.includes("{{") || labelValue.includes("}}") || labelValue.startsWith("!")) {
                continue;
              }
              
              // Skip special values like "none" or "all"
              if (labelValue === "none" || labelValue === "all") {
                continue;
              }
              
              // Skip empty strings and null values
              if (labelValue === "" || labelValue === "null" || labelValue === "~") {
                continue;
              }
              
              // Check if label exists
              if (!labelIds.includes(labelValue)) {
                const startColumn = labelMatch.index! + labelMatch[0].indexOf(labelValue);
                const endColumn = startColumn + labelValue.length;
                
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
                  message: `Label '${labelValue}' does not exist in your Home Assistant instance`,
                  source: "home-assistant",
                  code: "unknown-label",
                };
                
                diagnostics.push(diagnostic);
              }
            }
          }
        }
      }
    } catch (error) {
      // If validation fails (e.g., HA not connected), silently skip
      console.log("Label validation skipped:", error);
    }
    
    return diagnostics;
  };

  private validateActionIds = async (
    document: TextDocument,
  ): Promise<Diagnostic[]> => {
    const diagnostics: Diagnostic[] = [];
    
    try {
      // Get all services from Home Assistant
      const services = await this.haConnection.getHassServices();
      if (!services) {
        // If we can't get actions (e.g., not connected), don't validate
        console.log("Action validation skipped: No actions available from Home Assistant");
        return diagnostics;
      }

      // Build a set of all available action IDs for quick lookup
      const actionIds = new Set<string>();
      for (const domain in services) {
        for (const serviceName in services[domain]) {
          actionIds.add(`${domain}.${serviceName}`);
        }
      }
      
      console.log(`Action validation: Found ${actionIds.size} actions from Home Assistant`);
      
      const text = document.getText();
      const lines = text.split("\n");
      
      // Track positions where we've already added diagnostics to avoid duplicates
      const processedPositions = new Set<string>();

      // Iterate through each line to find action references
      for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex];
        
        // Skip commented lines (lines that start with # after optional whitespace)
        if (line.trim().startsWith("#")) {
          continue;
        }
        
        // Check if we're in a valid context for action/service validation
        if (!this.isInActionContext(lines, lineIndex)) {
          continue;
        }
        
        // Find action properties that need validation (both "service" and "action")
        for (const propertyName of ServicesCompletionContribution.propertyMatches) {
          // Check for single action values first: action: domain.action_name
          const propertyRegex = new RegExp(`\\s*${propertyName}\\s*:\\s*([^\\s\\n#\\[]+)`, "g");
          let match;
          
          while ((match = propertyRegex.exec(line)) !== null) {
            const actionValue = match[1].trim();
            
            // Remove quotes if present
            const cleanActionValue = actionValue.replace(/^["']|["']$/g, "");
            
            // Skip template actions (containing {{ }})
            if (cleanActionValue.includes("{{") || cleanActionValue.includes("}}")) {
              continue;
            }
            
            // Skip secrets (!secret)
            if (cleanActionValue.startsWith("!")) {
              continue;
            }
            
            // Skip empty strings and null values
            if (cleanActionValue === "" || cleanActionValue === "null" || cleanActionValue === "~") {
              continue;
            }
            
            // Check if this looks like an action ID (domain.action_name format)
            if (!/^[a-z_]+\.[a-z0-9_]+$/.test(cleanActionValue)) {
              continue;
            }
            
            // Check if action exists
            if (!actionIds.has(cleanActionValue)) {
              const startColumn = match.index! + match[0].indexOf(actionValue);
              const endColumn = startColumn + actionValue.length;
              
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
                message: `Action '${cleanActionValue}' does not exist in your Home Assistant instance`,
                source: "home-assistant",
                code: "unknown-action",
              };
              
              diagnostics.push(diagnostic);
            }
          }
          
          // Check for array values: action: [domain.action1, domain.action2]
          const arrayRegex = new RegExp(`\\s*${propertyName}\\s*:\\s*\\[([^\\]]+)\\]`, "g");
          let arrayMatch;
          
          while ((arrayMatch = arrayRegex.exec(line)) !== null) {
            const actionsInArray = arrayMatch[1];
            const actionArray = actionsInArray.split(",").map(s => s.trim().replace(/^["']|["']$/g, ""));
            
            for (const actionInArray of actionArray) {
              const cleanActionValue = actionInArray.trim();
              
              // Skip template actions and variables
              if (cleanActionValue.includes("{{") || cleanActionValue.includes("}}") || cleanActionValue.startsWith("!")) {
                continue;
              }
              
              // Check if this looks like an action ID
              if (!/^[a-z_]+\.[a-z0-9_]+$/.test(cleanActionValue)) {
                continue;
              }
              
              // Check if action exists
              if (!actionIds.has(cleanActionValue)) {
                const actionStartInArray = actionsInArray.indexOf(actionInArray);
                const startColumn = arrayMatch.index! + arrayMatch[0].indexOf("[") + 1 + actionStartInArray;
                const endColumn = startColumn + actionInArray.length;
                
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
                  message: `Action '${cleanActionValue}' does not exist in your Home Assistant instance`,
                  source: "home-assistant",
                  code: "unknown-action",
                };
                
                diagnostics.push(diagnostic);
              }
            }
          }
        }
        
        // Handle multi-line action arrays
        if (line.trim().startsWith("- ")) {
          // Use the same context check as above
          if (!this.isInActionContext(lines, lineIndex)) {
            continue;
          }
          
          // Check if we're in an action list context by looking at previous lines
          let currentLineIndex = lineIndex - 1;
          let foundActionProperty = false;
          
          while (currentLineIndex >= 0 && lines[currentLineIndex].trim() !== "") {
            const prevLine = lines[currentLineIndex];
            
            for (const propertyName of ServicesCompletionContribution.propertyMatches) {
              if (new RegExp(`\\s*${propertyName}\\s*:\\s*$`).test(prevLine)) {
                foundActionProperty = true;
                break;
              }
            }
            
            if (foundActionProperty) {
              break;
            }
            currentLineIndex--;
          }
          
          if (foundActionProperty) {
            const actionMatch = line.match(/^\s*-\s*([^#\n]+)/);
            if (actionMatch) {
              const actionValue = actionMatch[1].trim().replace(/^["']|["']$/g, "");
              
              // Skip template actions and variables
              if (actionValue.includes("{{") || actionValue.includes("}}") || actionValue.startsWith("!")) {
                continue;
              }
              
              // Check if this looks like an action ID
              if (!/^[a-z_]+\.[a-z0-9_]+$/.test(actionValue)) {
                continue;
              }
              
              // Check if action exists
              if (!actionIds.has(actionValue)) {
                const startColumn = actionMatch.index! + actionMatch[0].indexOf(actionValue);
                const endColumn = startColumn + actionValue.length;
                
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
                  message: `Action '${actionValue}' does not exist in your Home Assistant instance`,
                  source: "home-assistant",
                  code: "unknown-action",
                };
                
                diagnostics.push(diagnostic);
              }
            }
          }
        }
      }
    } catch (error) {
      // If validation fails (e.g., HA not connected), silently skip
      console.log("Action validation skipped:", error);
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

    // First check for entity hover information
    const entityHover = await this.getEntityHoverInfo(document, position);
    if (entityHover) {
      return entityHover;
    }

    // Check for service hover information
    const serviceHover = await this.getServiceHoverInfo(document, position);
    if (serviceHover) {
      return serviceHover;
    }

    // Check if we're hovering over a YAML key or value
    const isOnKey = this.isHoveringOverYamlKey(document, position);
    
    // Only show schema hover info when hovering over keys
    if (isOnKey) {
      return this.yamlLanguageService.doHover(document, position);
    }

    // Don't show schema hover for values
    return null;
  };

  private isHoveringOverYamlKey(
    document: TextDocument,
    position: Position,
  ): boolean {
    try {
      const text = document.getText();
      const { line: lineNumber, character } = position;
      const line = text.split("\n")[lineNumber];
      
      // Skip if the line doesn't contain a colon (not a key-value pair)
      const colonIndex = line.indexOf(":");
      if (colonIndex === -1) {
        return false;
      }
      
      // Handle array items (lines starting with "- ")
      let effectiveLine = line;
      let characterOffset = 0;
      const arrayMatch = line.match(/^(\s*)- (.*)$/);
      if (arrayMatch) {
        // For array items, consider the part after "- " as the effective line
        effectiveLine = arrayMatch[2];
        characterOffset = arrayMatch[1].length + 2; // indent + "- "
        
        // Adjust character position relative to the effective line
        const adjustedCharacter = character - characterOffset;
        if (adjustedCharacter < 0) {
          return false; // cursor is before the actual content
        }
        
        const effectiveColonIndex = effectiveLine.indexOf(":");
        if (effectiveColonIndex === -1) {
          return false;
        }
        
        // Check if we're on the key part of the array item
        if (adjustedCharacter <= effectiveColonIndex) {
          const keyPart = effectiveLine.substring(0, effectiveColonIndex).trim();
          if (keyPart.length === 0) {
            return false;
          }
          
          const keyStart = effectiveLine.indexOf(keyPart);
          const keyEnd = keyStart + keyPart.length;
          return adjustedCharacter >= keyStart && adjustedCharacter <= keyEnd;
        }
        
        return false;
      }
      
      // Handle regular key-value pairs
      const beforeColon = character <= colonIndex;
      if (!beforeColon) {
        return false; // cursor is after the colon (on value side)
      }
      
      // Find the actual key text (trim whitespace and handle indentation)
      const lineBeforeColon = line.substring(0, colonIndex);
      const keyMatch = lineBeforeColon.match(/^(\s*)(.+?)(\s*)$/);
      
      if (!keyMatch) {
        return false;
      }
      
      const indentation = keyMatch[1];
      const keyText = keyMatch[2];
      
      if (keyText.length === 0) {
        return false;
      }
      
      // Calculate the actual key boundaries
      const keyStart = indentation.length;
      const keyEnd = keyStart + keyText.length;
      
      // Check if cursor is within the key text boundaries
      return character >= keyStart && character <= keyEnd;
      
    } catch (error) {
      console.log("Error determining YAML key position:", error);
      return false;
    }
  }

  private async getEntityHoverInfo(
    document: TextDocument,
    position: Position,
  ): Promise<Hover | null> {
    try {
      // Get the word at the position
      const text = document.getText();
      const offset = document.offsetAt(position);
      
      // Find the word boundaries
      let start = offset;
      let end = offset;
      
      // Move start backward to find start of word
      while (start > 0 && /[a-z0-9_.]/i.test(text[start - 1])) {
        start--;
      }
      
      // Move end forward to find end of word
      while (end < text.length && /[a-z0-9_.]/i.test(text[end])) {
        end++;
      }
      
      const word = text.substring(start, end);
      
      // Check if it looks like an entity ID (domain.entity_name pattern)
      if (!/^[a-z_]+\.[a-z0-9_]+$/.test(word)) {
        return null;
      }
      
      // Create a simple JSON path for the entity ID
      const location = [word];
      
      // Use EntityIdCompletionContribution to get hover info
      const entityContribution = new EntityIdCompletionContribution(this.haConnection);
      const markedStrings = await entityContribution.getInfoContribution(
        document.uri,
        location
      );
      
      if (markedStrings && markedStrings.length > 0) {
        const range = Range.create(
          document.positionAt(start),
          document.positionAt(end)
        );
        
        return {
          contents: markedStrings,
          range: range
        };
      }
      
      return null;
    } catch (error) {
      console.log("Error getting entity hover info:", error);
      return null;
    }
  }

  private async getServiceHoverInfo(
    document: TextDocument,
    position: Position,
  ): Promise<Hover | null> {
    try {
      // Get the word at the position
      const text = document.getText();
      const offset = document.offsetAt(position);
      
      // Find the word boundaries
      let start = offset;
      let end = offset;
      
      // Move start backward to find start of word
      while (start > 0 && /[a-z0-9_.]/i.test(text[start - 1])) {
        start--;
      }
      
      // Move end forward to find end of word
      while (end < text.length && /[a-z0-9_.]/i.test(text[end])) {
        end++;
      }
      
      const word = text.substring(start, end);
      
      // Check if it looks like a service ID (domain.service_name pattern)
      if (!/^[a-z_]+\.[a-z0-9_]+$/.test(word)) {
        return null;
      }
      
      // Create a simple JSON path for the service ID
      const location = [word];
      
      // Use ServicesCompletionContribution to get hover info
      const servicesContribution = new ServicesCompletionContribution(this.haConnection);
      const markedStrings = await servicesContribution.getInfoContribution(
        document.uri,
        location
      );
      
      if (markedStrings && markedStrings.length > 0) {
        const range = Range.create(
          document.positionAt(start),
          document.positionAt(end)
        );
        
        return {
          contents: markedStrings,
          range: range
        };
      }
      
      return null;
    } catch (error) {
      console.log("Error getting service hover info:", error);
      return null;
    }
  }

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

  private getSecretsCompletion = async (
    document: TextDocument,
    textDocumentPosition: Position,
  ): Promise<CompletionItem[]> => {
    const lineOffsets: number[] = getLineOffsets(document.getText());
    const start: number = lineOffsets[textDocumentPosition.line];
    const currentLineText = document.getText().substring(start, start + textDocumentPosition.character);
    
    // Check if the current line contains !secret followed by a space
    const secretMatch = currentLineText.match(/.*!secret\s+(\w*)$/);
    if (!secretMatch) {
      return [];
    }

    // We're positioned after !secret, provide secret completions
    const fileAccessor = this.haConfig.getFileAccessor();
    const secretsHelper = new SecretsCompletionContribution(fileAccessor);
    
    try {
      return await secretsHelper.getSecretsCompletions();
    } catch (error) {
      console.log("Error getting secrets completions:", error);
      return [];
    }
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

    // First check if we're after a !secret tag
    const secretsCompletion = await this.getSecretsCompletion(document, textDocumentPosition);
    if (secretsCompletion.length > 0) {
      return secretsCompletion;
    }

    const properties: { [provider: string]: string[] } = {};
    properties.areas = AreaCompletionContribution.propertyMatches;
    properties.entities = EntityIdCompletionContribution.propertyMatches;
    properties.floors = FloorCompletionContribution.propertyMatches;
    properties.labels = LabelCompletionContribution.propertyMatches;
    properties.services = ServicesCompletionContribution.propertyMatches;
    properties.domains = DomainCompletionContribution.propertyMatches;
    properties.uuids = UuidCompletionContribution.propertyMatches;
    properties.uuids = UuidCompletionContribution.propertyMatches;

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
      case "uuids":
        // Generate UUID completions for id and unique_id properties
        additionalCompletion = this.getUuidCompletions();
        break;
    }
    return additionalCompletion;
  };

  private getUuidCompletions = (): CompletionItem[] => {
    const uuidCompletion = new UuidCompletionContribution();
    
    // Generate a single UUID completion item that works for both id and unique_id
    const generatedUuid = uuidCompletion.generateUuid("id"); // Use "id" as default, but works for both
    const completion = CompletionItem.create(generatedUuid);
    completion.detail = "Generate UUID";
    completion.kind = CompletionItemKind.Function;
    completion.insertText = generatedUuid;
    completion.documentation = {
      kind: "markdown",
      value: `Generates a proper UUID: \`${generatedUuid}\``
    };
    completion.sortText = "0000"; // High priority to appear at top
    completion.data = {};
    completion.data.isUuid = true;
    
    return [completion];
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
