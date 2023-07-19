export interface FileAccessor {
  getFileContents(fileName: string): Promise<string>;
  getFilesInFolder(subFolder: string): string[];
  getFilesInFolderRelativeFrom(
    subFolder: string,
    relativeFrom: string,
  ): string[];
  getFilesInFolderRelativeFromAsFileUri(
    subFolder: string,
    relativeFrom: string,
  ): string[];
  getRelativePath(relativeFrom: string, filename: string): string;
  getRelativePathAsFileUri(relativeFrom: string, filename: string): string;
  fromUriToLocalPath(uri: string): string;
}
