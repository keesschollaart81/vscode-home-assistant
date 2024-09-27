import * as path from "path";
import * as YAML from "yaml";
import { Schema, Node, Collection, Scalar } from "yaml/types";
import { ParsedCST, CST } from "yaml/parse-cst";
import { Type, LinePos } from "yaml/util";
import * as vscodeUri from "vscode-uri";
import { FileAccessor } from "../fileAccessor";
import { IncludeReferences, Includetype, ScriptReferences } from "./dto";

export class HomeAssistantYamlFile {
  private cst: ParsedCST | undefined;

  private yaml: YAML.Document | undefined;

  private includes: IncludeReferences = {};

  private scripts: ScriptReferences = {};

  constructor(
    private fileAccessor: FileAccessor,
    private filename: string,
    // eslint-disable-next-line no-shadow, @typescript-eslint/no-shadow
    public path: string,
  ) {}

  private async parse(): Promise<void> {
    const fileContents = await this.fileAccessor.getFileContents(this.filename);
    if (!fileContents) {
      return;
    }

    this.cst = YAML.parseCST(fileContents);
    this.yaml = new YAML.Document({
      customTags: this.getCustomTags(),
    }).parse(this.cst[0]);

    await this.parseAstRecursive(this.yaml.contents, this.path);
  }

  public isValid = async (): Promise<ValidationResults> => {
    try {
      await this.parse();
    } catch (error) {
      return {
        isValid: false,
        errors: [String(error)],
      };
    }
    if (!this.yaml) {
      return {
        isValid: true,
        warnings: ["Empty YAML"],
      };
    }
    if (this.yaml.errors && this.yaml.errors.length > 0) {
      const errors = this.yaml.errors.slice(0, 3).map((x) => {
        const line =
          x.linePos && x.linePos.start
            ? ` (Line: ${x.linePos.start.line})`
            : "";
        return `${x.name}: ${x.message}${line}`;
      });
      if (this.yaml.errors.length > 3) {
        errors.push(` - And ${this.yaml.errors.length - 3} more errors...`);
      }
      return {
        isValid: false,
        errors,
      };
    }
    return {
      isValid: true,
    };
  };

  public getIncludes = async (): Promise<IncludeReferences> => {
    if (!this.yaml) {
      await this.parse();
    }
    if (!this.yaml) {
      return {};
    }
    return this.includes;
  };

  public getScripts = async (): Promise<ScriptReferences> => {
    if (!this.yaml) {
      await this.parse();
    }
    if (!this.yaml) {
      return {};
    }
    return this.scripts;
  };

  private getCustomTags(): Schema.Tag[] {
    return [
      `env_Var`,
      `input`,
      `secret`,
      `${Includetype[Includetype.include]}`,
      `${Includetype[Includetype.include_dir_list]}`,
      `${Includetype[Includetype.include_dir_merge_list]}`,
      `${Includetype[Includetype.include_dir_merge_named]}`,
      `${Includetype[Includetype.include_dir_named]}`,
    ].map(
      (x) =>
        <Schema.Tag>{
          tag: `!${x}`,
          resolve: (_doc: any, cst: any) => Symbol.for(cst.strValue),
        },
    );
  }

  private parseAstRecursive = async (
    node: Collection | Node | null,
    currentPath: string,
  ): Promise<void> => {
    if (!node) {
      // null object like 'frontend:'
      return;
    }
    switch (node.type) {
      case Type.FLOW_SEQ:
      case Type.MAP:
      case Type.SEQ:
        if (node instanceof Collection) {
          if (
            node.type !== Type.FLOW_SEQ &&
            (currentPath === "configuration.yaml/script" ||
              currentPath ===
                "configuration.yaml/homeassistant/packages/script")
          ) {
            this.collectScripts(node);
            break;
          }
          const results = [];
          for (const item of node.items) {
            if (item == null) {
              // This can happen if the list contains 1 item without a value, e.g.:
              // entity_id:
              //   -
              continue;
            }

            switch (item.type) {
              case "PAIR":
                results.push(
                  this.parseAstRecursive(
                    item.value,
                    `${currentPath}/${this.getKeyName(item.key)}`,
                  ),
                );
                break;
              case Type.BLOCK_FOLDED:
              case Type.BLOCK_LITERAL:
              case Type.FLOW_SEQ:
              case Type.MAP:
              case Type.PLAIN:
              case Type.QUOTE_DOUBLE:
              case Type.QUOTE_SINGLE:
              case Type.SEQ:
                results.push(this.parseAstRecursive(item, currentPath));
                break;
              default:
                break;
            }
          }
          await Promise.all(results);
        }
        break;
      case "BLOCK_FOLDED":
      case "BLOCK_LITERAL":
      case "PLAIN":
      case "QUOTE_DOUBLE":
      case "QUOTE_SINGLE":
        if (node instanceof Scalar && node.tag) {
          this.collectInclude(node, currentPath);
        }
        break;
    }
  };

