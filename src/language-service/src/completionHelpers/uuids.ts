import { MarkedString, CompletionItemKind } from "vscode-languageserver-protocol";
import {
  JSONWorkerContribution,
  JSONPath,
  CompletionsCollector,
} from "vscode-json-languageservice";
import { v4 as uuidv4 } from "uuid";

export class UuidCompletionContribution implements JSONWorkerContribution {
  public static propertyMatches: string[] = ["unique_id", "id"];

  public collectDefaultCompletions(
    _resource: string,
    _result: CompletionsCollector,
  ): Thenable<any> {
    return Promise.resolve(null);
  }

  public collectPropertyCompletions = async (
    _resource: string,
    location: JSONPath,
    _currentWord: string,
    _addValue: boolean,
    _isLast: boolean,
    result: CompletionsCollector,
  ): Promise<any> => {
    if (location.length < 2) {
      return;
    }
    const currentNode = location[location.length - 1];
    const parentNode = location[location.length - 2]; // in case of arrays, currentNode is the indexer for the array position
    if (
      !UuidCompletionContribution.propertyMatches.some(
        (x) =>
          x === currentNode ||
          (!Number.isNaN(+currentNode) && x === parentNode),
      )
    ) {
      return;
    }

    // Generate appropriate UUID based on the key
    const key = typeof currentNode === "string" ? currentNode : String(parentNode);
    const generatedValue = this.generateUuid(key);
    
    const completionItem = {
      label: "Generate unique identifier",
      kind: CompletionItemKind.Function,
      insertText: generatedValue,
      detail: "Generate a random unique UUID for the property",
      documentation: {
        kind: "markdown",
        value: `Generates a proper UUID: \`${generatedValue}\``
      },
      sortText: "0000", // High priority to appear at top
    };

    result.add(completionItem as any);
  };

  public collectValueCompletions = async (
    _resource: string,
    _location: JSONPath,
    currentKey: string,
    result: CompletionsCollector,
  ): Promise<any> => {
    if (
      !UuidCompletionContribution.propertyMatches.some((x) => x === currentKey)
    ) {
      return;
    }

    // Generate appropriate UUID based on the key
    const generatedValue = this.generateUuid(currentKey);
    
    const completionItem = {
      label: "Generate unique identifier",
      kind: CompletionItemKind.Function,
      insertText: generatedValue,
      detail: "Generate a random unique UUID for the property",
      documentation: {
        kind: "markdown",
        value: `Generates a proper UUID: \`${generatedValue}\``
      },
      sortText: "0000", // High priority to appear at top
    };

    result.add(completionItem as any);
  };

  public getInfoContribution(
    _resource: string,
    _location: JSONPath,
  ): Thenable<MarkedString[]> {
    return Promise.resolve([]);
  }

  /**
   * Generate UUID v4 for any key type
   * @param _key The property key (id or unique_id) - not used but kept for interface consistency
   * @returns Generated UUID v4 string
   */
  public generateUuid(_key: string): string {
    return uuidv4();
  }
}
