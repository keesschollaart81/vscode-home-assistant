import * as path from "path";
import * as fs from "fs";
import { IncludeReferences } from "../haConfig/dto";

export class SchemaServiceForIncludes {
    private schemaContributions: any;
    constructor(private jsonSchemaService: any) { }

    public onUpdate(includeReferences: IncludeReferences) {
        this.schemaContributions = this.getSchemaContributions(includeReferences);
        this.jsonSchemaService.clearExternalSchemas(); // otherwise it will stack the schemes in memory for every file change
        this.jsonSchemaService.setSchemaContributions(this.schemaContributions);
    }

    private getPathToSchemaFileMappings(): PathToSchemaMapping[] {
        var jsonPath = path.join(__dirname, "mappings.json");
        var filecontents = fs.readFileSync(jsonPath, "utf-8");
        var pathToSchemaMappings: PathToSchemaMapping[] = JSON.parse(filecontents);
        return pathToSchemaMappings;
    }

    private getSchemaContributions(includeReferences: IncludeReferences) {
        var schemas = {};
        var schemaAssociations = {};
        var pathToSchemaFileMappings = this.getPathToSchemaFileMappings();

        pathToSchemaFileMappings.forEach(pathToSchemaMapping => {
            var jsonPath = path.join(__dirname, "json", pathToSchemaMapping.file);
            var filecontents = fs.readFileSync(jsonPath, "utf-8");
            var schema = JSON.parse(filecontents);
            schemas[`http://schemas.home-assistant.io/${pathToSchemaMapping.key}`] = schema;
        });

        for (var sourceFile in includeReferences) {
            var sourceFileMapping = includeReferences[sourceFile];
            var relatedPathToSchemaMapping = pathToSchemaFileMappings.find(x => {
                let sourceFileMappingPath = sourceFileMapping.path.replace("homeassistant/packages/", "");
                sourceFileMappingPath = sourceFileMapping.path.replace(/cards\/cards/g, "cards");
                var samePath = x.path === sourceFileMappingPath;
                if (!samePath) {
                    return false;
                }
                return true;
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
    file: string;
    tsFile: string;
    fromType: string;
}