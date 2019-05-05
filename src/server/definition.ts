import { FileAccessor } from "./fileAccessor";
import { Definition, DefinitionLink, Location } from "vscode-languageserver";

export class DefinitionProvider {
    constructor(private fileAccessor: FileAccessor) {

    }

    public onDefinition = async (line: string, uri: string): Promise<Definition | DefinitionLink[] | undefined> => {

        let matches = /(.*)(!include([\S]*))([\s]*)*(.*)/.exec(line);
        if (!matches || matches.length !== 6) {
            return;
        }
        let includeType = matches[2];
        let whatToInclude = matches[5];

        switch (includeType) {
            case "!include":
                let destination = this.fileAccessor.getRelativePath(uri, whatToInclude);
                return Location.create(destination, {
                    start: { line: 1, character: 1 },
                    end: { line: 1, character: 1 }
                });
            case "!include_dir_list":
            case "!include_dir_named":
            case "!include_dir_merge_list":
            case "!include_dir_merge_named":
                var files = this.fileAccessor.getFilesInFolderRelativeFrom(whatToInclude, uri);
                return files.map(f => Location.create(f, {
                    start: { line: 1, character: 1 },
                    end: { line: 1, character: 1 }
                }));
            default:
                return;
        }
    }
} 