  private getKeyName = (node: Scalar): string => {
    if (node.tag && node.type === Type.PLAIN) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
      return node.value.toString().slice(7, -1);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return node.toJSON();
  };

  private getIncludeType = (str: string): Includetype | null => {
    let includeType: Includetype;
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
  };

  private collectInclude(x: Scalar, currentPath: string) {
    let value: null | boolean | number | string = "";
    const includeType = this.getIncludeType(`${x.tag}`.slice(1).toLowerCase());
    if (includeType === null) {
      // secrets and other tags
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    value = x.value.toString().slice(7, -1).replace(/\\/g, "/"); // \ to / on windows

    let files: string[] = [];

    if (includeType === Includetype.include) {
      const relativeFilePath = this.fileAccessor.getRelativePath(
        this.filename,
        String(value),
      );
      // single file include
      files.push(relativeFilePath);
    } else {
      // multiple file include
      const filesInThisFolder = this.fileAccessor.getFilesInFolderRelativeFrom(
        String(value),
        this.filename,
      );
      files = filesInThisFolder.filter((f) => path.extname(f) === ".yaml");
    }

    if (files.length === 0) {
      console.log(
        `The include could not be resolved because no file(s) found in '${value}' included with '${Includetype[includeType]}' from '${this.filename}'`,
      );
    }

    for (const file of files) {
      const key = file.replace(/\\/g, "/");
      this.includes[key] = {
        path: currentPath,
        includeType,
        start: x.range[0],
        end: x.range[1],
      };
    }
  }

  private collectScripts(node: Collection) {
    for (const item of node.items) {
      const isNamed = item.value && item.value.type === Type.MAP;

      const filepath = vscodeUri.URI.file(path.resolve(this.filename)).fsPath;
      const filename = path.parse(filepath).base.replace(".yaml", "");

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const key = isNamed ? item.key.toJSON() : filename;

      if (item.type === "PAIR") {
        const lp = this.getLinePos(item.key.range[0], this.cst);
        const lp2 = this.getLinePos(item.value.range[1], this.cst);

        if (lp !== null && lp2 !== null) {
          this.scripts[key] = {
            fileUri: vscodeUri.URI.file(filepath).toString(),
            start: [lp.line - 1, lp.col - 1],
            end: [lp2.line - 1, lp2.col - 1],
          };
        }
      }
    }
  }

  /**
   * This function is copied from the YAML library, as it is not exposed.
   *
   * @source https://github.com/eemeli/yaml/blob/master/src/cst/source-utils.js
   */
  private findLineStarts(src: string): number[] {
    const ls = [0];
    let offset = src.indexOf("\n");
    while (offset !== -1) {
      offset += 1;
      ls.push(offset);
      offset = src.indexOf("\n", offset);
    }
    return ls;
  }

  /**
   * Get YAML source information.
   *
   * This function is copied from the YAML library, as it is not exposed.
   *
   * @source https://github.com/eemeli/yaml/blob/master/src/cst/source-utils.js
   */
  private getSrcInfo(cst: string | ParsedCST | CST.Document | CST.Document[]) {
    let lineStarts;
    let src;
    if (typeof cst === "string") {
      lineStarts = this.findLineStarts(cst);
      src = cst;
    } else {
      if (Array.isArray(cst)) {
        cst = cst[0];
      }

      if (cst && cst.context) {
        lineStarts = this.findLineStarts(cst.context.src);
        src = cst.context.src;
      }
    }
    return { lineStarts, src };
  }

  /**
   * Determine the line/col position matching a character offset.
   *
   * Accepts a source string or a CST document as the second parameter. With
   * the latter, starting indices for lines are cached in the document as
   * `lineStarts: number[]`.
   *
   * Returns a one-indexed `{ line, col }` location if found, or
   * `undefined` otherwise.
   *
   * This function is copied from the YAML library, as it is not exposed.
   *
   * @source https://github.com/eemeli/yaml/blob/master/src/cst/source-utils.js
   */
  private getLinePos(
    offset: number,
    cst: string | ParsedCST | undefined,
  ): LinePos | null {
    if (typeof offset !== "number" || offset < 0) {
      return null;
    }

    if (cst === undefined) {
      return null;
    }

    const { lineStarts, src } = this.getSrcInfo(cst);
    if (!lineStarts || !src || offset > src.length) {
      return null;
    }

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < lineStarts.length; ++i) {
      const start = lineStarts[i];
      if (offset < start) {
        return { line: i, col: offset - lineStarts[i - 1] + 1 };
      }
      if (offset === start) return { line: i + 1, col: 1 };
    }
    const line = lineStarts.length;
    return { line, col: offset - lineStarts[line - 1] + 1 };
  }
}

export interface ValidationResults {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
}
