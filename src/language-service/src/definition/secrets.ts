import { Definition, Location } from "vscode-languageserver-protocol";
import * as YAML from "yaml";
import { FileAccessor } from "../fileAccessor";
import { DefinitionProvider } from "./definition";

export class SecretsDefinitionProvider implements DefinitionProvider {
  constructor(private fileAccessor: FileAccessor) {}

  public onDefinition = async (
    line: string,
    uri: string,
  ): Promise<Definition[]> => {
    const matches = /(.*)(!secret)\s+([a-zA-Z0-9_]+)(.*)/.exec(line);
    if (!matches || matches.length !== 5) {
      return [];
    }

    const secretName = matches[3];
    
    try {
      // secrets.yaml is always in the root of the project
      const secretsPath = "secrets.yaml";
      const secretsContent = await this.fileAccessor.getFileContents(secretsPath);

      if (!secretsContent) {
        console.log("No secrets.yaml file found");
        return [];
      }

      // Parse the YAML content
      const secretsDocument = YAML.parseDocument(secretsContent);
      if (!secretsDocument.contents || typeof secretsDocument.contents !== "object") {
        console.log("Invalid secrets.yaml content");
        return [];
      }

      // Find the secret key in the YAML document
      if (secretsDocument.contents && "items" in secretsDocument.contents) {
        const contents = secretsDocument.contents as any;
        for (const item of contents.items) {
          if (item && item.key && typeof item.key.value === "string" && item.key.value === secretName) {
            // Found the secret! Now get its position
            const range = item.key.range as [number, number, number];
            if (range && range.length >= 2) {
              const startOffset = range[0];
              
              // Convert offset to line/character position
              const lines = secretsContent.split("\n");
              let currentOffset = 0;
              let line = 0;
              let character = 0;
              
              for (let i = 0; i < lines.length; i++) {
                const lineLength = lines[i].length + 1; // +1 for newline
                if (currentOffset + lineLength > startOffset) {
                  line = i;
                  character = startOffset - currentOffset;
                  break;
                }
                currentOffset += lineLength;
              }

              // Get the URI for secrets.yaml
              const secretsUri = this.fileAccessor.getRelativePathAsFileUri(uri, secretsPath);
              
              return [
                Location.create(secretsUri, {
                  start: { line, character },
                  end: { line, character: character + secretName.length },
                }),
              ];
            }
          }
        }
      }

      console.log(`Secret '${secretName}' not found in secrets.yaml`);
      return [];
    } catch (error) {
      console.error("Error reading secrets.yaml:", error);
      return [];
    }
  };
}
