import * as YAML from "yaml";
import { Tag } from "yaml";
import URI from "vscode-uri";
import * as path from "path";
import * as fs from "fs";
import { IConnection } from "vscode-languageserver";

export interface NestedYamlParseResult {
  filename: string;
  path: string;
  contents: string;
  includedFiles: NestedYamlParseResult[];
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
  ) { }

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
  [filename: string]: FilePathMappingEntry;
}

export interface FilePathMappingEntry {
  path: string;
  includeType: Includetype;
}

export class NestedYamlParser {
  private includes: YamlIncludes | null;

  constructor(private fileAccessor: FileAccessor) { }

  public async parse(
    fileNames: string[],
    currentPath: string = ""
  ): Promise<ParseResult> {
    this.includes = new YamlIncludes();

    for (var index in fileNames) {
      var fileContents = await this.fileAccessor.getFileContents(
        fileNames[index]
      );

      var yaml = YAML.parse(fileContents, {
        tags: this.getCustomTags(fileNames[index])
      });
      await this.updatePathsViaTraversal(yaml, fileNames[index], currentPath);
    }

    // parse all included files (this causes recursion)
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
      for (var fromFile in this.includes[toFileOrFolder].includedFrom) {
        var mapping = this.includes[toFileOrFolder].includedFrom[fromFile];
        if (!result[toFileOrFolder]) {
          result[toFileOrFolder] = {
            path: mapping.path,
            includeType: mapping.includeType
          };
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
      for (var fromFile in this.includes[toFileOrFolder].includedFrom) {
        var mapping = this.includes[toFileOrFolder].includedFrom[fromFile];
        if (mapping.includeType === Includetype.include) {
          continue;
        }

        var files = await this.fileAccessor.getFilesInFolder(toFileOrFolder);
        files.map(x => {
          this.includes[x] = new YamlInclude();
          this.includes[x].includedFrom[fromFile] = { ...mapping };
        });
        delete this.includes[toFileOrFolder];
      }
    }
  }

  private async updatePathsViaTraversal(obj, filename, currentPath): Promise<void> {
    if (Object.prototype.toString.call(obj) === "[object Array]") {
      // Ignore the key/indexer of arrays
      for (var i = 0; i < obj.length; i++) {
        this.updatePathsViaTraversal(obj[i], filename, `${filename}/${currentPath}`);
      }
    } else if (typeof obj === "object" && obj !== null) {
      // objects
      if (obj.isInclude) {
        // parsed include
        var theDetails = <IncludedFromEntry>(
          this.includes[obj.toFileOrFolder].includedFrom[obj.fromFile]
        );

        theDetails.path = `${currentPath}`;
      } else {
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            this.updatePathsViaTraversal(obj[key], filename, `${filename}/${currentPath}/${key}`);
          }
        }
      }
    }
  }

  private getCustomTags(filename: string): Tag[] {
    return <Tag[]>[
      {
        tag: `!${Includetype[Includetype.include]}`,
        resolve: (doc, cstNode) => this.includeResolver(filename, doc, cstNode)
      },
      {
        tag: `!${Includetype[Includetype.include_dir_list]}`,
        resolve: (doc, cstNode) => this.includeResolver(filename, doc, cstNode)
      },
      {
        tag: `!${Includetype[Includetype.include_dir_named]}`,
        resolve: (doc, cstNode) => this.includeResolver(filename, doc, cstNode)
      },
      {
        tag: `!${Includetype[Includetype.include_dir_merge_list]}`,
        resolve: (doc, cstNode) => this.includeResolver(filename, doc, cstNode)
      },
      {
        tag: `!${Includetype[Includetype.include_dir_merge_named]}`,
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

    var include = this.includes[toFileOrFolder];
    if (!include) {
      include = new YamlInclude();
    }
    var includedFrom = include.includedFrom[fromFile];
    if (!includedFrom) {
      includedFrom = new IncludedFromEntry();
    }
    var includeType: Includetype;
    // @ts-ignore
    switch (cstNode.tag.suffix) {
      case "include":
        includeType = Includetype.include;
        break;
      case "include_dir_list":
        includeType = Includetype.include_dir_list;
        break;
      case "include_dir_merge_list":
        includeType = Includetype.include_dir_merge_list;
        break;
      case "include_dir_merge_named":
        includeType = Includetype.include_dir_merge_named;
        break;
      case "include_dir_named":
        includeType = Includetype.include_dir_named;
        break;
      default:
        throw new Error("Unknown include tag");
    }
    includedFrom.includeType = includeType;
    includedFrom.start = cstNode.range.start;
    includedFrom.end = cstNode.range.end;

    include.includedFrom[fromFile] = includedFrom;
    this.includes[toFileOrFolder] = include;

    return YAML.createNode({
      isInclude: true,
      fromFile: fromFile,
      toFileOrFolder: toFileOrFolder
    });
  };
}

export class YamlIncludes {
  [filename: string]: YamlInclude;
}

export class YamlInclude {
  includedFrom: IncludedFrom = new IncludedFrom();
}

export class IncludedFrom {
  [filename: string]: IncludedFromEntry;
}
export class IncludedFromEntry {
  path: string | null;
  includeType: Includetype;
  start: number;
  end: number;
}

export class SchemaServiceForIncludes {
  private schemaContributions: any;

  constructor(private jsonSchemaService: any) { }

  public onUpdate(fileMappings: FilePathMapping) {
    if (!this.schemaContributions) {
      this.schemaContributions = this.getSchemaContributions(fileMappings);
    }
    this.jsonSchemaService.setSchemaContributions(this.schemaContributions);
  }

  private getPathToSchemaFileMappings(): PathToSchemaMapping[] {
    return [
      {
        key: "automations-named",
        path: "configuration.yaml/automation",
        isList: false,
        file: "automations-named.json"
      },
      {
        key: "automations-list",
        path: "configuration.yaml/automation",
        isList: true,
        file: "automations-list.json"
      },
      {
        key: "ui-lovelace",
        path: "ui-lovelace.yaml",
        isList: false,
        file: "ui-lovelace.json"
      }
    ];
  }

  private getSchemaContributions(fileMappings: FilePathMapping) {
    var schemas = {};
    var schemaAssociations = {};
    var pathToSchemaFileMappings = this.getPathToSchemaFileMappings();

    pathToSchemaFileMappings.forEach(pathToSchemaMapping => {
      var jsonPath = path.join(__dirname, "..", "schemas", pathToSchemaMapping.file);
      var filecontents = fs.readFileSync(jsonPath, "utf-8");
      var schema = JSON.parse(filecontents); 

      schemas[`http://schemas.home-assistant.io/${pathToSchemaMapping.key}`] = schema;
    });

    for (var sourceFile in fileMappings) {
      var sourceFileMapping = fileMappings[sourceFile];
      var relatedPathToSchemaMapping = pathToSchemaFileMappings.find(x => {
        var samePath = x.path === sourceFileMapping.path;
        if (!samePath) {
          return false;
        }
        switch (sourceFileMapping.includeType) {
          case Includetype.include:
          case Includetype.include_dir_merge_named:
          case Includetype.include_dir_named:
            return !x.isList;
          case Includetype.include_dir_list:
          case Includetype.include_dir_merge_list:
            return x.isList;
        }
      });

      schemaAssociations[`**/${sourceFile}`] = `http://schemas.home-assistant.io/${relatedPathToSchemaMapping.key}`;
    }

    return { 
      schemas: schemas,
      schemaAssociations: schemaAssociations
    };

    // var automationJsonPath = path.join(__dirname, "..", "schemas", "automation.json");
    // var automationFile = fs.readFileSync(automationJsonPath, "utf-8");
    // var automationSchema = JSON.parse(automationFile);

    // return {
    //   schemas: {
    //     "http://schema.ha.com/lovelace": lovelaceSchema,
    //     "http://schema.ha.com/automation": automationSchema
    //   },
    //   schemaAssociations: {
    //     "**/ui-lovelace.yaml": ["http://schema.ha.com/lovelace"],
    //     "**/automations/backyard.yaml": ["http://schema.ha.com/automation"]
    //   }
    // };
  }
}

export enum Includetype {
  include,
  include_dir_list,
  include_dir_named,
  include_dir_merge_list,
  include_dir_merge_named
}
export interface PathToSchemaMapping {
  key: string;
  path: string;
  isList: boolean;
  file: string;
}