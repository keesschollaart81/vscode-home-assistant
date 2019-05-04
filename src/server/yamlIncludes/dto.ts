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