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
  TextDocumentChangeEvent,
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

      this.yamlLanguageService.configure(<LanguageSettings>{
        validate: true,
        customTags: this.getValidYamlTags(),
        completion: true,
        format: true,
        hover: true,
        isKubernetes: false,
        schemas: this.schemaServiceForIncludes.getSchemaContributions(haFiles),
      });

      this.diagnoseAllFiles();
    } catch (error) {
      const message: string = error.message;
      console.error(
        `Unexpected error updating the schemas, message: ${message}`,
        error,
      );
    }
    console.log(`Schemas updated!`);
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

  private onDocumentChangeDebounce: NodeJS.Timer | undefined;

  public onDocumentChange = (
    textDocumentChangeEvent: TextDocumentChangeEvent,
  ): void => {
    if (this.onDocumentChangeDebounce !== undefined) {
      clearTimeout(this.onDocumentChangeDebounce);
    }

    this.onDocumentChangeDebounce = setTimeout(async (): Promise<void> => {
      const singleFileUpdate = await this.haConfig.updateFile(
        textDocumentChangeEvent.document.uri,
      );
      if (singleFileUpdate.isValidYaml && singleFileUpdate.newFilesFound) {
        console.log(
          `Discover all configuration files because ${textDocumentChangeEvent.document.uri} got updated and new files were found...`,
        );
        await this.haConfig.discoverFiles();
        this.findAndApplySchemas();
      }

      const diagnostics = await this.getDiagnostics(
        textDocumentChangeEvent.document,
      );

      this.sendDiagnostics(textDocumentChangeEvent.document.uri, diagnostics);
    }, 600);
  };

  public onDocumentOpen = async (
    textDocumentChangeEvent: TextDocumentChangeEvent,
  ): Promise<void> => {
    const diagnostics = await this.getDiagnostics(
      textDocumentChangeEvent.document,
    );

    this.sendDiagnostics(textDocumentChangeEvent.document.uri, diagnostics);
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
      if (possibleSecret === "!secret") continue;

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
      if (possibleInput === "!input") continue;

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
      if (possibleInclude === "!include") continue;

      diagnosticItem.severity = 1; // Convert all warnings to errors
      diagnostics.push(diagnosticItem);
    }
    return diagnostics;
  };

  public onDocumentSymbol = (document: TextDocument): SymbolInformation[] => {
    if (!document) {
      return [];
    }

    return this.yamlLanguageService.findDocumentSymbols(document);
  };

  public onDocumentFormatting = (
    document: TextDocument,
    options: FormattingOptions,
  ): TextEdit[] => {
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

    return this.yamlLanguageService.doFormat(document, settings);
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
  ): Promise<CompletionItem> =>
    this.yamlLanguageService.doResolve(completionItem);

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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        definitions = definitions.concat(result);
      }
    }
    // eslint-disable-next-line consistent-return, @typescript-eslint/no-unsafe-return
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        if (!currentCompletions.items.some((x) => x.data && x.data.isArea)) {
          additionalCompletion = await this.haConnection.getAreaCompletions();
        }
        break;
      case "entities":
        // sometimes the entities are already added, do not add them twice
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        if (!currentCompletions.items.some((x) => x.data && x.data.isEntity)) {
          additionalCompletion = await this.haConnection.getEntityCompletions();
        }
        break;
      case "domains":
        // sometimes the domains are already added, do not add them twice
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        if (!currentCompletions.items.some((x) => x.data && x.data.isDomain)) {
          additionalCompletion = await this.haConnection.getDomainCompletions();
        }
        break;
      case "floors":
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        if (!currentCompletions.items.some((x) => x.data && x.data.isFloor)) {
          additionalCompletion = await this.haConnection.getFloorCompletions();
        }
        break;
      case "labels":
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        if (!currentCompletions.items.some((x) => x.data && x.data.isLabel)) {
          additionalCompletion = await this.haConnection.getLabelCompletions();
        }
        break;
      case "services":
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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

      // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
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
