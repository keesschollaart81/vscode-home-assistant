import { YAMLDocumentSymbols } from "yaml-language-server/out/server/src/languageservice/services/documentSymbols";
import { JSONSchemaService } from "yaml-language-server/out/server/src/languageservice/services/jsonSchemaService";
import { YAMLCompletion } from "yaml-language-server/out/server/src/languageservice/services/yamlCompletion";
import { YAMLHover } from "yaml-language-server/out/server/src/languageservice/services/yamlHover";
import { YAMLValidation } from "yaml-language-server/out/server/src/languageservice/services/yamlValidation";
import { YAMLFormatter } from "yaml-language-server/out/server/src/languageservice/services/yamlFormatter";
import { TextDocument, TextEdit, Diagnostic } from "vscode-languageserver-types";
import { JSONWorkerContribution, SymbolInformation, Hover, CompletionItem, CompletionList } from "vscode-json-languageservice";
import { Includetype } from "./haConfig/dto";
import { LanguageSettings } from "yaml-language-server/out/server/src/languageservice/yamlLanguageService";
import { JsonLanguageService } from "./jsonLanguageService";


export class YamlLanguageService {

    private yamlValidation: YAMLValidation;
    private yamlDocumentSymbols: YAMLDocumentSymbols;
    private yamlCompletion: YAMLCompletion;
    private yamlHover: YAMLHover;
    private yamlFormatter: YAMLFormatter;

    constructor(jsonSchemaService: JSONSchemaService, jsonLanguageService: JsonLanguageService, completionContributions: JSONWorkerContribution[]) {

        var languageSettings = <LanguageSettings>{
            validate: true,
            customTags: this.getValidYamlTags(),
            completion: true,
            format: true,
            hover: true,
            isKubernetes: false
        };

        this.yamlValidation = new YAMLValidation(Promise, jsonLanguageService);
        this.yamlDocumentSymbols = new YAMLDocumentSymbols(jsonLanguageService);
        this.yamlCompletion = new YAMLCompletion(jsonSchemaService, completionContributions);
        this.yamlHover = new YAMLHover(Promise, jsonLanguageService);
        this.yamlFormatter = new YAMLFormatter();

        this.yamlValidation.configure(languageSettings);
        // enables auto completion suggestions for tags like !include ()
        // commeted because they end up at the top of the list which does not look nice :-)
        // this.yamlCompletion.configure(languageSettings, languageSettings.customTags);
        this.yamlHover.configure(languageSettings);
        this.yamlFormatter.configure(languageSettings);
    }

    public async doValidation(document: TextDocument): Promise<Diagnostic[]> {
        return await this.yamlValidation.doValidation(document);
    }

    public findDocumentSymbols(document: TextDocument): SymbolInformation[] {
        return this.yamlDocumentSymbols.findDocumentSymbols(document);
    }

    public doComplete = async (textDocument: TextDocument, position: any): Promise<CompletionList> => {
        return await this.yamlCompletion.doComplete(textDocument, position, false);
    }

    public doResolve(completionItem: any): Thenable<CompletionItem> {
        return this.yamlCompletion.doResolve(completionItem);
    }

    public doHover(document: TextDocument, position: any): Thenable<Hover> {
        return this.yamlHover.doHover(document, position);
    }

    public format = (document: TextDocument, options: any): TextEdit[] => {
        return this.yamlFormatter.format(document, options);
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