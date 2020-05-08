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
};

var jsonPath = path.join(__dirname, "mappings.json");
var filecontents = fs.readFileSync(jsonPath, "utf-8");

var outputFolder = path.join(__dirname, "json");

if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder);
}

if (fs.readdirSync(outputFolder).length > 0 && process.argv[2] === "--quick") {
    console.debug("Skipping schema generation because the schema files are already there");
}
else {
    console.log("Generating schema's...");
    var pathToSchemaMappings: PathToSchemaMapping[] = JSON.parse(filecontents);
    pathToSchemaMappings.forEach(mapping => {
        let program = TJS.getProgramFromFiles([resolve(path.join(__dirname, mapping.tsFile))], compilerOptions);
        let schema = TJS.generateSchema(program, mapping.fromType, settings);
        fs.writeFileSync(path.join(outputFolder, mapping.file), JSON.stringify(schema));
    });
}
