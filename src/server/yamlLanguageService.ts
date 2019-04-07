
import * as path from 'path';
import { SchemaRequestService, YAMLDocument, LanguageSettings } from 'yaml-language-server/out/server/src/languageservice/yamlLanguageService';
import { YAMLValidation } from 'yaml-language-server/out/server/src/languageservice/services/yamlValidation';
import { JSONSchemaService } from 'yaml-language-server/out/server/src/languageservice/services/jsonSchemaService';
import * as ls from 'vscode-json-languageservice';
import * as fs from "fs"

import { TextDocument, Diagnostic } from 'vscode-languageserver';

export function getLanguageService(schemaRequestService: SchemaRequestService, workspaceContext, clientSettings: ClientSettings, promiseConstructor?): LanguageService {
    let promise = promiseConstructor || Promise;

    let jsonSchemaService = new JSONSchemaService(schemaRequestService, workspaceContext, null);
    // jsonSchemaService.registerExternalSchema("");
    var sc = fs.readFileSync("../lovelace-schema/ui-lovelace.json","utf-8");
    var schema = JSON.parse(sc)
    jsonSchemaService.setSchemaContributions({
        schemas: {
            "http://schema.ha.com/lovelace": schema
        },
        schemaAssociations:{ 
            "http://schema.ha.com/lovelace": "ui-lovelace.yaml"
        }
    });
    // jsonSchemaService.registerCustomSchemaProvider((loc) =>{
    //     console.log(loc);
    //     return "";
    // })
   
    let yamlvalidation = new YAMLValidation(jsonSchemaService, promise);
    let languagesettings: LanguageSettings = {
        validate: clientSettings.validation
    };
    yamlvalidation.configure(languagesettings);

    return {
        configure: (settings: LanguageSettings, clientSettings: ClientSettings) => yamlvalidation.configure(settings),
        doValidation: yamlvalidation.doValidation.bind(yamlvalidation)
    };
}

export interface ClientSettings {
    validation: boolean;
};

export interface LanguageService {
    configure(settings: LanguageSettings, clientSettings: ClientSettings): void;
    doValidation(document: TextDocument, yamlDocument: YAMLDocument): Thenable<Diagnostic[]>;
}