import * as path from "path";
import URI from "vscode-uri";
import { TextDocuments, CompletionList, TextDocumentChangeEvent, DidChangeWatchedFilesParams, DidOpenTextDocumentParams } from "vscode-languageserver";
import { completionHelper } from "./completionHelper";
import { Includetype, YamlIncludeDiscoveryService } from "./yamlIncludeDiscoveryService";
import { SchemaServiceForIncludes } from "./SchemaServiceForIncludes";
import { YAMLDocumentSymbols } from "yaml-language-server/out/server/src/languageservice/services/documentSymbols";
import { JSONSchemaService } from "yaml-language-server/out/server/src/languageservice/services/jsonSchemaService";
import { YAMLCompletion } from "yaml-language-server/out/server/src/languageservice/services/yamlCompletion";
import { YAMLHover } from "yaml-language-server/out/server/src/languageservice/services/yamlHover";
import { YAMLValidation } from "yaml-language-server/out/server/src/languageservice/services/yamlValidation";
import { parse as parseYAML } from "yaml-language-server/out/server/src/languageservice/parser/yamlParser";
import { format } from "yaml-language-server/out/server/src/languageservice/services/yamlFormatter";

export class HomeAssistantLanguageService {


    private schemaServiceForIncludes: any;
    private yamlValidation: any;
    private yamlDocumentSymbols: any;
    private yamlCompletion: any;
    private yamlHover: any;
    private jsonSchemaService: any;

    private initialized: boolean;

    private rootFiles = [
        "configuration.yaml", "ui-lovelace.yaml"
    ];

    constructor(
        private documents: TextDocuments,
        private workspaceFolder: string,
        private yamlIncludeDiscoveryService: YamlIncludeDiscoveryService
    ) {

        this.jsonSchemaService = new JSONSchemaService(null, {
            resolveRelativePath: (relativePath: string, resource: string) => {
                return path.resolve(resource, relativePath);
            }
        }, null);

        this.schemaServiceForIncludes = new SchemaServiceForIncludes(this.jsonSchemaService);

        this.yamlValidation = new YAMLValidation(this.jsonSchemaService);
        this.yamlValidation.configure({ validate: true });
        this.yamlDocumentSymbols = new YAMLDocumentSymbols();
        this.yamlCompletion = new YAMLCompletion(this.jsonSchemaService, []);
        this.yamlHover = new YAMLHover(this.jsonSchemaService, []);
    }

    public ensureInitialization = async () => {
        if (!this.initialized) {
            await this.updateSchemas();
            this.initialized = true;
        }
    }

    private updateSchemas = async (): Promise<void> => {
        var yamlIncludes = await this.yamlIncludeDiscoveryService.discover(this.rootFiles);
        this.schemaServiceForIncludes.onUpdate(yamlIncludes.filePathMappings);
    }

    public onDidChangeContent = async (textDocumentChangeEvent: TextDocumentChangeEvent): Promise<any[]> => {
        if (!textDocumentChangeEvent.document) {
            return;
        }

        if (this.rootFiles.some(x => textDocumentChangeEvent.document.uri.endsWith(x))) {
            await this.updateSchemas();
        }

        if (textDocumentChangeEvent.document.getText().length === 0) {
            return;
        }

        let yamlDocument = parseYAML(textDocumentChangeEvent.document.getText(), this.getValidYamlTags());
        if (!yamlDocument) {
            return;
        }

        var diagnosticResults = await this.yamlValidation.doValidation(
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
        return this.yamlDocumentSymbols.findDocumentSymbols(document, jsonDocument);
    }

    public onDocumentFormatting = (formatParams) => {
        let document = this.documents.get(formatParams.textDocument.uri);

        if (!document) {
            return;
        }

        return format(document, formatParams.options, this.getValidYamlTags());
    }

    public onCompletion = (textDocumentPosition) => {
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
        return this.yamlCompletion.doComplete(textDocument, textDocumentPosition.position, jsonDocument);
    }

    public onCompletionResolve = (completionItem) => {
        return this.yamlCompletion.doResolve(completionItem);
    }

    public onHover = (textDocumentPositionParams) => {
        let document = this.documents.get(textDocumentPositionParams.textDocument.uri);

        if (!document) {
            return Promise.resolve(void 0);
        }

        let jsonDocument = parseYAML(document.getText());

        return this.yamlHover.doHover(document, textDocumentPositionParams.position, jsonDocument);
    }

    public onDidChangeWatchedFiles = async (onDidChangeWatchedFiles: DidChangeWatchedFilesParams) => {
        if (this.rootFiles.some(x => onDidChangeWatchedFiles.changes.some(y => y.uri.endsWith(x)))) {
            await this.updateSchemas();
        }
    }

    public onDidOpenTextDocument = async (onDidOpenTextDocument: DidOpenTextDocumentParams) => {
        await this.ensureInitialization();
    }
    public onDidOpen = async (onDidOpen: any) => {
        await this.ensureInitialization();
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
