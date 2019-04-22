import {resolve} from "path";
import * as TJS from "typescript-json-schema";
import * as fs from "fs";

const settings: TJS.PartialArgs = {
    required: true,
    noExtraProps: false
};

const compilerOptions: TJS.CompilerOptions = {
    strictNullChecks: true
}
 

let program = TJS.getProgramFromFiles([resolve("src/schemas/ui-lovelace.ts")], compilerOptions); 
let schema = TJS.generateSchema(program, "LovelaceConfig", settings);
fs.writeFileSync("src/schemas/ui-lovelace.json", JSON.stringify(schema));

program = TJS.getProgramFromFiles([resolve("src/schemas/automation.ts")], compilerOptions); 
schema = TJS.generateSchema(program, "Automation", settings);
fs.writeFileSync("src/schemas/automations-named.json", JSON.stringify(schema));

program = TJS.getProgramFromFiles([resolve("src/schemas/automation.ts")], compilerOptions); 
schema = TJS.generateSchema(program, "Automations", settings);
fs.writeFileSync("src/schemas/automations-list.json", JSON.stringify(schema));
