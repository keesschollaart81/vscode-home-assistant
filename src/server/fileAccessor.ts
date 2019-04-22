import { IConnection } from "vscode-languageserver";
import * as fs from "fs";
import * as path from "path";

export interface FileAccessor {
    getFileContents(fileName: string): Promise<string>;
    getFilesInFolder(subFolder: string): string[];
}

export class VsCodeFileAccessor implements FileAccessor {
    constructor(private workspaceFolder: string, private connection: IConnection) { }
    
    public async getFileContents(uri: string): Promise<string> {
        return new Promise<string>((c, e) => {
            fs.readFile(uri, "UTF-8", (err, result) => {
                err ? e("") : c(result);
            });
        });
    }
    
    public getFilesInFolder(subFolder: string, filelist: string[] = []): string[] {
        fs.readdirSync(subFolder).forEach(file => {
            filelist = fs.statSync(path.join(subFolder, file)).isDirectory()
                ? this.getFilesInFolder(path.join(subFolder, file), filelist)
                : filelist.concat(path.join(subFolder, file));
        });
        return filelist;
    }
}
