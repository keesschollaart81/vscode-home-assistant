import {resolve} from "path";
import * as TJS from "typescript-json-schema";
import * as fs from "fs";

const settings: TJS.PartialArgs = {
    required: true,
    noExtraProps: true
};

const compilerOptions: TJS.CompilerOptions = {
    strictNullChecks: true 
}
 

let program = TJS.getProgramFromFiles([resolve("src/schemas/ui-lovelace.ts")], compilerOptions); 
let schema = TJS.generateSchema(program, "LovelaceConfig", settings);
fs.writeFileSync("src/schemas/json/ui-lovelace.json", JSON.stringify(schema));

program = TJS.getProgramFromFiles([resolve("src/schemas/homeassistant.ts")], compilerOptions); 
schema = TJS.generateSchema(program, "HomeAssistantRoot", settings);
fs.writeFileSync("src/schemas/json/homeassistant.json", JSON.stringify(schema));

program = TJS.getProgramFromFiles([resolve("src/schemas/homeassistant.ts")], compilerOptions); 
schema = TJS.generateSchema(program, "HomeAssistantRoot", settings);
fs.writeFileSync("src/schemas/json/homeassistant-packages.json", JSON.stringify(schema));

program = TJS.getProgramFromFiles([resolve("src/schemas/ui-lovelace.ts")], compilerOptions); 
schema = TJS.generateSchema(program, "LovelaceViewConfig", settings);
fs.writeFileSync("src/schemas/json/lovelace-views-named.json", JSON.stringify(schema));

program = TJS.getProgramFromFiles([resolve("src/schemas/ui-lovelace.ts")], compilerOptions); 
schema = TJS.generateSchema(program, "LovelaceViewConfigs", settings);
fs.writeFileSync("src/schemas/json/lovelace-views-list.json", JSON.stringify(schema));

program = TJS.getProgramFromFiles([resolve("src/schemas/automation.ts")], compilerOptions); 
schema = TJS.generateSchema(program, "Automation", settings);
fs.writeFileSync("src/schemas/json/automations-named.json", JSON.stringify(schema));

program = TJS.getProgramFromFiles([resolve("src/schemas/automation.ts")], compilerOptions); 
schema = TJS.generateSchema(program, "Automations", settings);
fs.writeFileSync("src/schemas/json/automations-list.json", JSON.stringify(schema));
