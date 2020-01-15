import { CompletionList, TextDocumentChangeEvent, TextDocument, Position, CompletionItem, TextEdit, Definition, DefinitionLink, TextDocumentPositionParams, Diagnostic, Hover, FormattingOptions } from "vscode-languageserver-protocol";
import { SchemaServiceForIncludes } from "./schemas/schemaService";
import { EntityIdCompletionContribution } from "./completionHelpers/entityIds";
import { getLineOffsets } from "yaml-language-server/out/server/src/languageservice/utils/arrUtils";
import { HaConnection } from "./home-assistant/haConnection";
import { ServicesCompletionContribution } from "./completionHelpers/services";
import { DefinitionProvider } from "./definition/definition";
import { HomeAssistantConfiguration } from "./haConfig/haConfig";
import { LanguageService, LanguageSettings } from "yaml-language-server/out/server/src/languageservice/yamlLanguageService";
import { Includetype } from "./haConfig/dto";


export class HomeAssistantLanguageService {

    constructor(
        private yamlLanguageService: LanguageService,
        private haConfig: HomeAssistantConfiguration,
        private haConnection: HaConnection,
        private definitionProviders: DefinitionProvider[],
        private schemaServiceForIncludes: SchemaServiceForIncludes,
        private sendDiagnostics: (fileUri: string, diagnostics: Diagnostic[]) => Promise<void>,
        private diagnoseAllFiles: () => Promise<void>
    ) { }

    public findAndApplySchemas = async () => {

        try {
            var haFiles = await this.haConfig.getAllFiles();
            if (haFiles && haFiles.length > 0) {
                console.log(`Applying schema's to ${haFiles.length} of your configuration files...`);
            }  
            
            this.yamlLanguageService.configure(<LanguageSettings>{
                validate: true,
                customTags: this.getValidYamlTags(),
                completion: true,
                format: true,
                hover: true,
                isKubernetes: false,
                schemas: this.schemaServiceForIncludes.getSchemaContributions(haFiles)
            });

            this.diagnoseAllFiles();
        }
        catch (err) {
            console.error(`Unexpected error updating the schema's, message: ${err}`, err);
        }
        console.log(`Schema's updated!`);
    }
    
    private getValidYamlTags(): string[] {
        var validTags: string[] = [];
        for (let item in Includetype) {
            if (isNaN(Number(item))) {
                validTags.push(`!${item} scalar`);
            }
        }
        validTags.push("!secret scalar");
        validTags.push("!env_var scalar");
        
        return validTags;
    }

    private onDocumentChangeDebounce: NodeJS.Timer;

    public onDocumentChange = async (textDocumentChangeEvent: TextDocumentChangeEvent): Promise<void> => {

        clearTimeout(this.onDocumentChangeDebounce);

        this.onDocumentChangeDebounce = setTimeout(async () => {
            var singleFileUpdate = await this.haConfig.updateFile(textDocumentChangeEvent.document.uri);
            if (singleFileUpdate.isValidYaml && singleFileUpdate.newFilesFound) {
                console.log(`Discover all configuration files because ${textDocumentChangeEvent.document.uri} got updated and new files were found...`);
                await this.haConfig.discoverFiles();
                await this.findAndApplySchemas();
            }

            var diagnostics = await this.getDiagnostics(textDocumentChangeEvent.document);

            this.sendDiagnostics(textDocumentChangeEvent.document.uri, diagnostics);
        }, 600);

    }

    public onDocumentOpen = async (textDocumentChangeEvent: TextDocumentChangeEvent): Promise<void> => {
        var diagnostics = await this.getDiagnostics(textDocumentChangeEvent.document);

        this.sendDiagnostics(textDocumentChangeEvent.document.uri, diagnostics);
    }


    public getDiagnostics = async (document: TextDocument): Promise<Diagnostic[]> => {

        if (!document || document.getText().length === 0) {
            return;
        }

        var diagnosticResults = await this.yamlLanguageService.doValidation(document, false);

        if (!diagnosticResults) {
            return;
        }
        let diagnostics = [];

        for (let diagnosticItem in diagnosticResults) {
            diagnosticResults[diagnosticItem].severity = 1; //Convert all warnings to errors
            diagnostics.push(diagnosticResults[diagnosticItem]);
        }

        return diagnostics;
    }

    public onDocumentSymbol = (document: TextDocument) => {

        if (!document) {
            return;
        }

        return this.yamlLanguageService.findDocumentSymbols(document);
    }

