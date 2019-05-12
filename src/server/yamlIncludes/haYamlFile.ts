import * as YAML from "yaml"; 
import { FileAccessor } from "../fileAccessor";
import { IncludeReferences, Includetype, YamlIncludePlaceholder } from "./dto";
import { IncludeParser } from "./includeParser";
import { ScriptParser, ScriptReferences } from "./scriptParser";

export class HomeAssistantYamlFile {

  private yaml: YAML.ast.Document | undefined;
  private includes: IncludeReferences | undefined;

  constructor(private fileAccessor: FileAccessor, private filename: string, private path: string) { }

  private async parse(): Promise<void> {

    var fileContents = await this.fileAccessor.getFileContents(this.filename);
    if (!fileContents) {
      return;
    }

    try {
      this.yaml = YAML.parseDocument(fileContents, {
        // @ts-ignore the typings of this library are not up to date
        customTags: this.getCustomTags(this.filename)
      });
    }
    catch (err) {
      var message = `${this.filename} could not be parsed, it was referenced from path '${this.path}'. This file will be ignored. Internal error: ${err}`;
      if (this.filename === this.path) {
        // root file has more impact
        console.warn(message);
      }
      else {
        console.log(message);
      }
      return;
    }
  }

  public getIncludes = async (): Promise<IncludeReferences> => {
    if (!this.yaml) {
      await this.parse();
    }
    if (!this.yaml) {
      return;
    }
    var includeParser = new IncludeParser(this.fileAccessor);
    if (!this.includes) {
      this.includes = await includeParser.parse(this.yaml, this.path);
    }
    return this.includes;
  }

  public getScripts = async (): Promise<ScriptReferences> => {
    if (!this.yaml) {
      await this.parse();
    }
    if (!this.yaml) {
      return;
    }
    var a = new ScriptParser();
    return await a.parse(this.yaml, this.path);
  }

  private getCustomTags(filename: string): YAML.Tag[] {
    return <YAML.Tag[]>[
      {
        tag: "!secret",
        resolve: (doc, cst) => Symbol.for(cst.strValue)
      },
      {
        tag: `!${Includetype[Includetype.include]}`,
        resolve: (doc, cst) => Symbol.for(cst.strValue)
        // resolve: (doc, cstNode) => this.includeResolver(filename, doc, cstNode)
      },
      {
        tag: `!${Includetype[Includetype.include_dir_list]}`,
        resolve: (doc, cst) => Symbol.for(cst.strValue)
        // resolve: (doc, cstNode) => this.includeResolver(filename, doc, cstNode)
      },
      {
        tag: `!${Includetype[Includetype.include_dir_named]}`,
        resolve: (doc, cst) => Symbol.for(cst.strValue)
        // resolve: (doc, cstNode) => this.includeResolver(filename, doc, cstNode)
      },
      {
        tag: `!${Includetype[Includetype.include_dir_merge_list]}`,
        resolve: (doc, cst) => Symbol.for(cst.strValue)
        // resolve: (doc, cstNode) => this.includeResolver(filename, doc, cstNode)
      },
      {
        tag: `!${Includetype[Includetype.include_dir_merge_named]}`,
        resolve: (doc, cst) => Symbol.for(cst.strValue)
        // resolve: (doc, cstNode) => this.includeResolver(filename, doc, cstNode)
      },
      {
        tag: `!asdasd`,
        resolve: (doc, cstNode) => this.includeResolver(filename, doc, cstNode)
      }
    ];
  }

  /**
   * Custom Resolver for the tags set in `this.getCustomTags()`
   * This gets called as part of the `YAML.parse()` operatin
   * both the `!include***` and the `filename.yaml` part are replaced in the final YAML result
   * they are replaced by a `YamlIncludePlaceholder` object containing both the from- and to filenames 
   */
  private includeResolver = (filename: string, doc: YAML.ast.Document, cstNode: YAML.cst.Node): YAML.ast.Node => {
    var fromFile = filename;
    var toFileOrFolder = `${cstNode.rawValue}`.trim();
    toFileOrFolder = this.fileAccessor.getRelativePath(filename, toFileOrFolder);

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

    return YAML.createNode(<YamlIncludePlaceholder>{
      isInclude: true,
      fromFile: fromFile,
      includeType: includeType,
      toFileOrFolder: toFileOrFolder,
      start: cstNode.range.start,
      end: cstNode.range.end
    });
  }
}

