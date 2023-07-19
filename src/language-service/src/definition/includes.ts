import { Definition, Location } from "vscode-languageserver-protocol";
import * as path from "path";
import { FileAccessor } from "../fileAccessor";
import { DefinitionProvider } from "./definition";

export class IncludeDefinitionProvider implements DefinitionProvider {
  constructor(private fileAccessor: FileAccessor) {}

  public onDefinition = async (
    line: string,
    uri: string,
    // eslint-disable-next-line @typescript-eslint/require-await
  ): Promise<Definition[]> => {
    const matches = /(.*)(!include\S*)\s+(["'])?(.+)\3/.exec(line);
    if (!matches || matches.length !== 5) {
      return [];
    }
    const includeType = matches[2];
    const whatToInclude = `${matches[4]}`.trim();
    switch (includeType) {
      case "!include":
        // eslint-disable-next-line no-case-declarations
        const destination = this.fileAccessor.getRelativePathAsFileUri(
          uri,
          whatToInclude,
        );
        return [
          Location.create(destination, {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 0 },
          }),
        ];
      case "!include_dir_list":
      case "!include_dir_named":
      case "!include_dir_merge_list":
      case "!include_dir_merge_named":
        // eslint-disable-next-line no-case-declarations
        let files = this.fileAccessor.getFilesInFolderRelativeFromAsFileUri(
          whatToInclude,
          uri,
        );
        files = files.filter((f) => path.extname(f) === ".yaml");
        if (files.length === 0) {
          console.warn(
            `There were no files found in folder '${whatToInclude}' referenced with '${includeType}' from '${uri}'`,
          );
        }
        return files.map((f) =>
          Location.create(f, {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 0 },
          }),
        );
      default:
        return [];
    }
  };
}
