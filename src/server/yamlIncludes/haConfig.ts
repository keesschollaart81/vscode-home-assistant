import { FileAccessor } from "../fileAccessor";
import { HomeAssistantYamlFile } from "./haYamlFile";
import { IncludeReferences } from "./dto";
import { ScriptReferences } from "./scriptParser";

export class HomeAssistantConfiguration {

  private files: { [filename: string]: HomeAssistantYamlFile };

  public constructor(private fileAccessor: FileAccessor) {
    this.files = {};
  }

  public getIncludes = async (): Promise<IncludeReferences> => {
    var allIncludes = {};
    for (var filename in this.files) {
      var includes = await this.files[filename].getIncludes();
      allIncludes = { ...allIncludes, ...includes };
    }
    return allIncludes;
  }

  public getScripts = async (): Promise<ScriptReferences> => {
    var allScripts = {};
    for (var filename in this.files) {
      var scripts = await this.files[filename].getScripts();
      allScripts = { ...allScripts, ...scripts };
    }
    return allScripts;
  }

  public discoverFiles = async (files: string[] = ["configuration.yaml", "ui-lovelace.yaml"]): Promise<void> => {
    this.files = {};
    for (var index in files) {
      await this.discoverCore(files[index], files[index]);
    }
  }

  private discoverCore = async (filename: string, path: string): Promise<void> => {
    var homeAssistantYamlFile = new HomeAssistantYamlFile(this.fileAccessor, filename, path);
    this.files[filename] = homeAssistantYamlFile;

    var includes = await homeAssistantYamlFile.getIncludes();
    for (var filenameKey in includes) {
      if (Object.keys(this.files).some(x => x === filenameKey)) {
        /// we already know this file
        continue;
      }
      var currentPath = `${includes[filenameKey]}`;
      await this.discoverCore(filenameKey, currentPath);
    }
  }
}
