
export class ScriptParser {

    constructor() { }

    public async parse(yaml: any, path: string): Promise<ScriptReferences> {
        switch (path) {
            case "configuration.yaml":
            case "configuration.yaml/homeassistant/package":
                return this.processScripts(yaml["scripts"]);
            case "configuration.yaml/homeassistant/package/script":
            case "configuration.yaml/script":
                return this.processScripts(yaml);
            default:
                return {};
        }
    }

    private processScripts = (scripts: any): ScriptReferences => {
        for(var script in scripts){
            console.log(script);
        }
        return {};
    }

}
export interface ScriptReferences {
    [filename: string]: string;
}