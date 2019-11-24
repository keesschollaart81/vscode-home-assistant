import * as path from "path";
import * as fs from "fs";
import { HaFileInfo } from "../haConfig/dto";
import { ISchemaContributions } from 'vscode-json-languageservice/lib/umd/services/jsonSchemaService';
import { JSONSchema } from "yaml-language-server/out/server/src/languageservice/jsonSchema07";

export class SchemaServiceForIncludes {

    private mappings: Array<PathToSchemaMapping & { schema: JSONSchema }>;

    constructor() {
        let jsonPath = path.join(__dirname, "mappings.json");
        let filecontents = fs.readFileSync(jsonPath, "utf-8");
        this.mappings = JSON.parse(filecontents);
        this.mappings.forEach(mapping => {
            var jsonPath = path.join(__dirname, "json", mapping.file);
            var filecontents = fs.readFileSync(jsonPath, "utf-8");
            var schema = <JSONSchema>JSON.parse(filecontents);
            mapping.schema = schema;
        });
    }

    public getSchemaContributions(haFiles: HaFileInfo[]): ISchemaContributions {
        let results: Array<{ uri: string, fileMatch?: string[], schema?: JSONSchema }> = [];

        for (var sourceFile in haFiles) {
            var sourceFileMapping = haFiles[sourceFile];
            let sourceFileMappingPath = sourceFileMapping.path.replace("homeassistant/packages/", "");
            sourceFileMappingPath = sourceFileMappingPath.replace(/cards\/cards/g, "cards");

            var relatedPathToSchemaMapping = this.mappings.find(x => x.path === sourceFileMappingPath);
            if (relatedPathToSchemaMapping) {
                let id = `http://schemas.home-assistant.io/${relatedPathToSchemaMapping.key}`;
                let relativePath = path.relative(process.cwd(), haFiles[sourceFile].filename);
                let fileass = `**/${encodeURI(relativePath)}`;
                let resultEntry = results.find(x => x.uri === id);

                if (!resultEntry) {
                    resultEntry = {
                        uri: id,
                        fileMatch: [fileass],
                        schema: relatedPathToSchemaMapping.schema
                    };
                    results.push(resultEntry);
                }
                else {
                    resultEntry.fileMatch.push(fileass);
                }
            }
        }
        return results;
    }
}

export interface PathToSchemaMapping {
    key: string;
    path: string;
    file: string;
    tsFile: string;
    fromType: string;
}