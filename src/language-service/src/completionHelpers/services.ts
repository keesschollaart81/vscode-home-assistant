import { MarkedString } from "vscode-languageserver-protocol";
import {
  JSONWorkerContribution,
  JSONPath,
  CompletionsCollector,
  Thenable,
} from "vscode-json-languageservice";
import { IHaConnection } from "../home-assistant/haConnection";
import { HassService } from "home-assistant-js-websocket";

export class ServicesCompletionContribution implements JSONWorkerContribution {
  public static propertyMatches: string[] = ["service", "action"];

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
    const actionsCompletions = await this.haConnection.getServiceCompletions();
    actionsCompletions.forEach((c) => {
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
    const actionsCompletions = await this.haConnection.getServiceCompletions();
    actionsCompletions.forEach((c) => {
      if (c.insertText === undefined) {
        c.insertText = c.label;
      }
      result.add(c as any);
    });
  };

  public getInfoContribution(
    _resource: string,
    location: JSONPath,
  ): Thenable<MarkedString[]> {
    return this.getActionHoverInfo(location);
  }

  private async getActionHoverInfo(
    location: JSONPath,
  ): Promise<MarkedString[]> {
    try {
      // Get the current word/value at the location
      const actionId = this.extractActionIdFromLocation(location);
      if (!actionId) {
        return [];
      }

      // Get all actions from Home Assistant
      const services = await this.haConnection.getHassServices();
      if (!services) {
        return [];
      }

      // Parse domain and action name from the action ID (e.g., "light.turn_on")
      const [domain, serviceName] = actionId.split(".");
      if (!domain || !serviceName) {
        return [];
      }

      // Find the specific action
      const domainServices = services[domain];
      if (!domainServices) {
        return [];
      }

      const service = domainServices[serviceName];
      if (!service) {
        return [];
      }

      // Create hover information with action details
      const markdown = await this.createActionHoverMarkdown(domain, serviceName, service);
      return [markdown];
    } catch (error) {
      console.log("Error getting action hover info:", error);
      return [];
    }
  }

  private extractActionIdFromLocation(location: JSONPath): string | null {
    if (location.length === 0) {
      return null;
    }

    // Get the current value from the JSON path
    // The last element in the path should be the action ID value
    const currentValue = location[location.length - 1];
    
    if (typeof currentValue === "string" && this.isValidActionId(currentValue)) {
      return currentValue;
    }

    return null;
  }

  private isValidActionId(value: string): boolean {
    // Check if the value matches action ID pattern (domain.action_name)
    return /^[a-z_]+\.[a-z0-9_]+$/.test(value);
  }

  private async createActionHoverMarkdown(domain: string, serviceName: string, service: HassService): Promise<string> {
    const actionId = `${domain}.${serviceName}`;
    // Use service.name if available, otherwise use the actionId
    const title = service.name || actionId;
    let markdown = `**${title}**\n\n`;

    // Add action description if available
    if (service.description) {
      markdown += `${service.description}\n\n`;
    }

    return markdown;
  }
}
