import { MarkedString } from "vscode-languageserver-protocol";
import {
  JSONWorkerContribution,
  JSONPath,
  CompletionsCollector,
  Thenable,
} from "vscode-json-languageservice";
import { IHaConnection } from "../home-assistant/haConnection";

export class ServicesCompletionContribution implements JSONWorkerContribution {
  public static propertyMatches: string[] = ["service"];

  constructor(private haConnection: IHaConnection) {}

  public collectDefaultCompletions(
    _resource: string,
    _result: CompletionsCollector,
  ): Thenable<any> {
    return Promise.reject();
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
    const parentNode = location[location.length - 2]; // in case or arrays, currentNode is the indexer for the array position
    if (
      !ServicesCompletionContribution.propertyMatches.some(
        (x) => x === currentNode || x === parentNode,
      )
    ) {
      return;
    }
    const servicesCompletions = await this.haConnection.getServiceCompletions();
    servicesCompletions.forEach((c) => {
      if (c.insertText === undefined) {
        c.insertText = c.label;
      }
      result.add(c as any);
    });
  };

  public collectValueCompletions = async (
    _resource: string,
    _location: JSONPath,
    currentKey: string,
    result: CompletionsCollector,
  ): Promise<any> => {
    if (
      !ServicesCompletionContribution.propertyMatches.some(
        (x) => x === currentKey,
      )
    ) {
      return;
    }
    const servicesCompletions = await this.haConnection.getServiceCompletions();
    servicesCompletions.forEach((c) => {
      if (c.insertText === undefined) {
        c.insertText = c.label;
      }
      result.add(c as any);
    });
  };

  public getInfoContribution(
    _resource: string,
    _location: JSONPath,
  ): Thenable<MarkedString[]> {
    return Promise.resolve([]);
  }
}
