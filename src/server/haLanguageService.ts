import { TextDocuments, CompletionList, TextDocumentChangeEvent, DidChangeWatchedFilesParams, DidOpenTextDocumentParams, TextDocument, Position, CompletionItem, TextEdit, Definition, DefinitionLink, TextDocumentPositionParams, Location, IConnection, Diagnostic } from "vscode-languageserver";
import { completionHelper } from "./completionHelpers/utils";
import { YamlIncludeDiscovery } from "./yamlIncludes/discovery";
import { parse as parseYAML } from "yaml-language-server/out/server/src/languageservice/parser/yamlParser";
import { YamlLanguageServiceWrapper } from "./yamlLanguageServiceWrapper";
import { SchemaServiceForIncludes } from "./schemas/schemaService";
import { EntityIdCompletionContribution } from "./completionHelpers/entityIds";
import { getLineOffsets } from "yaml-language-server/out/server/src/languageservice/utils/arrUtils";
import { HaConnection } from "./home-assistant/haConnection";
import { ServicesCompletionContribution } from "./completionHelpers/services";
import { Includetype } from "./yamlIncludes/dto";
import { DefinitionProvider } from "./definition";
export class HomeAssistantLanguageService {

    private schemaServiceForIncludes: SchemaServiceForIncludes;

    private rootFiles = [
        "configuration.yaml", "ui-lovelace.yaml"
    ];

    constructor(
        private documents: TextDocuments,
        private yamlLanguageService: YamlLanguageServiceWrapper,
        private yamlIncludeDiscovery: YamlIncludeDiscovery,
        private haConnection: HaConnection,
        private definitionProvider: DefinitionProvider
    ) {
        this.schemaServiceForIncludes = new SchemaServiceForIncludes(this.yamlLanguageService.jsonSchemaService);
    }

    private pendingSchemaUpdate: NodeJS.Timer;

    public triggerSchemaLoad = async (connection: IConnection, becauseOfFilename?: string) => {
        // working with a timeout to debounce while typing
        clearTimeout(this.pendingSchemaUpdate);
        this.pendingSchemaUpdate = setTimeout(async () => {
            console.log(`Updating schema's ${(becauseOfFilename) ? ` because ${becauseOfFilename} got updated` : ""}...`);
            try {
                var yamlIncludes = await this.yamlIncludeDiscovery.discoverFiles(this.rootFiles);
                if (yamlIncludes && Object.keys(yamlIncludes).length > 0) {
                    console.log(`Applying schema's to ${Object.keys(yamlIncludes).length} of your configuration files...`);
                }
                this.schemaServiceForIncludes.onUpdate(yamlIncludes);
                this.documents.all().forEach(async d => {
                    var diagnostics = await this.getDiagnostics(d);
                    this.sendDiagnostics(d.uri, diagnostics, connection);
                });
            }
            catch (err) {
                console.error(`Unexpected error updating the schema, message: ${err}`, err);
            }
            console.log(`Schema's updated!`);
        }, 200);
    }

    public onDocumentChange = async (textDocumentChangeEvent: TextDocumentChangeEvent, connection: IConnection): Promise<void> => {
        await this.triggerSchemaLoad(connection, textDocumentChangeEvent.document.uri);

        var diagnostics = await this.getDiagnostics(textDocumentChangeEvent.document);

        this.sendDiagnostics(textDocumentChangeEvent.document.uri, diagnostics, connection);
    }

    public onDocumentOpen = async (textDocumentChangeEvent: TextDocumentChangeEvent, connection: IConnection): Promise<void> => {
        var diagnostics = await this.getDiagnostics(textDocumentChangeEvent.document);

        this.sendDiagnostics(textDocumentChangeEvent.document.uri, diagnostics, connection);
    }

    private sendDiagnostics(uri: string, diagnostics: Diagnostic[], connection: IConnection) {
        connection.sendDiagnostics({
            uri: uri,
            diagnostics: diagnostics
        });
    }

    public getDiagnostics = async (document: TextDocument): Promise<Diagnostic[]> => {

        if (!document || document.getText().length === 0) {
            return;
        }

        let yamlDocument = parseYAML(document.getText(), this.getValidYamlTags());
        if (!yamlDocument) {
            return;
        }

        var diagnosticResults = await this.yamlLanguageService.doValidation(
            document,
            yamlDocument
        );

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

    public onDocumentSymbol = (documentSymbolParams) => {
        let document = this.documents.get(documentSymbolParams.textDocument.uri);

        if (!document) {
            return;
        }

        let jsonDocument = parseYAML(document.getText());
        return this.yamlLanguageService.findDocumentSymbols(document, jsonDocument);
    }

    public onDocumentFormatting = (formatParams): TextEdit[] => {
        let document = this.documents.get(formatParams.textDocument.uri);

        if (!document) {
            return;
        }

        return this.yamlLanguageService.format(document, formatParams.options);
    }

    public onCompletion = async (textDocumentPosition): Promise<CompletionList> => {
        let textDocument = this.documents.get(
            textDocumentPosition.textDocument.uri
        );

        let result: CompletionList = {
            items: [],
            isIncomplete: false
        };

        if (!textDocument) {
            return Promise.resolve(result);
        }

        let completionFix = completionHelper(textDocument, textDocumentPosition.position);

        let newText = completionFix.newText;
        let jsonDocument = parseYAML(newText);

        var completions: CompletionList = await this.yamlLanguageService.doComplete(textDocument, textDocumentPosition.position, jsonDocument);

        var additionalCompletions = await this.getServiceAndEntityCompletions(textDocument, textDocumentPosition.position, completions);
        if (additionalCompletions.length > 0) {
            completions.items.push(...additionalCompletions);
        }
        return completions;
    }

    public onCompletionResolve = (completionItem) => {
        return this.yamlLanguageService.doResolve(completionItem);
    }

    public onHover = (textDocumentPositionParams) => {
        let document = this.documents.get(textDocumentPositionParams.textDocument.uri);

        if (!document) {
            return Promise.resolve(void 0);
        }

        let jsonDocument = parseYAML(document.getText());

        return this.yamlLanguageService.doHover(document, textDocumentPositionParams.position, jsonDocument);
    }

    public onDefinition = async (textDocumentPositionParams: TextDocumentPositionParams): Promise<Definition | DefinitionLink[] | undefined> => {
        let textDocument = this.documents.get(textDocumentPositionParams.textDocument.uri);

        if (!textDocument) {
            return;
        }
        const lineOffsets: number[] = getLineOffsets(textDocument.getText());
        const start: number = lineOffsets[textDocumentPositionParams.position.line];
        const end: number = lineOffsets[textDocumentPositionParams.position.line + 1];
        let thisLine = textDocument.getText().substring(start, end);

        return await this.definitionProvider.onDefinition(thisLine, textDocument.uri);
    }

    private getValidYamlTags(): string[] {
        var validTags: string[] = [];
        for (let item in Includetype) {
            if (isNaN(Number(item))) {
                validTags.push(`!${item} scalar`);
            }
        }
        validTags.push("!secret scalar");
        return validTags;
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
                end = lineOffsets[currentLine + 1];
            } else {
                end = document.getText().length;
            }
            let thisLine = document.getText().substring(start, end);

            let isOtherItemInList = thisLine.match(/-\s*([-\w]+)?(\.)?([-\w]+?)?\s*$/);
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
