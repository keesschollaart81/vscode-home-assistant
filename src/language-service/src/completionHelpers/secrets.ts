import { MarkedString } from "vscode-languageserver-protocol";
import {
  JSONWorkerContribution,
  JSONPath,
  CompletionsCollector,
} from "vscode-json-languageservice";
import { CompletionItem, CompletionItemKind } from "vscode-languageserver-protocol";
import * as YAML from "yaml";
import { FileAccessor } from "../fileAccessor";

export class SecretsCompletionContribution implements JSONWorkerContribution {
  // This is a special case - secrets are triggered by !secret tag, not property names
  public static propertyMatches: string[] = [];

  constructor(private fileAccessor: FileAccessor) {}

  public collectDefaultCompletions(
    _resource: string,
    _result: CompletionsCollector,
  ): Thenable<any> {
    return Promise.resolve(null);
  }

  public collectPropertyCompletions = async (
    _resource: string,
    _location: JSONPath,
    _currentWord: string,
    _addValue: boolean,
    _isLast: boolean,
    _result: CompletionsCollector,
  ): Promise<any> => {
    // Secrets completion is handled differently - not by property names
    return Promise.resolve(null);
  };

  public collectValueCompletions = async (
    _resource: string,
    _location: JSONPath,
    _currentKey: string,
    _result: CompletionsCollector,
  ): Promise<any> => {
    // Secrets completion is handled differently - not by property names
    return Promise.resolve(null);
  };

  public getInfoContribution(
    _resource: string,
    _location: JSONPath,
  ): Thenable<MarkedString[]> {
    return Promise.resolve([]);
  }

  /**
   * Get secrets completions by reading and parsing the secrets.yaml file
   */
  public async getSecretsCompletions(): Promise<CompletionItem[]> {
    try {
      // secrets.yaml is always in the root of the project
      const secretsPath = "secrets.yaml";
      const secretsContent = await this.fileAccessor.getFileContents(secretsPath);

      if (!secretsContent) {
        return [];
      }

      // Parse the YAML content
      const secretsDocument = YAML.parseDocument(secretsContent);
      if (!secretsDocument.contents || typeof secretsDocument.contents !== "object") {
        return [];
      }

      const completions: CompletionItem[] = [];
      
      // Extract all top-level keys from the secrets file
      if (secretsDocument.contents && "items" in secretsDocument.contents) {
        const contents = secretsDocument.contents as any;
        for (const item of contents.items) {
          if (item && item.key && typeof item.key.value === "string") {
            const secretKey = item.key.value;
            const completionItem = CompletionItem.create(secretKey);
            completionItem.kind = CompletionItemKind.Variable;
            completionItem.insertText = secretKey;
            completionItem.detail = "Secret from secrets.yaml";
            completionItem.data = {};
            completionItem.data.isSecret = true;

            // Add documentation if there's a comment or value
            let documentation = `**${secretKey}**\n\nSecret from: secrets.yaml`;
            if (item.value && typeof item.value.value === "string") {
              // Don't show the actual secret value for security, just indicate it has a value
              documentation += "\n\nValue: [HIDDEN]";
            }
            
            completionItem.documentation = {
              kind: "markdown",
              value: documentation,
            };

            completions.push(completionItem);
          }
        }
      }

      return completions;
    } catch (error) {
      console.log("Error reading secrets file:", error);
      return [];
    }
  }

  /**
   * Get all available secret keys from the secrets.yaml file
   */
  public async getAvailableSecrets(): Promise<string[]> {
    try {
      // secrets.yaml is always in the root of the project
      const secretsPath = "secrets.yaml";
      const secretsContent = await this.fileAccessor.getFileContents(secretsPath);

      if (!secretsContent) {
        return [];
      }

      // Parse the YAML content
      const secretsDocument = YAML.parseDocument(secretsContent);
      if (!secretsDocument.contents || typeof secretsDocument.contents !== "object") {
        return [];
      }

      const secretKeys: string[] = [];
      
      // Extract all top-level keys from the secrets file
      if (secretsDocument.contents && "items" in secretsDocument.contents) {
        const contents = secretsDocument.contents as any;
        for (const item of contents.items) {
          if (item && item.key && typeof item.key.value === "string") {
            secretKeys.push(item.key.value);
          }
        }
      }

      return secretKeys;
    } catch (error) {
      console.log("Error reading secrets file:", error);
      return [];
    }
  }
}
