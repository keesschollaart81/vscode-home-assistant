import { FileAccessor } from "../fileAccessor";
import { Definition, DefinitionLink, Location } from "vscode-languageserver";
import { HomeAssistantConfiguration } from "../haConfig/haConfig";
import { DefinitionProvider } from "./definition";

export class ScriptDefinitionProvider implements DefinitionProvider {

    constructor(private haConfig: HomeAssistantConfiguration) {
    }

    public onDefinition = async (line: string, uri: string): Promise<Definition[]> => {
        let matches = /(.*)(script\.([\S]*))([\s]*)*(.*)/.exec(line);
        if (!matches || matches.length !== 6) {
            return [];
        }
        let scripts = await this.haConfig.getScripts();
        var scriptName = matches[3].replace(":", ""); // might be possible in regex!?
        let ourScript = scripts[scriptName];
        if (!ourScript) {
            return [];
        }
        return [Location.create(ourScript.fileUri, {
            start: { line: ourScript.start[0], character: ourScript.start[1] },
            end: { line: ourScript.end[0], character: ourScript.end[1] }
        })];
    }
}
