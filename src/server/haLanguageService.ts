import { TextDocuments, CompletionList, TextDocumentChangeEvent, DidChangeWatchedFilesParams, DidOpenTextDocumentParams } from "vscode-languageserver";
import { completionHelper } from "./completionHelper";
import { Includetype, YamlIncludeDiscoveryService } from "./yamlIncludeDiscoveryService";
import { parse as parseYAML } from "yaml-language-server/out/server/src/languageservice/parser/yamlParser";
import { format } from "yaml-language-server/out/server/src/languageservice/services/yamlFormatter";
import { YamlLanguageServiceWrapper } from "./yamlLanguageServerWrapper";
import { SchemaServiceForIncludes } from "./SchemaServiceForIncludes";
 
export class HomeAssistantLanguageService {
   
    private schemaServiceForIncludes: SchemaServiceForIncludes;

    private rootFiles = [
        "configuration.yaml", "ui-lovelace.yaml"
    ];

    constructor(
        private documents: TextDocuments,
        private workspaceFolder: string,
        private yamlLanguageService: YamlLanguageServiceWrapper,
        private yamlIncludeDiscoveryService: YamlIncludeDiscoveryService
    ) {
        this.schemaServiceForIncludes = new SchemaServiceForIncludes(this.yamlLanguageService.jsonSchemaService);
    }

    private pendingSchemaUpdate: NodeJS.Timer;

    public triggerSchemaLoad = async () => {
        // working with a timeout to debounce while typing
        clearTimeout(this.pendingSchemaUpdate);
        this.pendingSchemaUpdate = setTimeout(async () => { 
            var yamlIncludes = await this.yamlIncludeDiscoveryService.discover(this.rootFiles);
            this.schemaServiceForIncludes.onUpdate(yamlIncludes.filePathMappings);
        }, 200);
    } 

    public getDiagnostics = async (textDocumentChangeEvent: TextDocumentChangeEvent): Promise<any[]> => {
        if (!textDocumentChangeEvent.document) {
            return;
        }

        if (this.rootFiles.some(x => textDocumentChangeEvent.document.uri.endsWith(x))) {
            console.log(`Edit of ${textDocumentChangeEvent.document.uri}, updating schema's...`)
            await this.triggerSchemaLoad();
        }

        if (textDocumentChangeEvent.document.getText().length === 0) {
            return;
        }

        let yamlDocument = parseYAML(textDocumentChangeEvent.document.getText(), this.getValidYamlTags());
        if (!yamlDocument) {
            return;
        }

        var diagnosticResults = await this.yamlLanguageService.doValidation(
            textDocumentChangeEvent.document,
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

    public onDocumentFormatting = (formatParams) => {
        let document = this.documents.get(formatParams.textDocument.uri);

        if (!document) {
            return;
        }

        return format(document, formatParams.options, this.getValidYamlTags());
    }

    public onCompletion = async (textDocumentPosition):  Promise<CompletionList> => {
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
        var completions = await this.yamlLanguageService.doComplete(textDocument, textDocumentPosition.position, jsonDocument);
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

    public onDidChangeWatchedFiles = async (onDidChangeWatchedFiles: DidChangeWatchedFilesParams) => {
        if (this.rootFiles.some(x => onDidChangeWatchedFiles.changes.some(y => y.uri.endsWith(x)))) {
            await this.triggerSchemaLoad();
        }
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
}
