import * as path from "path";
import * as fs from "fs";
import { JSONSchema } from "yaml-language-server/out/server/src/languageservice/jsonSchema";
import { HaFileInfo } from "../haConfig/dto";

export class SchemaServiceForIncludes {
  private mappings: Array<PathToSchemaMapping & { schema: JSONSchema }>;

  constructor() {
    const jsonPathMappings = path.join(__dirname, "mappings.json");
    const mappingFileContents = fs.readFileSync(jsonPathMappings, "utf-8");
    this.mappings = JSON.parse(mappingFileContents);
    this.mappings.forEach((mapping) => {
      const jsonPath = path.join(__dirname, "json", mapping.file);
      const filecontents = fs.readFileSync(jsonPath, "utf-8");
      const schema = <JSONSchema>JSON.parse(filecontents);
      mapping.schema = schema;
    });
  }

  public getSchemaContributions(haFiles: HaFileInfo[]): any {
    const results: Array<{
      uri: string;
      fileMatch?: string[];
      schema?: JSONSchema;
    }> = [];

    for (const [sourceFile, sourceFileMapping] of haFiles.entries()) {
      let sourceFileMappingPath = sourceFileMapping.path.replace(
        path.join("homeassistant", "packages") + path.sep,
        "",
      );
      sourceFileMappingPath = sourceFileMappingPath.replace(
        /cards(\/|\\)cards/g,
        "cards",
      );

      if (
        sourceFileMappingPath.startsWith(
          path.join("blueprints", "automation") + path.sep,
        )
      ) {
        sourceFileMappingPath = "blueprints/automation";
      }

      if (
        sourceFileMappingPath.startsWith(
          path.join("blueprints", "script") + path.sep,
        )
      ) {
        sourceFileMappingPath = "blueprints/script";
      }

      if (
        sourceFileMappingPath.startsWith("automations" + path.sep) ||
        sourceFileMappingPath === "automations.yaml"
      ) {
        sourceFileMappingPath = "configuration.yaml/automation";
      }

      if (sourceFileMappingPath.startsWith("custom_sentences" + path.sep)) {
        sourceFileMappingPath = "custom_sentences.yaml";
      }

      const relatedPathToSchemaMapping = this.mappings.find(
        (x) => x.path === sourceFileMappingPath,
      );
      if (relatedPathToSchemaMapping) {
        const id = `http://schemas.home-assistant.io/${relatedPathToSchemaMapping.key}`;
        let absolutePath = fs.realpathSync.native(haFiles[sourceFile].filename);
        absolutePath = absolutePath.replace(/\\/g, "/");
        const fileass = encodeURI(absolutePath);
        let resultEntry = results.find((x) => x.uri === id);

        console.log(
          `Assigning ${fileass} the ${relatedPathToSchemaMapping.path} schema`,
        );

        if (!resultEntry) {
          resultEntry = {
            uri: id,
            fileMatch: [fileass],
            schema: relatedPathToSchemaMapping.schema,
          };
          results.push(resultEntry);
        } else if (resultEntry.fileMatch !== undefined) {
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
