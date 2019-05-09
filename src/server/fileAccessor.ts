import { IConnection, TextDocument, TextDocuments } from "vscode-languageserver";
import * as fs from "fs";
import * as path from "path";
import Uri from 'vscode-uri';

export interface FileAccessor {
    getFileContents(fileName: string): Promise<string>;
    getFilesInFolder(subFolder: string): string[];
    getFilesInFolderRelativeFrom(subFolder: string, relativeFrom: string): string[];
    getFilesInFolderRelativeFromAsFileUri(subFolder: string, relativeFrom: string): string[];
    getRelativePath(relativeFrom: string, filename: string): string;
    getRelativePathAsFileUri(relativeFrom: string, filename: string): string;
}

export class VsCodeFileAccessor implements FileAccessor {

    constructor(private workspaceFolder: string, private connection: IConnection, private documents: TextDocuments) { }

    public async getFileContents(uri: string): Promise<string> {
        var fullUri = Uri.file(path.resolve(uri));
        var textDocument = this.documents.get(fullUri.toString());
        if (textDocument) {
            // open file in editor, might not be saved yet
            return textDocument.getText();
        }
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
        relativeFrom = Uri.parse(relativeFrom).fsPath;

        var dirOfFile = path.dirname(relativeFrom);
        subFolder = path.join(dirOfFile, subFolder);
        return this.getFilesInFolder(subFolder);
    }

    public getFilesInFolderRelativeFromAsFileUri(subFolder: string, relativeFrom: string): string[] {
        var files = this.getFilesInFolderRelativeFrom(subFolder, relativeFrom);
        return files.map(f => Uri.file(f).toString());
    }

    public getRelativePath = (relativeFrom: string, filename: string): string => {
        relativeFrom = Uri.parse(relativeFrom).fsPath;

        var dirOfFile = path.dirname(relativeFrom);
        let joinedPath = path.join(dirOfFile, filename);

        return joinedPath;
    }

    public getRelativePathAsFileUri = (relativeFrom: string, filename: string): string => {
        return Uri.file(this.getRelativePath(relativeFrom, filename)).toString();
    }
}
