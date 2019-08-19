import { resolve } from "path";
import * as TJS from "typescript-json-schema";
import * as fs from "fs";
import { PathToSchemaMapping } from "./schemaService";
import * as path from "path";

const settings: TJS.PartialArgs = {
    required: true,
    noExtraProps: true
};

const compilerOptions: TJS.CompilerOptions = {
    strictNullChecks: true
}

var jsonPath = path.join(__dirname, "mappings.json");
var filecontents = fs.readFileSync(jsonPath, "utf-8");

var pathToSchemaMappings: PathToSchemaMapping[] = JSON.parse(filecontents); 
pathToSchemaMappings.forEach(mapping => {
    let program = TJS.getProgramFromFiles([resolve(path.join("src/server/schemas/", mapping.tsFile))], compilerOptions);
    let schema = TJS.generateSchema(program, mapping.fromType, settings);
    fs.writeFileSync(path.join("src/server/schemas/json/", mapping.file), JSON.stringify(schema));
});