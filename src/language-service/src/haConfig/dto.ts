export enum Includetype {
  include,
  include_dir_list,
  include_dir_named,
  include_dir_merge_list,
  include_dir_merge_named,
}

export interface HaFileInfo {
  filename: string;
  path: string;
}

export interface IncludeReferences {
  [filename: string]: {
    path: string;
    includeType: Includetype;
    start: number;
    end: number;
  };
}
export interface ScriptReferences {
  [scriptFilename: string]: {
    fileUri: string;
    start: [number, number];
    end: [number, number];
  };
}
export interface YamlIncludePlaceholder {
  isInclude: boolean;
  fromFile: string;
  includeType: Includetype;
  toFileOrFolder: string;
  start: number;
  end: number;
}
