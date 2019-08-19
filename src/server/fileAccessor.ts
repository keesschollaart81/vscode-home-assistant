import { TextDocuments } from "vscode-languageserver";
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
    fromUriToLocalPath(uri: string): string;
}

export class VsCodeFileAccessor implements FileAccessor {

    private ourRoot: string;

    constructor(private workspaceFolder: string, private documents: TextDocuments) {
        this.ourRoot = path.resolve();
    }

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

    private dealtWithRelativeFrom = (relativeFrom: string): string => {
        if (relativeFrom.startsWith("file://")) {
            relativeFrom = Uri.parse(relativeFrom).fsPath;
        }
        else {
            if (!relativeFrom.startsWith(this.ourRoot)) {
                relativeFrom = path.resolve(relativeFrom);
            }
            relativeFrom = Uri.file(relativeFrom).fsPath;
        }
        return relativeFrom;
    }

    public getFilesInFolderRelativeFrom(subFolder: string, relativeFrom: string): string[] {
        relativeFrom = this.dealtWithRelativeFrom(relativeFrom);

        var dirOfFile = path.dirname(relativeFrom);
        subFolder = path.join(dirOfFile, subFolder);
        return this.getFilesInFolder(subFolder);
    }

    public getFilesInFolderRelativeFromAsFileUri(subFolder: string, relativeFrom: string): string[] {
        var files = this.getFilesInFolderRelativeFrom(subFolder, relativeFrom);
        return files.map(f => Uri.file(f).toString());
    }

    public getRelativePath = (relativeFrom: string, filename: string): string => {
        relativeFrom = this.dealtWithRelativeFrom(relativeFrom);

        var dirOfFile = path.dirname(relativeFrom);
        let joinedPath = path.join(dirOfFile, filename);

        return joinedPath;
    }

    public getRelativePathAsFileUri = (relativeFrom: string, filename: string): string => {
        return Uri.file(this.getRelativePath(relativeFrom, filename)).toString();
    }

    public fromUriToLocalPath = (uri: string): string => {
        let workspaceFolderUri = Uri.parse(this.workspaceFolder);
        let fileUri = Uri.parse(uri);
        let local = fileUri.fsPath.replace(workspaceFolderUri.fsPath, "");
        if (local[0] === "/" || local[0] === "\\") {
            local = local.substring(1);
        }
        // let joined = path.join(workspaceFolderUri.fsPath, uri);
        // let normalized = path.normalize(joined);
        return local;
    }
}
