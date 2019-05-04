import { IConnection } from "vscode-languageserver";
import * as fs from "fs";
import * as path from "path";

export interface FileAccessor {
    getFileContents(fileName: string): Promise<string>;
    getFilesInFolder(subFolder: string): string[];
    getFilesInFolderRelativeFrom(subFolder: string, relativeFrom: string): string[];
    getRelativePath(relativeFrom: string, filename: string): string;
}

export class VsCodeFileAccessor implements FileAccessor {

    constructor(private workspaceFolder: string, private connection: IConnection) { }

    public async getFileContents(uri: string): Promise<string> {
        return new Promise<string>((c, e) => {
            fs.exists(uri, (exists) => {
                if (!exists) {
                    c(null);
                }
                fs.readFile(uri, "UTF-8", (err, result) => {
                    err ? e(err) : c(result);
                });
            });
        });
    }

    public getFilesInFolder(subFolder: string, filelist: string[] = []): string[] {
        subFolder = path.normalize(subFolder);
        try {
            fs.readdirSync(subFolder).forEach(file => {
                filelist = fs.statSync(path.join(subFolder, file)).isDirectory()
                    ? this.getFilesInFolder(path.join(subFolder, file), filelist)
                    : filelist.concat(path.join(subFolder, file));
            });
        }
        catch (err) {
            console.log(`Cannot find the files in folder ${subFolder}`);
        }
        return filelist;
    }

    public getFilesInFolderRelativeFrom(subFolder: string, relativeFrom: string): string[] {
        var dirOfFile = path.dirname(relativeFrom);
        subFolder = path.join(dirOfFile, subFolder);
        return this.getFilesInFolder(subFolder);
    }

    public getRelativePath = (relativeFrom: string, filename: string): string => {
        var dirOfFile = path.dirname(relativeFrom);
        return path.join(dirOfFile, filename);
    }
}
