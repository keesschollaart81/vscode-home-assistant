import { resolve } from "path";
import * as TJS from "typescript-json-schema";
import * as fs from "fs";
import * as path from "path";
import { PathToSchemaMapping } from "./schemaService";
import { exit } from "process";

const settings: TJS.PartialArgs = {
  required: true,
  noExtraProps: true,
};

const compilerOptions: TJS.CompilerOptions = {
  strictNullChecks: true,
};

const jsonPath = path.join(__dirname, "mappings.json");
const filecontents = fs.readFileSync(jsonPath, "utf-8");

const outputFolder = path.join(__dirname, "json");

if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder);
}

if (fs.readdirSync(outputFolder).length > 0 && process.argv[2] === "--quick") {
  console.debug(
    "Skipping schema generation because there already schema files",
  );
} else {
  console.log("Generating schemas...");
  const pathToSchemaMappings: PathToSchemaMapping[] = JSON.parse(filecontents);
  pathToSchemaMappings.forEach((mapping) => {
    console.log(mapping.path);
    const program = TJS.getProgramFromFiles(
      [resolve(path.join(__dirname, mapping.tsFile))],
      compilerOptions,
    );
    const schema = TJS.generateSchema(program, mapping.fromType, settings);
    if (schema === null) {
      console.error("Schema generation failed");
      exit(1);
    }
    fs.writeFileSync(
      path.join(outputFolder, mapping.file),
      JSON.stringify(schema),
    );
  });
}
