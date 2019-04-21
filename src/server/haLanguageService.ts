import * as path from "path";
import { TextDocuments, CompletionList } from "vscode-languageserver";
import { completionHelper } from "./completionHelper";
import { SchemaServiceForIncludes, Includetype, NestedYamlParser } from "./yamlDiscovery";
import { YAMLDocumentSymbols } from "yaml-language-server/out/server/src/languageservice/services/documentSymbols";
import { JSONSchemaService } from "yaml-language-server/out/server/src/languageservice/services/jsonSchemaService";
import { YAMLCompletion } from "yaml-language-server/out/server/src/languageservice/services/yamlCompletion";
import { YAMLHover } from "yaml-language-server/out/server/src/languageservice/services/yamlHover";
import { YAMLValidation } from "yaml-language-server/out/server/src/languageservice/services/yamlValidation";
import { parse as parseYAML } from "yaml-language-server/out/server/src/languageservice/parser/yamlParser";
import { format } from "yaml-language-server/out/server/src/languageservice/services/yamlFormatter";

export class HomeAssistantLanguageService {
    private workspaceContext = {
        resolveRelativePath: (relativePath: string, resource: string) => {
            return path.resolve(resource, relativePath);
        }
    };
    private schemaServiceForIncludes: any;
    private yamlValidation: any;
    private yamlDocumentSymbols: any;
    private yamlCompletion: any;
    private yamlHover: any;

    constructor(
        private documents: TextDocuments,
        private workspaceFolder: string,
        private nestedYamlParser: NestedYamlParser
    ) {
        let jsonSchemaService = new JSONSchemaService(null, this.workspaceContext, null);
        this.schemaServiceForIncludes = new SchemaServiceForIncludes(jsonSchemaService);

        this.yamlValidation = new YAMLValidation(jsonSchemaService);
        this.yamlValidation.configure({ validate: true });
        this.yamlDocumentSymbols = new YAMLDocumentSymbols();
        this.yamlCompletion = new YAMLCompletion(jsonSchemaService, []);
        this.yamlHover = new YAMLHover(jsonSchemaService, []);
    }

    public onDidChangeContent = async (textDocumentChangeEvent): Promise<any[]> => {
        if (!textDocumentChangeEvent.document) {
            return;
        }

        var parseResult = await this.nestedYamlParser.parse([
            path.join(this.workspaceFolder, "configuration.yaml"),
            path.join(this.workspaceFolder, "ui-lovelace.yaml")
        ]);

        this.schemaServiceForIncludes.onUpdate(parseResult.filePathMappings);

        if (textDocumentChangeEvent.document.getText().length === 0) {
            return;
        }

        let yamlDocument = parseYAML(
            textDocumentChangeEvent.document.getText(),
            this.getValidYamlTags()
        );
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
    };

    public onDocumentSymbol = (documentSymbolParams) => {
        let document = this.documents.get(documentSymbolParams.textDocument.uri);

        if (!document) {
            return;
        }

        let jsonDocument = parseYAML(document.getText());
        return this.yamlDocumentSymbols.findDocumentSymbols(document, jsonDocument);
    }

    public onDocumentFormatting= (formatParams) => {
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
