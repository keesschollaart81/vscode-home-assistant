import { MarkedString } from "vscode-languageserver-protocol";
import {
  JSONWorkerContribution,
  JSONPath,
  CompletionsCollector,
} from "vscode-json-languageservice";
import { IHaConnection } from "../home-assistant/haConnection";

export class LabelCompletionContribution implements JSONWorkerContribution {
  public static propertyMatches: string[] = ["label_id", "label"];

  constructor(private haConnection: IHaConnection) {}

  public collectDefaultCompletions(
    resource: string,
    result: CompletionsCollector,
  ): Thenable<any> {
    return Promise.resolve(null);
  }

  public collectPropertyCompletions = async (
    resource: string,
    location: JSONPath,
    currentWord: string,
    addValue: boolean,
    isLast: boolean,
    result: CompletionsCollector,
  ): Promise<any> => {
    if (location.length < 2) {
      return;
    }
    const currentNode = location[location.length - 1];
    const parentNode = location[location.length - 2]; // in case or arrays, currentNode is the indexer for the array position
    if (
      !LabelCompletionContribution.propertyMatches.some(
        (x) =>
          x === currentNode ||
          (!Number.isNaN(+currentNode) && x === parentNode),
      )
    ) {
      return;
    }
    const labelCompletions = await this.haConnection.getLabelCompletions();
    labelCompletions.forEach((c) => result.add(c));
  };

  public collectValueCompletions = async (
    resource: string,
    location: JSONPath,
    currentKey: string,
    result: CompletionsCollector,
  ): Promise<any> => {
    if (
      !LabelCompletionContribution.propertyMatches.some((x) => x === currentKey)
    ) {
      return;
    }

    const labelCompletions = await this.haConnection.getLabelCompletions();
    labelCompletions.forEach((c) => result.add(c));
  };

  public getInfoContribution(
    resource: string,
    location: JSONPath,
  ): Thenable<MarkedString[]> {
    return Promise.resolve([]);
  }
}
