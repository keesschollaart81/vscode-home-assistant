
import * as path from 'path';
import { SchemaRequestService, YAMLDocument, LanguageSettings } from 'yaml-language-server/out/server/src/languageservice/yamlLanguageService';
import { YAMLValidation } from 'yaml-language-server/out/server/src/languageservice/services/yamlValidation';
import { JSONSchemaService } from 'yaml-language-server/out/server/src/languageservice/services/jsonSchemaService';
import * as fs from "fs"

import { TextDocument, Diagnostic } from 'vscode-languageserver';

export function getLanguageService(workspaceContext, promiseConstructor?): LanguageService {
    let promise = promiseConstructor || Promise;

    let jsonSchemaService = new JSONSchemaService(null, workspaceContext, null);

    var jsonPath = path.join(__dirname, '..', 'lovelace-schema', 'ui-lovelace.json');
    var sc = fs.readFileSync(jsonPath,"utf-8");
    var schema = JSON.parse(sc);

    jsonSchemaService.setSchemaContributions({
        schemas: {
            "http://schema.ha.com/lovelace": schema
        },
        schemaAssociations:{ 
            "**/ui-lovelace.yaml": ["http://schema.ha.com/lovelace"]
        }
    });
   
    let yamlvalidation = new YAMLValidation(jsonSchemaService, promise);
    yamlvalidation.configure({ validate: true });

    return { 
        doValidation: yamlvalidation.doValidation.bind(yamlvalidation)  
    };
} 

export interface LanguageService { 
    doValidation(document: TextDocument, yamlDocument: YAMLDocument): Thenable<Diagnostic[]>;
}