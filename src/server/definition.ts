import { FileAccessor } from "./fileAccessor";
import { Definition, DefinitionLink, Location } from "vscode-languageserver";
import * as path from "path";
import { HomeAssistantConfiguration } from "./yamlIncludes/haConfig";

export interface DefinitionProvider {
    onDefinition(line: string, uri: string): Promise<Definition | DefinitionLink[] | undefined>;
}

export class IncludeDefinitionProvider implements DefinitionProvider {
    constructor(private fileAccessor: FileAccessor) {

    }

    public onDefinition = async (line: string, uri: string): Promise<Definition | DefinitionLink[] | undefined> => {

        let matches = /(.*)(!include([\S]*))([\s]*)*(.*)/.exec(line);
        if (!matches || matches.length !== 6) {
            return;
        }
        let includeType = matches[2];
        let whatToInclude = `${matches[5]}`.trim();

        switch (includeType) {
            case "!include":
                let destination = this.fileAccessor.getRelativePathAsFileUri(uri, whatToInclude);
                return Location.create(destination, {
                    start: { line: 0, character: 0 },
                    end: { line: 0, character: 0 }
                });
            case "!include_dir_list":
            case "!include_dir_named":
            case "!include_dir_merge_list":
            case "!include_dir_merge_named":
                var files = this.fileAccessor.getFilesInFolderRelativeFromAsFileUri(whatToInclude, uri);
                files = files.filter(f => path.extname(f) === ".yaml");
                return files.map(f => Location.create(f, {
                    start: { line: 0, character: 0 },
                    end: { line: 0, character: 0 }
                }));
            default:
                return;
        }
    }
}
export class ScriptDefinitionProvider implements DefinitionProvider {
    private root: string;
    constructor(private fileAccessor: FileAccessor, private haConfig: HomeAssistantConfiguration) {
        this.root = fileAccessor.getRelativePath("configuration.yaml");
    }

    public onDefinition = async (line: string, uri: string): Promise<Definition | DefinitionLink[] | undefined> => {

        let matches = /(.*)(script\.([\S]*))([\s]*)*(.*)/.exec(line);
        if (!matches || matches.length !== 6) {
            return;
        }
        let scripts = await this.haConfig.getScripts();
        let ourScript = scripts[matches[3]];
        if (!ourScript) {
            return;
        }
        let destination = this.fileAccessor.getRelativePathAsFileUri(uri, ourScript.filename);
        return Location.create(destination, {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 0 }
        });
    }
} 