    public onDocumentFormatting = (document: TextDocument, options: FormattingOptions): TextEdit[] => {

        if (!document) {
            return;
        }

        // copied defaults from YAML Language Service
        let settings = {
            tabWidth: options.tabSize,
            singleQuote: false,
            bracketSpacing: true,
            proseWrap: 'preserve',
            printWidth: 80,
            enable: true
        };

        return this.yamlLanguageService.doFormat(document, settings);
    }

    public onCompletion = async (textDocument: TextDocument, position: Position): Promise<CompletionList> => {

        let result: CompletionList = {
            items: [],
            isIncomplete: false
        };

        if (!textDocument) {
            return Promise.resolve(result);
        }

        var completions: CompletionList = await this.yamlLanguageService.doComplete(textDocument, position, false);

        var additionalCompletions = await this.getServiceAndEntityCompletions(textDocument, position, completions);
        if (additionalCompletions.length > 0) {
            completions.items.push(...additionalCompletions);
        }
        return completions;
    }

    public onCompletionResolve = async (completionItem): Promise<CompletionItem> => {
        return await this.yamlLanguageService.doResolve(completionItem);
    }

    public onHover = async (document: TextDocument, position: Position): Promise<Hover> => {

        if (!document) {
            return;
        }

        return await this.yamlLanguageService.doHover(document, position);
    }

    public onDefinition = async (textDocument: TextDocument, position: Position): Promise<Definition | DefinitionLink[] | undefined> => {

        if (!textDocument) {
            return;
        }
        const lineOffsets: number[] = getLineOffsets(textDocument.getText());
        const start: number = lineOffsets[position.line];
        const end: number = lineOffsets[position.line + 1];
        let thisLine = textDocument.getText().substring(start, end);

        var definitions = [];
        for (var p in this.definitionProviders) {
            let provider = this.definitionProviders[p];
            var providerResults = await provider.onDefinition(thisLine, textDocument.uri);
            if (providerResults) {
                definitions = definitions.concat(providerResults);
            }
        }
        return definitions;
    }

    private getServiceAndEntityCompletions = async (document: TextDocument, textDocumentPosition: Position, currentCompletions: CompletionList): Promise<CompletionItem[]> => {
        // sadly this is needed here. 
        // the normal completion engine cannot provide completions for type `string | string[]`
        // updating the type to only one of the 2 types will break the yaml-validation.
        // so we tap in here, iterate over the lines of the text file to see if this if 
        // we need to add entity_id's to the completion list

        var properties: { [provider: string]: string[] } = {};
        properties["entities"] = EntityIdCompletionContribution.propertyMatches;
        properties["services"] = ServicesCompletionContribution.propertyMatches;

        var additionalCompletionProvider = this.findAutoCompletionProperty(document, textDocumentPosition, properties);
        let additionalCompletion: CompletionItem[] = [];
        switch (additionalCompletionProvider) {
            case "entities":
                // sometimes the entities are already added, do not add them twice
                if (!currentCompletions.items.some(x => x.data && x.data.isEntity)) {
                    additionalCompletion = await this.haConnection.getEntityCompletions();
                }
                break;
            case "services":
                if (!currentCompletions.items.some(x => x.data && x.data.isService)) {
                    additionalCompletion = await this.haConnection.getServiceCompletions();
                }
                break;
        }
        return additionalCompletion;
    }

    private findAutoCompletionProperty = (document: TextDocument, textDocumentPosition: Position, properties: { [provider: string]: string[] }): string => {
        let currentLine = textDocumentPosition.line;
        while (currentLine >= 0) {
            const lineOffsets: number[] = getLineOffsets(document.getText());
            const start: number = lineOffsets[currentLine];
            var end = 0;
            if (lineOffsets[currentLine + 1] !== undefined) {
                end = lineOffsets[currentLine + 1] -1;
            } else {
                end = document.getText().length;
            }
            let thisLine = document.getText().substring(start, end);

            let isOtherItemInList = thisLine.match(/-\s*([-"\w]+)?(\.)?([-"\w]+?)?\s*$/);
            if (isOtherItemInList) {
                currentLine--;
                continue;
            }
            for (var key in properties) {
                if (properties[key].some(propertyName => new RegExp(`(.*)${propertyName}(:)([\s]*)([\w]*)(\s*)`).test(thisLine))) {
                    return key;
                }
            }
            return undefined;
        }
        return undefined;
    }
}
