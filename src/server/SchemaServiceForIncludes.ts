import * as path from "path";
import * as fs from "fs";
import { FilePathMapping, Includetype } from "./yamlIncludeDiscoveryService";

export class SchemaServiceForIncludes {
    private schemaContributions: any;
    constructor(private jsonSchemaService: any) { }

    public onUpdate(fileMappings: FilePathMapping) {
        this.schemaContributions = this.getSchemaContributions(fileMappings);
        this.jsonSchemaService.setSchemaContributions(this.schemaContributions);
    }

    private getPathToSchemaFileMappings(): PathToSchemaMapping[] {
        return [
            {
                key: "automations-named",
                path: "configuration.yaml/automation",
                isList: false,
                file: "automations-named.json"
            },
            {
                key: "automations-list",
                path: "configuration.yaml/automation",
                isList: true,
                file: "automations-list.json"
            },
            {
                key: "ui-lovelace",
                path: "ui-lovelace.yaml",
                isList: false,
                file: "ui-lovelace.json"
            }
        ];
    }

    private getSchemaContributions(fileMappings: FilePathMapping) {
        var schemas = {};
        var schemaAssociations = {};
        var pathToSchemaFileMappings = this.getPathToSchemaFileMappings();

        pathToSchemaFileMappings.forEach(pathToSchemaMapping => {
            var jsonPath = path.join(__dirname, "..", "schemas", pathToSchemaMapping.file);
            var filecontents = fs.readFileSync(jsonPath, "utf-8");
            var schema = JSON.parse(filecontents);
            schemas[`http://schemas.home-assistant.io/${pathToSchemaMapping.key}`] = schema;
        });

        for (var sourceFile in fileMappings) {
            var sourceFileMapping = fileMappings[sourceFile];
            var relatedPathToSchemaMapping = pathToSchemaFileMappings.find(x => {
                var samePath = x.path === sourceFileMapping.path;
                if (!samePath) {
                    return false;
                }
                switch (sourceFileMapping.includeType) {
                    case null:
                    case Includetype.include:
                    case Includetype.include_dir_merge_named:
                    case Includetype.include_dir_named:
                        return !x.isList;
                    case Includetype.include_dir_list:
                    case Includetype.include_dir_merge_list:
                        return x.isList;
                }
            });
            if (relatedPathToSchemaMapping) {
                schemaAssociations[`**/${sourceFile}`] = [`http://schemas.home-assistant.io/${relatedPathToSchemaMapping.key}`];
            }
        }
        return {
            schemas: schemas,
            schemaAssociations: schemaAssociations
        };
    }
}


export interface PathToSchemaMapping {
    key: string;
    path: string;
    isList: boolean;
    file: string;
}