import * as path from "path";
import * as YAML from "yaml";
import { Pair, YAMLMap, YAMLSeq } from 'yaml/types';
import { FileAccessor } from "../fileAccessor";
import { YamlIncludes, IncludeReferences, Includetype, YamlInclude, IncludedFromEntry, YamlIncludePlaceholder } from "./dto";

export class IncludeReference {

}

export class IncludeParser {

  private includes: YamlIncludes | null;
  private references: IncludeReferences = {};

  constructor(private fileAccessor: FileAccessor) { }

  public async parse(yaml: YAML.ast.Document, path: string): Promise<IncludeReferences> {

    this.includes = new YamlIncludes();

    // @ts-ignore
    // var asd = yaml.get("homeassistant");
    await this.parseRecursive(yaml.contents, path);

    return this.references;

    // await this.replaceFolderBasedIncludes();
  }


  private parseRecursive = async (x: YAML.ast.AstNode | null, currentPath: string) => {
    if (!x) {
      console.log(`${currentPath}: null`);
      return;
    }
    switch (x.type) {
      case "MAP":
        for (let i in x.items) {
          var item = x.items[i];
          if (item.type === "PAIR") {
            if (!item.key) {
              //help
            }
            this.parseRecursive(item.value, `${currentPath}/${item.key.toJSON()}`);
          }
          else {
            // help
          }
        }
        break;
      case "SEQ":
        for (let i in x.items) {
          this.parseRecursive(x.items[i], `${currentPath}/${i}`);
        }
        break;

      case "BLOCK_FOLDED":
      case "BLOCK_LITERAL":
      case "PLAIN":
      case "QUOTE_DOUBLE":
      case "QUOTE_SINGLE":
        var value: null | boolean | number | string = "";
        if (x.tag) {
          var includeType = this.getIncludeType(`${x.tag}`.slice(1).toLowerCase());
          if (includeType !== null) {
            value = x.value.toString().slice(7, -1).replace("\\", "/")
            let files: string[] = [];

            // @ts-ignore
            if (includeType === Includetype.include) {
              files.push(value);
            }
            else {
              var filesInThisFolder = await this.fileAccessor.getFilesInFolder(value);
              files = filesInThisFolder.filter(f => path.extname(f) === ".yaml");
            }
            for (var i in files) {
              this.references[files[i]] = {
                path: currentPath,
                includeType: includeType,
                start: x.range[0],
                end: x.range[1]
              };
            }
          }
          else {
            // !secret etc.
          }
        }
        else {
          value = x.value;
        }
        // console.log(`${currentPath}: ${value} `);
        break;
      default:
      // console.log(`${currentPath} / ${x.type}`);
    }
  }

  private getIncludeType = (str: string): Includetype | null => {

    var includeType: Includetype;
    switch (str) {
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
        return null;
    }
    return includeType;
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

}
