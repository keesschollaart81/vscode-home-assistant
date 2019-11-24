import * as path from "path";
import { FileAccessor } from "../fileAccessor";
import { HomeAssistantYamlFile } from "./haYamlFile";
import { IncludeReferences, ScriptReferences, HaFileInfo } from "./dto";
import { IConfigurationService } from "../configuration";

export class HomeAssistantConfiguration {

  private files: FilesCollection;

  public constructor(private fileAccessor: FileAccessor, private configurationService: IConfigurationService) {
    this.files = {};
  }

  public getAllFiles = async (): Promise<HaFileInfo[]> => {
    let allFiles: HaFileInfo[] = [];

    for (var filename in this.files) {

      allFiles.push(<HaFileInfo>{
        filename: filename,
        path: this.files[filename].path
      });
    }
    return allFiles;
  }

  public updateFile = async (uri: string): Promise<FileUpdateResult> => {
    let filename = this.fileAccessor.fromUriToLocalPath(uri);

    let ourFile = this.files[filename];
    if (!ourFile) {
      return {
        isValidYaml: true,
        newFilesFound: true
      };
    }
    var homeAssistantYamlFile = new HomeAssistantYamlFile(this.fileAccessor, filename, ourFile.path);
    this.files[filename] = homeAssistantYamlFile;

    var validationResult = await homeAssistantYamlFile.isValid();
    if (!validationResult.isValid) {
      return {
        isValidYaml: false,
        newFilesFound: false
      };
    }

    let files = await this.discoverCore(filename, ourFile.path, {});
    ourFile = files[filename];
    this.files[filename] = ourFile;

    for (let filename in files) {
      if (!this.files[filename]) {
        return {
          isValidYaml: true,
          newFilesFound: true
        };
      }
    }
    return {
      isValidYaml: true,
      newFilesFound: false
    };
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

  private getRootFiles = (): string[] => {
    var configRootPath = this.configurationService.configRootPath || "";
    var filesInRoot = this.fileAccessor.getFilesInFolder(configRootPath);
    let files = ["configuration.yaml", "ui-lovelace.yaml"].map(f => path.join(configRootPath, f)).filter(f => filesInRoot.some(y => y === f));
    return files;
  }

  public discoverFiles = async (): Promise<void> => {
    let rootFiles = this.getRootFiles();
    this.files = {};
    for (var index in rootFiles) {
      this.files = await this.discoverCore(rootFiles[index], rootFiles[index], this.files);
    }
  }

  private discoverCore = async (filename: string, path: string, files: FilesCollection): Promise<FilesCollection> => {

    var homeAssistantYamlFile = new HomeAssistantYamlFile(this.fileAccessor, filename, path);
    files[filename] = homeAssistantYamlFile;

    let error = false;
    var errorMessage = `File '${filename}' could not be parsed, it was referenced from path '${path}'. This file will be ignored.`;
    try {
      var includes = await homeAssistantYamlFile.getIncludes();
    }
    catch (err) {
      error = true;
      errorMessage += ` Error message: ${err}`;
    }

    var validationResult = await homeAssistantYamlFile.isValid();
    if (!validationResult.isValid) {
      error = true;
      if (validationResult.errors && validationResult.errors.length > 0) {
        errorMessage += " Error(s): ";
        validationResult.errors.forEach(e => errorMessage += `\r\n - ${e}`);
      }
    }
    if (error) {
      if (filename === path) {
        // root file has more impact
        console.warn(errorMessage);
      }
      else {
        console.log(errorMessage);
      }
      return files;
    }

    for (var filenameKey in includes) {
      if (Object.keys(files).some(x => x === filenameKey)) {
        /// we already know this file
        continue;
      }
      var currentPath = `${includes[filenameKey].path}`;

      files = await this.discoverCore(filenameKey, currentPath, files);
    }
    return files;
  }
}

export interface FilesCollection {
  [filename: string]: HomeAssistantYamlFile;
}
export interface FileUpdateResult {
  isValidYaml: boolean;
  newFilesFound: boolean;
}