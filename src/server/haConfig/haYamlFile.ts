import * as path from "path";
import * as YAML from "yaml";
import getLinePos from "yaml/dist/cst/getLinePos";
import { FileAccessor } from "../fileAccessor";
import { IncludeReferences, Includetype, ScriptReferences } from "./dto";
import Uri from 'vscode-uri';

export class HomeAssistantYamlFile {

  private cst: YAML.ParsedCST | undefined;
  private yaml: YAML.ast.Document | undefined;
  private includes: IncludeReferences = {};
  private scripts: ScriptReferences = {};

  constructor(private fileAccessor: FileAccessor, private filename: string, private path: string) { }

  private async parse(): Promise<void> {

    var fileContents = await this.fileAccessor.getFileContents(this.filename);
    if (!fileContents) {
      return;
    }

    try {
      this.cst = YAML.parseCST(fileContents);
      this.yaml = new YAML.Document({
        // @ts-ignore the typings of this library are not up to date
        customTags: this.getCustomTags()
      }).parse(this.cst[0]);

      // this.yaml = YAML.parseDocument(fileContents, {
      //   // @ts-ignore the typings of this library are not up to date
      //   customTags: this.getCustomTags()
      // });
      await this.parseAstRecursive(this.yaml.contents, this.path);
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
    return this.includes;
  }

  public getScripts = async (): Promise<ScriptReferences> => {
    if (!this.yaml) {
      await this.parse();
    }
    if (!this.yaml) {
      return;
    }
    return this.scripts;
  }

  private getCustomTags(): YAML.Tag[] {

    return [
      `secret`,
      `${Includetype[Includetype.include]}`,
      `${Includetype[Includetype.include_dir_list]}`,
      `${Includetype[Includetype.include_dir_merge_list]}`,
      `${Includetype[Includetype.include_dir_merge_named]}`,
      `${Includetype[Includetype.include_dir_named]}`
      //@ts-ignore
    ].map(x => <YAML.Tag>
      {
        tag: `!${x}`,
        resolve: (doc, cst) => Symbol.for(cst.strValue)
      });
  }

  private parseAstRecursive = async (node: YAML.ast.AstNode | null, currentPath: string) => {
    if (!node) {
      // null object like 'frontent:'
      return;
    }
    switch (node.type) {
      case "MAP":
      case "SEQ":
        if (currentPath === "configuration.yaml/script") {
          this.collectScripts(node);
        }
        for (let i in node.items) {
          var item = node.items[i];
          switch (item.type) {
            case "PAIR":
              this.parseAstRecursive(item.value, `${currentPath}/${item.key.toJSON()}`);
              break;
            case "SEQ":
            case "MAP":
            case "BLOCK_FOLDED":
            case "BLOCK_LITERAL":
            case "PLAIN":
            case "QUOTE_DOUBLE":
            case "QUOTE_SINGLE":
              this.parseAstRecursive(item, currentPath);
              break;
            default:
              console.log(`huh ${currentPath}`);
              break;
          }
        }
        break;
      case "BLOCK_FOLDED":
      case "BLOCK_LITERAL":
      case "PLAIN":
      case "QUOTE_DOUBLE":
      case "QUOTE_SINGLE":
        if (node.tag) {
          await this.collectInclude(node, currentPath);
        }
        break;
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

  private async collectInclude(x: YAML.ast.ScalarNode, currentPath: string) {
    var value: null | boolean | number | string = "";
    var includeType = this.getIncludeType(`${x.tag}`.slice(1).toLowerCase());
    if (includeType === null) {
      // secrets and other tags
      return;
    }

    value = x.value.toString().slice(7, -1).replace("\\", "/"); // \ to / on windows

    let files: string[] = [];

    if (includeType === Includetype.include) {
      // single file include
      files.push(value);
    }
    else {
      // multiple file include
      var filesInThisFolder = await this.fileAccessor.getFilesInFolder(value);
      files = filesInThisFolder.filter(f => path.extname(f) === ".yaml");
    }

    for (var i in files) {
      this.includes[files[i]] = {
        path: currentPath,
        includeType: includeType,
        start: x.range[0],
        end: x.range[1]
      };
    }
  }

  private collectScripts(node: YAML.ast.Map | YAML.ast.Seq) {
    for (var i in node.items) {
      var item = node.items[i];
      let filepath = Uri.file(path.resolve(this.filename)).fsPath;
      if (item.type === "PAIR") {
        //@ts-ignore
        var lp = getLinePos(item.key.range[0], this.cst);
        var lp2 = getLinePos(item.value.range[1], this.cst);

        this.scripts[item.key.toJSON()] = {
          fileUri: Uri.file(filepath).toString(),
          start: [lp.line - 1, lp.col - 1],
          end: [lp2.line - 1, lp2.col - 1]
        };
      }
    }
  }
}

