import {
  JSONWorkerContribution,
  JSONPath,
  CompletionsCollector,
} from "vscode-json-languageservice";
import { IHaConnection } from "../home-assistant/haConnection";

export class DeviceCompletionContribution implements JSONWorkerContribution {
  public static propertyMatches: string[] = ["device_id", "device"];

  constructor(private haConnection: IHaConnection) {}

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
    const parentNode = location[location.length - 2]; // in case or arrays, currentNode is the indexer for the array position
    if (
      !DeviceCompletionContribution.propertyMatches.some(
        (x) =>
          x === currentNode ||
          (!Number.isNaN(+currentNode) && x === parentNode),
      )
    ) {
      return;
    }
    const deviceCompletions = await this.haConnection.getDeviceCompletions();
    deviceCompletions.forEach((c) => {
      if (c.insertText === undefined) {
        c.insertText = c.label;
      }
      result.add(c as any);
    });
  };

  public collectValueCompletions = (
    _resource: string,
    _location: JSONPath,
    _propertyKey: string,
    _result: CompletionsCollector,
  ): Thenable<any> => {
    return Promise.resolve(null);
  };

  public getInfoContribution = (
    _resource: string,
    _location: JSONPath,
  ): Thenable<any> => {
    return Promise.resolve(null);
  };
}
