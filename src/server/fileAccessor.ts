import { TextDocuments } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import * as fs from "fs";
import * as path from "path";
import * as vscodeUri from "vscode-uri";

export interface FileAccessor {
  getFileContents(fileName: string): Promise<string>;
  getFilesInFolder(subFolder: string): string[];
  getFilesInFolderRelativeFrom(
    subFolder: string,
    relativeFrom: string,
  ): string[];
  getFilesInFolderRelativeFromAsFileUri(
    subFolder: string,
    relativeFrom: string,
  ): string[];
  getRelativePath(relativeFrom: string, filename: string): string;
  getRelativePathAsFileUri(relativeFrom: string, filename: string): string;
  fromUriToLocalPath(uri: string): string;
}

export class VsCodeFileAccessor implements FileAccessor {
  private ourRoot: string;

  constructor(
    private workspaceFolder: string,
    private documents: TextDocuments<TextDocument>,
  ) {
    this.ourRoot = path.resolve();
  }

  public async getFileContents(uri: string): Promise<string> {
    const fullUri = vscodeUri.URI.file(path.resolve(uri));
    const textDocument = this.documents.get(fullUri.toString());
    if (textDocument) {
      // open file in editor, might not be saved yet
      return textDocument.getText();
    }
    return new Promise<string>((c, e) => {
      fs.exists(uri, (exists) => {
        if (!exists) {
          c(null);
        }
        fs.readFile(uri, "utf-8", (err, result) => {
          if (err) {
            e(err);
          } else {
            c(result);
          }
        });
      });
    });
  }

  public getFilesInFolder(
    subFolder: string,
    filelist: string[] = [],
  ): string[] {
    subFolder = path.normalize(subFolder);

    try {
      fs.readdirSync(subFolder).forEach((file) => {
        // ignore dot files
        if (file.charAt(0) === ".") {
          return;
        }
        filelist =
          fs.statSync(path.join(subFolder, file)).isDirectory() &&
          !file.startsWith(".")
            ? this.getFilesInFolder(path.join(subFolder, file), filelist)
            : filelist.concat(path.join(subFolder, file));
      });
    } catch (err) {
      console.log(`Cannot find the files in folder ${subFolder}`);
    }
    return filelist;
  }

  private dealtWithRelativeFrom = (relativeFrom: string): string => {
    if (relativeFrom.startsWith("file://")) {
      relativeFrom = vscodeUri.URI.parse(relativeFrom).fsPath;
    } else {
      if (!relativeFrom.startsWith(this.ourRoot)) {
        relativeFrom = path.resolve(relativeFrom);
      }
      relativeFrom = vscodeUri.URI.file(relativeFrom).fsPath;
    }
    return relativeFrom;
  };

  public getFilesInFolderRelativeFrom(
    subFolder: string,
    relativeFrom: string,
  ): string[] {
    relativeFrom = this.dealtWithRelativeFrom(relativeFrom);

    const dirOfFile = path.dirname(relativeFrom);
    subFolder = path.join(dirOfFile, subFolder);
    return this.getFilesInFolder(subFolder);
  }

  public getFilesInFolderRelativeFromAsFileUri(
    subFolder: string,
    relativeFrom: string,
  ): string[] {
    const files = this.getFilesInFolderRelativeFrom(subFolder, relativeFrom);
    return files.map((f) => vscodeUri.URI.file(f).toString());
  }

  public getRelativePath = (relativeFrom: string, filename: string): string => {
    relativeFrom = this.dealtWithRelativeFrom(relativeFrom);

    const dirOfFile = path.dirname(relativeFrom);
    const joinedPath = path.join(dirOfFile, filename);

    return joinedPath;
  };

  public getRelativePathAsFileUri = (
    relativeFrom: string,
    filename: string,
  ): string =>
    vscodeUri.URI.file(this.getRelativePath(relativeFrom, filename)).toString();

  public fromUriToLocalPath = (uri: string): string => {
    const workspaceFolderUri = vscodeUri.URI.parse(this.workspaceFolder);
    const fileUri = vscodeUri.URI.parse(uri);
    let local = fileUri.fsPath.replace(workspaceFolderUri.fsPath, "");
    if (local[0] === "/" || local[0] === "\\") {
      local = local.substring(1);
    }
    // let joined = path.join(workspaceFolderUri.fsPath, uri);
    // let normalized = path.normalize(joined);
    return local;
  };
}
