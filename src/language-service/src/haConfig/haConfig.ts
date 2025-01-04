import * as path from "path";
import { FileAccessor } from "../fileAccessor";
import { HomeAssistantYamlFile } from "./haYamlFile";
import { ScriptReferences, HaFileInfo, IncludeReferences } from "./dto";

export class HomeAssistantConfiguration {
  private files: FilesCollection;

  private subFolder = "";

  public constructor(private fileAccessor: FileAccessor) {
    this.files = {};
  }

  public getAllFiles = (): HaFileInfo[] => {
    const allFiles: HaFileInfo[] = [];

    for (const [filename, yamlFile] of Object.entries(this.files)) {
      allFiles.push(<HaFileInfo>{
        filename,
        path: yamlFile.path,
      });
    }
    return allFiles;
  };

  public updateFile = async (uri: string): Promise<FileUpdateResult> => {
    const filename = this.fileAccessor.fromUriToLocalPath(uri);

    let ourFile = this.files[filename];
    if (!ourFile) {
      return {
        isValidYaml: true,
        newFilesFound: true,
      };
    }
    const homeAssistantYamlFile = new HomeAssistantYamlFile(
      this.fileAccessor,
      filename,
      ourFile.path,
    );
    this.files[filename] = homeAssistantYamlFile;

    const validationResult = await homeAssistantYamlFile.isValid();
    if (!validationResult.isValid) {
      return {
        isValidYaml: false,
        newFilesFound: false,
      };
    }

    const files = await this.discoverCore(filename, ourFile.path, {});
    if (files !== undefined) {
      ourFile = files[filename];
      this.files[filename] = ourFile;

      for (const file in files) {
        if (!this.files[file]) {
          return {
            isValidYaml: true,
            newFilesFound: true,
          };
        }
      }
    }

    return {
      isValidYaml: true,
      newFilesFound: false,
    };
  };

  public getIncludes = async (): Promise<IncludeReferences> => {
    let results = [];
    for (const file of Object.values(this.files)) {
      results.push(file.getIncludes());
    }
    results = await Promise.all(results);

    let allIncludes = {};
    for (const result of results) {
      allIncludes = { ...allIncludes, ...result };
    }
    return allIncludes;
  };

  public getScripts = async (): Promise<ScriptReferences> => {
    let results = [];
    for (const filename of Object.keys(this.files)) {
      results.push(this.files[filename].getScripts());
    }
    results = await Promise.all(results);

    let allScripts = {};
    for (const result of results) {
      allScripts = { ...allScripts, ...result };
    }
    return allScripts;
  };

  private getRootFiles = (): string[] => {
    const filesInRoot = this.fileAccessor.getFilesInFolder("");
    const ourFiles = [
      "configuration.yaml",
      "ui-lovelace.yaml",
      "automations.yaml",
    ];
    const ourFolders = [
      path.join("blueprints", "automation") + path.sep,
      path.join("blueprints", "script") + path.sep,
      "automations" + path.sep,
      "custom_sentences" + path.sep,
    ];

    const rootFiles = ourFiles.filter((f) => filesInRoot.some((y) => y === f));
    const subfolderFiles = filesInRoot.filter((f) =>
      ourFolders.some((y) => f.startsWith(y)),
    );
    const files = [...rootFiles, ...subfolderFiles];

    if (files.length === 0) {
      const areOurFilesSomehwere = filesInRoot.filter((f) =>
        ourFiles.some((ourFile) => f.endsWith(ourFile)),
      );
      if (areOurFilesSomehwere.length > 0) {
        this.subFolder = areOurFilesSomehwere[0].substr(
          0,
          areOurFilesSomehwere[0].lastIndexOf(path.sep),
        );
        return areOurFilesSomehwere;
      }
    }

    return files.map((x) => path.join(this.subFolder, x));
  };

  public discoverFiles = async (): Promise<void> => {
    const rootFiles = this.getRootFiles();

    let results = [];
    for (const rootFile of rootFiles) {
      results.push(
        this.discoverCore(
          rootFile,
          rootFile.substring(this.subFolder.length),
          this.files,
        ),
      );
    }
    results = await Promise.all(results);
    const result = results.pop();
    if (result !== undefined) {
      this.files = result;
    }
  };

  private discoverCore = async (
    filename: string,
    // eslint-disable-next-line no-shadow, @typescript-eslint/no-shadow
    dirPath: string,
    files: FilesCollection,
  ): Promise<FilesCollection> => {
    if (dirPath.startsWith(path.sep)) {
      dirPath = dirPath.substring(1);
    }

    const homeAssistantYamlFile = new HomeAssistantYamlFile(
      this.fileAccessor,
      filename,
      dirPath,
    );
    files[filename] = homeAssistantYamlFile;

    let error = false;
    let errorMessage = `File '${filename}' could not be parsed, it was referenced from path '${dirPath}'.This file will be ignored.`;
    let includes: IncludeReferences = {};
    try {
      includes = await homeAssistantYamlFile.getIncludes();
    } catch (err) {
      error = true;
      errorMessage += ` Error message: ${err}`;
    }
    const validationResult = await homeAssistantYamlFile.isValid();
    if (!validationResult.isValid) {
      error = true;
      if (validationResult.errors && validationResult.errors.length > 0) {
        errorMessage += " Error(s): ";
        // eslint-disable-next-line no-return-assign
        validationResult.errors.forEach((e) => (errorMessage += `\r\n - ${e}`));
      }
    }
    if (validationResult.warnings && validationResult.warnings.length > 0) {
      // validationResult.warnings.forEach(w => console.debug(`Warning parsing file ${filename}: ${w}`));
    }

    if (error) {
      if (filename === dirPath) {
        // root file has more impact
        console.warn(errorMessage);
      } else {
        console.log(errorMessage);
      }
      return files;
    }

    const results = [];
    for (const [filenameKey, include] of Object.entries(includes)) {
      if (Object.keys(files).some((x) => x === filenameKey)) {
        /// we already know this file
        continue;
      }
      results.push(this.discoverCore(filenameKey, include.path, files));
    }
    const fileCollections: FilesCollection[] = await Promise.all(results);
    return fileCollections[fileCollections.length - 1];
  };
}

export interface FilesCollection {
  [filename: string]: HomeAssistantYamlFile;
}
export interface FileUpdateResult {
  isValidYaml: boolean;
  newFilesFound: boolean;
}
