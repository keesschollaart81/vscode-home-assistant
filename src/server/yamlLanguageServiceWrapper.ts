import { SchemaServiceForIncludes } from "./schemas/schemaService";
import { YAMLDocumentSymbols } from "yaml-language-server/out/server/src/languageservice/services/documentSymbols";
import { JSONSchemaService } from "yaml-language-server/out/server/src/languageservice/services/jsonSchemaService";
import { YAMLCompletion } from "yaml-language-server/out/server/src/languageservice/services/yamlCompletion";
import { YAMLHover } from "yaml-language-server/out/server/src/languageservice/services/yamlHover";
import { YAMLValidation } from "yaml-language-server/out/server/src/languageservice/services/yamlValidation";
import { YAMLFormatter } from "yaml-language-server/out/server/src/languageservice/services/yamlFormatter";
import * as path from "path";
import { EntityIdCompletionContribution } from "./completionHelpers/entityIds";
import { TextDocument, TextEdit, Diagnostic } from "vscode-languageserver-types";
import { JSONWorkerContribution } from "vscode-json-languageservice";

export class YamlLanguageServiceWrapper {

    private yamlValidation: any;
    private yamlDocumentSymbols: any;
    private yamlCompletion: any;
    private yamlHover: any;
    private yamlFormatter: any;
    public jsonSchemaService: JSONSchemaService;

    constructor(completionContributions: JSONWorkerContribution[]) {
        this.jsonSchemaService = new JSONSchemaService(null, {
            resolveRelativePath: (relativePath: string, resource: string) => {
                return path.resolve(resource, relativePath);
            }
        }, null);


        this.yamlValidation = new YAMLValidation(this.jsonSchemaService);
        this.yamlValidation.configure({ validate: true });
        this.yamlDocumentSymbols = new YAMLDocumentSymbols();
        this.yamlCompletion = new YAMLCompletion(this.jsonSchemaService, completionContributions);
        // enables auto completion suggestions for tags like !include ()
        // commeted because they end up at the top of the list which does not look nice :-)
        // this.yamlCompletion.configure(null, this.getValidYamlTags()); 
        this.yamlHover = new YAMLHover(this.jsonSchemaService);
        this.yamlFormatter = new YAMLFormatter();
    }

    public doValidation(document: TextDocument, yamlDocument: any): Diagnostic[] {
        return this.yamlValidation.doValidation(document, yamlDocument);
    }

    public findDocumentSymbols(document: TextDocument, jsonDocument: any): any {
        return this.yamlDocumentSymbols.findDocumentSymbols(document, jsonDocument);
    }

    public doComplete = async (textDocument: TextDocument, position: any, jsonDocument: any): Promise<any> => {
        return await this.yamlCompletion.doComplete(textDocument, position, jsonDocument);
    }

    public doResolve(completionItem: any): any {
        return this.yamlCompletion.doResolve(completionItem);
    }

    public doHover(document: TextDocument, position: any, jsonDocument: any): any {
        return this.yamlHover.doHover(document, position, jsonDocument);
    }

    public format = (document: TextDocument, options: any): TextEdit[] => {
        return this.yamlFormatter.format(document, options);
    }
}