import { MarkedString } from "vscode-languageserver-protocol";
import {
  JSONWorkerContribution,
  JSONPath,
  CompletionsCollector,
} from "vscode-json-languageservice";
import { IHaConnection } from "../home-assistant/haConnection";

export class JinjaCompletionContribution implements JSONWorkerContribution {
  public static propertyMatches: string[] = [
    "template",
    "value_template",
    "value",
    "entity_id",
  ];

  constructor(private haConnection: IHaConnection) {}

  public collectDefaultCompletions(
    resource: string,
    result: CompletionsCollector
  ): Thenable<any> {
    return Promise.resolve(null);
  }

  public collectPropertyCompletions = (
    resource: string,
    location: JSONPath,
    currentWord: string,
    addValue: boolean,
    isLast: boolean,
    result: CompletionsCollector
  ): any => {
    if (location.length < 2) {
      return;
    }
    const currentNode = location[location.length - 1];
    const parentNode = location[location.length - 2]; // in case or arrays, currentNode is the indexer for the array position
    if (
      !JinjaCompletionContribution.propertyMatches.some(
        (x) =>
          x === currentNode || (!Number.isNaN(+currentNode) && x === parentNode)
      )
    ) {
      return;
    }
    const jinjaCompletions = this.haConnection.getJinjaCompletions();
    jinjaCompletions.forEach((c) => result.add(c));
  };

  public collectValueCompletions = (
    resource: string,
    location: JSONPath,
    currentKey: string,
    result: CompletionsCollector
  ): any => {
    if (
      !JinjaCompletionContribution.propertyMatches.some((x) => x === currentKey)
    ) {
      return;
    }

    const jinjaCompletions = this.haConnection.getJinjaCompletions();
    jinjaCompletions.forEach((c) => result.add(c));
  };

  public getInfoContribution(
    resource: string,
    location: JSONPath
  ): Thenable<MarkedString[]> {
    return Promise.resolve([]);
  }
}
