import * as path from "path";
import * as YAML from "yaml";
import * as sourceUtils from "yaml/dist/cst/source-utils";
import { FileAccessor } from "../fileAccessor";
import { IncludeReferences, Includetype, ScriptReferences } from "./dto";
import * as vscodeUri from 'vscode-uri';

export class HomeAssistantYamlFile {

  private cst: YAML.ParsedCST | undefined;
  private yaml: YAML.ast.Document | undefined;
  private includes: IncludeReferences = {};
  private scripts: ScriptReferences = {};

  constructor(private fileAccessor: FileAccessor, private filename: string, public path: string) { }

  private async parse(): Promise<void> {

    var fileContents = await this.fileAccessor.getFileContents(this.filename);
    if (!fileContents) {
      return;
    }

    this.cst = YAML.parseCST(fileContents);
    this.yaml = new YAML.Document({
      // @ts-ignore the typings of this library are not up to date
      customTags: this.getCustomTags()
    }).parse(this.cst[0]);

    await this.parseAstRecursive(this.yaml.contents, this.path);
  }

  public isValid = async (): Promise<ValidationResults> => {
    try {
      await this.parse();
    }
    catch (e) {
      return {
        isValid: false,
        errors: [e]
      };
    }
    if (!this.yaml) {
      return {
        isValid: false,
        errors: ["Empty yaml"]
      };
    }
    if (this.yaml.errors && this.yaml.errors.length > 0) {
      var errors = this.yaml.errors.slice(0, 3).map(x => {
        //@ts-ignore
        let line = (x.source && x.source.rangeAsLinePos && x.source.rangeAsLinePos.start) ? ` (Line: ${x.source.rangeAsLinePos.start.line})` : "";
        return `${x.name}: ${x.message}${line}`;
      });
      if (this.yaml.errors.length > 3) {
        errors.push(` - And ${this.yaml.errors.length - 3} more errors...`)
      }
      return {
        isValid: false,
        errors: errors
      };
    }
    return {
      isValid: true
    };
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

  private parseAstRecursive = async (node: YAML.ast.AstNode | null, currentPath: string): Promise<void> => {
    if (!node) {
      // null object like 'frontend:'
      return;
    }
    switch (node.type) {
      case "MAP":
      case "FLOW_SEQ":
      case "SEQ":
        if (node.type !== "FLOW_SEQ" && (currentPath === "configuration.yaml/script" || currentPath === "configuration.yaml/homeassistant/packages/script")) {
          this.collectScripts(node);
        }
        for (let i in node.items) {
          var item = node.items[i];
          switch (item.type) {
            case "PAIR":
              await this.parseAstRecursive(item.value, `${currentPath}/${this.getKeyName(item.key)}`);
              break;
            case "SEQ":
            case "MAP":
            case "BLOCK_FOLDED":
            case "BLOCK_LITERAL":
            case "PLAIN":
            case "QUOTE_DOUBLE":
            case "QUOTE_SINGLE":
            case "FLOW_SEQ":
              await this.parseAstRecursive(item, currentPath);
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

  private getKeyName = (node: YAML.ast.AstNode): string => {
    if (node.tag && node.type === "PLAIN") {
      return node.value.toString().slice(7, -1);
    }
    else {
      return node.toJSON();
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

    value = x.value.toString().slice(7, -1).replace(/\\/g, "/"); // \ to / on windows

    let files: string[] = [];

    if (includeType === Includetype.include) {
      var relativeFilePath = this.fileAccessor.getRelativePath(this.filename, value);
      // single file include
      files.push(relativeFilePath);
    }
    else {
      // multiple file include
      var filesInThisFolder = await this.fileAccessor.getFilesInFolderRelativeFrom(value, this.filename);
      files = filesInThisFolder.filter(f => path.extname(f) === ".yaml");
    }

    if (files.length === 0) {
      console.log(`The include could not be resolved because no file(s) found in '${value}' included with '${Includetype[includeType]}' from '${this.filename}'`);
    }

    for (var i in files) {
      var key = files[i].replace(/\\/g, "/");
      this.includes[key] = {
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
      //@ts-ignore
      let isNamed = item.value && item.value.type === "MAP";
 
      let filepath = vscodeUri.URI.file(path.resolve(this.filename)).fsPath;
      let filename = path.parse(filepath).base.replace(".yaml", "");

      //@ts-ignore
      var key = isNamed ? item.key.toJSON() : filename;

      if (item.type === "PAIR") {
        var lp = sourceUtils.getLinePos(item.key.range[0], this.cst);
        var lp2 = sourceUtils.getLinePos(item.value.range[1], this.cst);

        this.scripts[key] = {
          fileUri: vscodeUri.URI.file(filepath).toString(),
          start: [lp.line - 1, lp.col - 1],
          end: [lp2.line - 1, lp2.col - 1]
        };
      }
    }
  }
}

export interface ValidationResults {
  isValid: boolean;
  errors?: string[];
}