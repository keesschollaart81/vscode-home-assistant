import * as YAML from "yaml";
import * as path from "path";
import { Tag } from "yaml";
import { FileAccessor } from "../fileAccessor";
import { YamlIncludes, FilePathMapping, Includetype, YamlInclude, IncludedFromEntry } from "./dto";

export class YamlIncludeFileParser {

  private includes: YamlIncludes | null;

  constructor(private fileAccessor: FileAccessor) { }

  /** 
   * Find all the !include (and similar) tags 
   * Return a list of mappings, from location (path) in file x to file y via tag-type z
   * @param filename of the file to find !includes in
   */
  public async parse(filename: string, path: string): Promise<FilePathMapping> {
    this.includes = new YamlIncludes();

    var fileContents = await this.fileAccessor.getFileContents(filename);
    if (!fileContents) {
      return;
    }

    try {
      var yaml = YAML.parse(fileContents, {
        // @ts-ignore the typings of this library are not up to date
        customTags: this.getCustomTags(filename)
      });
    }
    catch (err) {
      var message = `${filename} could not be parsed, it was referenced from path '${path}'. This file will be ignored. Internal error: ${err}`;
      if (filename === path) {
        // root file has more impact
        console.warn(message);
      }
      else {
        console.log(message);
      }
      return;
    }
    await this.updatePathsViaTraversal(yaml, path);

    await this.replaceFolderBasedIncludes();

    return this.getPathMappings();
  }

  /**
   * Flatten (and distinct) the includes to a 2 dimensional array
   * that can be used by external services
   * */
  private getPathMappings = (): FilePathMapping => {
    let result: FilePathMapping = {};

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
        files = files.filter(f => path.extname(f) === ".yaml");
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
  private async updatePathsViaTraversal(obj, currentPath): Promise<void> {
    if (Object.prototype.toString.call(obj) === "[object Array]") {
      // Ignore the key/indexer of arrays
      for (var i = 0; i < obj.length; i++) {
        this.updatePathsViaTraversal(obj[i], `${currentPath}`);
      }
    } else if (typeof obj === "object" && obj !== null) {
      // objects
      if (obj.isInclude) {
        // parsed include
        var theDetails = <IncludedFromEntry>(
          this.includes[obj.toFileOrFolder].includedFrom[obj.fromFile]
        );

        theDetails.path = currentPath;
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
        tag: "!secret",
        resolve: (doc, cst) => Symbol.for(cst.strValue)
      },
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
    toFileOrFolder = this.fileAccessor.getRelativePath(filename, toFileOrFolder);


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
