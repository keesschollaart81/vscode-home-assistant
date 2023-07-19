import { Definition, Location } from "vscode-languageserver-protocol";
import { HomeAssistantConfiguration } from "../haConfig/haConfig";
import { DefinitionProvider } from "./definition";

export class ScriptDefinitionProvider implements DefinitionProvider {
  constructor(private haConfig: HomeAssistantConfiguration) {}

  public onDefinition = async (
    line: string,
    uri: string,
  ): Promise<Definition[]> => {
    const matches = /(.*)(script\.([\S]*))([\s]*)*(.*)/.exec(line);
    if (!matches || matches.length !== 6) {
      return [];
    }
    const scripts = await this.haConfig.getScripts();
    const scriptName = matches[3].replace(":", ""); // might be possible in regex!?
    const ourScript = scripts[scriptName];
    if (!ourScript) {
      return [];
    }
    return [
      Location.create(ourScript.fileUri, {
        start: { line: ourScript.start[0], character: ourScript.start[1] },
        end: { line: ourScript.end[0], character: ourScript.end[1] },
      }),
    ];
  };
}
