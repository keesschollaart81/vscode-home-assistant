export interface FileAccessor {
  getFileContents(fileName: string): Promise<string>;
  getFilesInFolder(subFolder: string): Promise<string[]>;
  getFilesInFolderRelativeFrom(
    subFolder: string,
    relativeFrom: string,
  ): Promise<string[]>;
  getFilesInFolderRelativeFromAsFileUri(
    subFolder: string,
    relativeFrom: string,
  ): Promise<string[]>;
  getRelativePath(relativeFrom: string, filename: string): string;
  getRelativePathAsFileUri(relativeFrom: string, filename: string): string;
  fromUriToLocalPath(uri: string): string;
}
