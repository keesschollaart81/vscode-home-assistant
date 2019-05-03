import * as YAML from "yaml";
import * as path from "path";
import { Tag } from "yaml"; 
import { FileAccessor } from "./fileAccessor";

export class YamlIncludeDiscoveryService {
  private includes: YamlIncludes | null;

  constructor(private fileAccessor: FileAccessor) { }

  /**
   * Read the files given in the fileNames parameter
   * Discover all the !include (and similar) tags 
   * Return a list of mappings, from location (path) in file x to file y via tag-type z
   * @param fileNames the files to find !includes in
   */
  public async discover(fileNames: string[]): Promise<DiscoveryResult> {
    this.includes = new YamlIncludes();

    for (var index in fileNames) {
      var fileContents = await this.fileAccessor.getFileContents(
        fileNames[index]
      );
      if (!fileContents){
        continue;
      }

      var yaml = YAML.parse(fileContents, {
        tags: this.getCustomTags(fileNames[index])
      });
      await this.updatePathsViaTraversal(yaml, fileNames[index], "");
    }

    await this.replaceFolderBasedIncludes();

    var result = <DiscoveryResult>{
      filePathMappings: this.getPathMappings(fileNames)
    };

    return result;
  }

  /**
   * Flatten (and distinct) the includes to a 2 dimensional array
   * that can be used by external services
   * */ 
  private getPathMappings = (rootFiles: string[]): FilePathMapping => {
    let result: FilePathMapping = {};
    for (let rootFileIndex in rootFiles) {
      result[rootFiles[rootFileIndex]] = {
        includeType: null,
        path: rootFiles[rootFileIndex]
      };
    }

    for (let toFile in this.includes) {
      for (let fromFile in this.includes[toFile].includedFrom) {
        let mapping = this.includes[toFile].includedFrom[fromFile];
        let resultKey = toFile.replace("\\", "/"); // only for windows, otherwise the mapping to schema file will not work
        if (!result[resultKey]) {
          result[resultKey] = {
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
  }

  /** 
   * Replace directory-based includes with includes for all the files in the directory
  */
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

  /** 
   * Traverse over YAML document and find the includes
   * The includes are a special type of object set via this.includeResolver()
   * In this includeResolver it's unknown where this include is (no context)
   * This method sets the 'path' property on this object 
   */
  private async updatePathsViaTraversal(obj, filename, currentPath): Promise<void> {
    if (Object.prototype.toString.call(obj) === "[object Array]") {
      // Ignore the key/indexer of arrays
      for (var i = 0; i < obj.length; i++) {
        this.updatePathsViaTraversal(obj[i], filename, `${currentPath}`);
      }
    } else if (typeof obj === "object" && obj !== null) {
      // objects
      if (obj.isInclude) {
        // parsed include
        var theDetails = <IncludedFromEntry>(
          this.includes[obj.toFileOrFolder].includedFrom[obj.fromFile]
        );

        theDetails.path = `${filename}${currentPath}`;
      } else {
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            this.updatePathsViaTraversal(obj[key], filename, `${currentPath}/${key}`);
          }
        }
      }
    }
  }

  private getCustomTags(filename: string): Tag[] {
    return <Tag[]>[
      // {
      //   tag: "!secret"
      // },
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

  /**
   * Custom Resolver for the tags set in `this.getCustomTags()`
   * This gets called as part of the `YAML.parse()` operatin
   * both the `!include` and the `filename.yaml` part are replaced in the final YAML result
   * they are replaced by an object containing both the from- and to filenames
   * also all includes are stored in `this.includes` for later use
   */
  private includeResolver = (filename: string, doc: YAML.ast.Document, cstNode: YAML.cst.Node): YAML.ast.Node => {
    var fromFile = filename;
    var toFileOrFolder = `${cstNode.rawValue}`.trim(); 

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
      case `${Includetype[Includetype.include]}`:
        includeType = Includetype.include;
        break;
      case `${Includetype[Includetype.include_dir_list]}`:
        includeType = Includetype.include_dir_list;
        break;
      case `${Includetype[Includetype.include_dir_merge_list]}`:
        includeType = Includetype.include_dir_merge_list;
        break;
      case `${Includetype[Includetype.include_dir_merge_named]}`:
        includeType = Includetype.include_dir_merge_named;
        break;
      case `${Includetype[Includetype.include_dir_named]}`:
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
  }
}
 
export interface DiscoveryResult {
  filePathMappings: FilePathMapping;
}

export interface FilePathMapping {
  [filename: string]: FilePathMappingEntry;
}

export interface FilePathMappingEntry {
  path: string;
  includeType: Includetype;
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
  includeType?: Includetype;
  start: number;
  end: number;
}

export enum Includetype {
  include,
  include_dir_list,
  include_dir_named,
  include_dir_merge_list,
  include_dir_merge_named
}