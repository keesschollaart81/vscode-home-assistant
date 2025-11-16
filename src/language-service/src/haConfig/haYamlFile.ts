import * as path from "path";
import * as YAML from "yaml";
import { Node, isMap, isSeq, isPair, isScalar, Scalar, YAMLMap, LineCounter } from "yaml";
import * as vscodeUri from "vscode-uri";
import { FileAccessor } from "../fileAccessor";
import { IncludeReferences, Includetype, ScriptReferences } from "./dto";

export class HomeAssistantYamlFile {
  private yaml: YAML.Document | undefined;
  private lineCounter: LineCounter | undefined;
  private currentPath = ""; // Track current path during parsing

  private includes: IncludeReferences = {};

  private scripts: ScriptReferences = {};

  constructor(
    private fileAccessor: FileAccessor,
    private filename: string,

    public path: string,
  ) {}

  private async parse(): Promise<void> {
    const fileContents = await this.fileAccessor.getFileContents(this.filename);
    if (!fileContents) {
      return;
    }

    // Create a line counter to track positions
    this.lineCounter = new LineCounter();

    this.yaml = YAML.parseDocument(fileContents, {
      customTags: this.getCustomTags(),
      keepSourceTokens: true,
      lineCounter: this.lineCounter,
    });

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
        const line = x.linePos && x.linePos[0] 
          ? ` (Line: ${x.linePos[0].line})` 
          : "";
        return `${x.name || "YAMLError"}: ${x.message}${line}`;
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

  private getCustomTags() {
    return [
      "env_var",
      "input", 
      "secret",
      `${Includetype[Includetype.include]}`,
      `${Includetype[Includetype.include_dir_list]}`,
      `${Includetype[Includetype.include_dir_merge_list]}`,
      `${Includetype[Includetype.include_dir_merge_named]}`,
      `${Includetype[Includetype.include_dir_named]}`,
    ].map(
      (x) => ({
        tag: `!${x}`,
        resolve: (value: string) => value,
      }),
    );
  }

  private parseAstRecursive = async (
    node: Node | null,
    currentPath: string,
  ): Promise<void> => {
    if (!node) {
      return;
    }

    // Update the current path being processed
    this.currentPath = currentPath;

    // Handle maps (objects)
    if (isMap(node)) {
      // Check if this is a scripts section in different formats
      if (currentPath === "configuration.yaml/script" ||
          currentPath === "configuration.yaml/homeassistant/packages/script") {
        this.collectScripts(node);
        return;
      }

      // Check for script definitions in format: script my_script:
      if (currentPath.endsWith("/script") || 
          /^configuration\.yaml\/script\s+/.test(currentPath)) {
        this.collectScripts(node);
        return;
      }
      
      for (const pair of node.items) {
        if (isPair(pair) && pair.value) {
          const keyName = this.getKeyName(pair.key as Scalar);
          // Type guard to ensure pair.value is a Node
          if (typeof pair.value === "object" && pair.value !== null) {
            await this.parseAstRecursive(
              pair.value as Node,
              `${currentPath}/${keyName}`,
            );
          }
        }
      }
    }
    
    // Handle sequences (arrays)
    else if (isSeq(node)) {
      for (const item of node.items) {
        if (item !== null && item !== undefined && typeof item === "object") {
          await this.parseAstRecursive(item as Node, currentPath);
        }
      }
    }
    
    // Handle scalar nodes with include tags
    else if (isScalar(node) && node.tag) {
      await this.collectInclude(node, currentPath);
    }
  };

  private getKeyName = (node: Scalar): string => {
    if (node.tag && node.type === "PLAIN") {
      return node.value.toString().slice(7, -1);
    }

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

  private async collectInclude(x: Scalar, currentPath: string) {
    let value: null | boolean | number | string = "";
    const includeType = this.getIncludeType(`${x.tag}`.slice(1).toLowerCase());
    if (includeType === null) {
      // secrets and other tags
      return;
    }

    value = x.value.toString().replace(/\\/g, "/"); // \ to / on windows

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
      const filesInThisFolder = await this.fileAccessor.getFilesInFolderRelativeFrom(
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

  private collectScripts(node: YAMLMap) {
    const filepath = vscodeUri.URI.file(path.resolve(this.filename)).fsPath;
    
    // Check if this is a direct script definition (script another_script:)
    const directScriptMatch = /^configuration\.yaml\/script\s+(.+)$/.exec(this.currentPath);
    if (directScriptMatch) {
      const scriptId = directScriptMatch[1];
      
      let startPos: [number, number] = [0, 0];
      let endPos: [number, number] = [0, 0];
      
      // For direct script definitions, try to get position from the first relevant item
      if (this.lineCounter && node.items.length > 0) {
        for (const item of node.items) {
          if (item && item.key && typeof item.key === "object" && item.key !== null && "range" in item.key && 
              Array.isArray((item.key as any).range)) {
            const range = (item.key as any).range as [number, number, number];
            const startOffset = range[0];
            const endOffset = range[2] || range[1];
            
            const startLinePos = this.lineCounter.linePos(startOffset);
            const endLinePos = this.lineCounter.linePos(endOffset);
            
            // Convert from 1-indexed to 0-indexed positions as expected by VS Code
            startPos = [startLinePos.line - 1, startLinePos.col - 1];
            endPos = [endLinePos.line - 1, endLinePos.col - 1];
            break; // Use the first item with a range
          }
        }
      }
      
      this.scripts[scriptId] = {
        fileUri: vscodeUri.URI.file(filepath).toString(),
        start: startPos,
        end: endPos,
      };
      
      return;
    }
    
    // Handle regular script section (script:)
    for (const item of node.items) {
      const isNamed = item.value && isMap(item.value);
      const filename = path.parse(filepath).base.replace(".yaml", "");

      let key: string;
      if (isNamed && item.key && isScalar(item.key)) {
        key = item.key.toJSON();
      } else {
        key = filename;
      }

      if (isPair(item)) {
        let startPos: [number, number] = [0, 0];
        let endPos: [number, number] = [0, 0];

        // Get position from range property if available and line counter exists
        if (this.lineCounter && item.key && typeof item.key === "object" && item.key !== null && "range" in item.key && Array.isArray((item.key as any).range)) {
          const range = (item.key as any).range as [number, number, number];
          const startOffset = range[0];
          const endOffset = range[2] || range[1];
          
          const startLinePos = this.lineCounter.linePos(startOffset);
          const endLinePos = this.lineCounter.linePos(endOffset);
          
          // Convert from 1-indexed to 0-indexed positions as expected by VS Code
          startPos = [startLinePos.line - 1, startLinePos.col - 1];
          endPos = [endLinePos.line - 1, endLinePos.col - 1];
        }

        this.scripts[key] = {
          fileUri: vscodeUri.URI.file(filepath).toString(),
          start: startPos,
          end: endPos,
        };
      }
    }
  }
}

export interface ValidationResults {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
}
