import * as YAML from "yaml";
// @ts-ignore
import * as p from "yaml/dist/schema/parseMap";

import { Tag } from "yaml";
import URI from "vscode-uri";
import * as path from "path";
import * as fs from "fs";
import {
  IConnection,
  RequestType,
  VersionedTextDocumentIdentifier
} from "vscode-languageserver";

export interface NestedYamlParseResult {
  filename: string;
  path: string;
  contents: string;
  referencedFiles: NestedYamlParseResult[];
}

export interface FileAccessor {
  getFileContents(fileName: string): Promise<string>;
  getFilesInFolder(subFolder: string): Promise<string[]>;
  getUnifiedUri(input: string): string;
}

export class VsCodeFileAccessor implements FileAccessor {
  constructor(
    private workspaceFolder: string,
    private connection: IConnection
  ) {}

  async getFileContents(uri: string): Promise<string> {
    uri = this.getUnifiedUri(uri);
    return new Promise<string>((c, e) => {
      fs.readFile(uri, "UTF-8", (err, result) => {
        err ? e("") : c(result);
      });
    });
  }

  public getUnifiedUri(input: string): string {
    if (
      !input.startsWith("file:/") &&
      !input.startsWith(URI.parse(this.workspaceFolder).fsPath)
    ) {
      input = path.join(this.workspaceFolder, input);
    }
    return URI.parse(input).fsPath;
  }

  async getFilesInFolder(subFolder: string): Promise<string[]> {
    var folderName = this.getUnifiedUri(subFolder);
    var folders = this.walkSync(folderName);
    return folders;
  }

  private walkSync(dir, filelist = []) {
    fs.readdirSync(dir).forEach(file => {
      filelist = fs.statSync(path.join(dir, file)).isDirectory()
        ? this.walkSync(path.join(dir, file), filelist)
        : filelist.concat(path.join(dir, file));
    });
    return filelist;
  }
}

export interface ParseResult {
  filePathMappings: FilePathMapping;
}

export interface FilePathMapping {
  [filename: string]: string;
}

export class NestedYamlParser {
  private includes: YamlIncludeReferences = new YamlIncludeReferences();

  constructor(private fileAccessor: FileAccessor) {}

  public async parse(
    fileNames: string[],
    currentPath: string = ""
  ): Promise<ParseResult> {
    for (var index in fileNames) {
      var fileContents = await this.fileAccessor.getFileContents(
        fileNames[index]
      );

      var yaml = YAML.parse(fileContents, {
        tags: this.getCustomTags(fileNames[index])
      });
      await this.updatePathsViaTraversal(yaml, currentPath);
    }

    // parse all referenced files (this causes recursion)
    // this.parse(Object.keys(this.includes), currentPath);

    await this.replaceFolderBasedIncludes();

    var result = <ParseResult>{
      filePathMappings: this.getPathMappings()
    };

    return result;
  }

  private getPathMappings = (): FilePathMapping => {
    var result: FilePathMapping = {};

    for (var toFileOrFolder in this.includes) {
      for (var fromFile in this.includes[toFileOrFolder].referencedFrom) {
        var mapping = this.includes[toFileOrFolder].referencedFrom[fromFile];
        if (!result[toFileOrFolder]) {
          result[toFileOrFolder] = mapping.path;
        } else {
          // assuming it's the same path
          // todo: if multiple files point to this same file, and the path is different, throw an exception
        }
      }
    }
    return result;
  };

  private async replaceFolderBasedIncludes() {
    for (var toFileOrFolder in this.includes) {
      for (var fromFile in this.includes[toFileOrFolder].referencedFrom) {
        var mapping = this.includes[toFileOrFolder].referencedFrom[fromFile];
        //@ts-ignore
        if(mapping.tag.suffix === "include"){
          continue;
        }

        var files = await this.fileAccessor.getFilesInFolder(
          toFileOrFolder
        );
        files.map(x => {
          this.includes[x] = new YamlIncludeReference();
          this.includes[x].referencedFrom[fromFile] = { ...mapping };
        });
        delete this.includes[toFileOrFolder];
      }
    }
  }

  private async updatePathsViaTraversal(obj, currentPath): Promise<void> {
    if (Object.prototype.toString.call(obj) === "[object Array]") {
      // Ignore the key/indexer of arrays
      for (var i = 0; i < obj.length; i++) {
        this.updatePathsViaTraversal(obj[i], `${currentPath}`);
      }
    } else if (typeof obj === "object" && obj !== null) {
      // objects
      if (obj.isInclude) {
        // parsed reference
        var theDetails = <ReferencedFromEntry>(
          this.includes[obj.toFileOrFolder].referencedFrom[obj.fromFile]
        );

        theDetails.path = `${currentPath}`;
      } else {
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            this.updatePathsViaTraversal(obj[key], `${currentPath}/${key}`);
          }
        }
      }
    }
  }

  private getCustomTags(filename: string): Tag[] {
    return <Tag[]>[
      {
        tag: "!include",
        resolve: (doc, cstNode) => this.includeResolver(filename, doc, cstNode)
      },
      {
        tag: "!include_dir_list",
        resolve: (doc, cstNode) => this.includeResolver(filename, doc, cstNode)
      },
      {
        tag: "!include_dir_named",
        resolve: (doc, cstNode) => this.includeResolver(filename, doc, cstNode)
      },
      {
        tag: "!include_dir_merge_list",
        resolve: (doc, cstNode) => this.includeResolver(filename, doc, cstNode)
      },
      {
        tag: "!include_dir_merge_named",
        resolve: (doc, cstNode) => this.includeResolver(filename, doc, cstNode)
      }
    ];
  }

  private includeResolver = (
    filename: string,
    doc: YAML.ast.Document,
    cstNode: YAML.cst.Node
  ): YAML.ast.Node => {
    var fromFile = this.fileAccessor.getUnifiedUri(filename);
    var toFileOrFolder = this.fileAccessor.getUnifiedUri(cstNode.rawValue);

    var reference = this.includes[toFileOrFolder];
    if (!reference) {
      reference = new YamlIncludeReference();
    }
    var referencedFrom = reference.referencedFrom[fromFile];
    if (!referencedFrom) {
      referencedFrom = new ReferencedFromEntry();
    }
    referencedFrom.tag = cstNode.tag;
    referencedFrom.start = cstNode.range.start;
    referencedFrom.end = cstNode.range.end;

    reference.referencedFrom[fromFile] = referencedFrom;
    this.includes[toFileOrFolder] = reference;

    return YAML.createNode({
      isInclude: true,
      fromFile: fromFile,
      toFileOrFolder: toFileOrFolder
    });
  };
}

namespace OpenTextDocumentRequest {
  export const type: RequestType<{}, {}, {}, {}> = new RequestType(
    "ha/openTextDocument"
  );
}

export class YamlIncludeReferences {
  [filename: string]: YamlIncludeReference;
}

export class YamlIncludeReference {
  referencedFrom: ReferencedFrom = new ReferencedFrom();
}

export class ReferencedFrom {
  [filename: string]: ReferencedFromEntry;
}
export class ReferencedFromEntry {
  path: string | null;
  tag: null | { verbatim: string } | { handle: string; suffix: string };
  start: number;
  end: number;
}
