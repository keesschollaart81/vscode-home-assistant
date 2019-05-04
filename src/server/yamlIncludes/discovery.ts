import { FileAccessor } from "../fileAccessor";
import { YamlIncludeFileParser } from "./fileParser";
import { FilePathMapping } from "./dto";

export class YamlIncludeDiscovery {

  constructor(private fileAccessor: FileAccessor) { }

  public discoverFiles = async (filenames: string[]): Promise<FilePathMapping> => {
    var result: FilePathMapping = {};
    for (var filename in filenames) {
      var fileDiscoveryResult = await this.discover(filenames[filename]);
      result = { ...result, ...fileDiscoveryResult };
    }
    return result;
  }

  public discover = async (filename: string): Promise<FilePathMapping> => {
    return await this.discoverCore(filename, filename);
  }

  private discoverCore = async (filename: string, path: string): Promise<FilePathMapping> => {
    var result: FilePathMapping = {};
    var parser = new YamlIncludeFileParser(this.fileAccessor);
    var parseResult = await parser.parse(filename, path);
    for (var filenameKey in parseResult) {
      var currentPath = `${parseResult[filenameKey].path}`;
      var resultsRecursive = await this.discoverCore(filenameKey, currentPath);
      result = { ...result, ...resultsRecursive };
    }
    return { ...result, ...parseResult };
  }
}
