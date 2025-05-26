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
    location: JSONPath,
  ): Thenable<MarkedString[]> {
    return this.getServiceHoverInfo(location);
  }

  private async getServiceHoverInfo(
    location: JSONPath,
  ): Promise<MarkedString[]> {
    try {
      // Get the current word/value at the location
      const serviceId = this.extractServiceIdFromLocation(location);
      if (!serviceId) {
        return [];
      }

      // Get all services from Home Assistant
      const services = await this.haConnection.getHassServices();
      if (!services) {
        return [];
      }

      // Parse domain and service name from the service ID (e.g., "light.turn_on")
      const [domain, serviceName] = serviceId.split(".");
      if (!domain || !serviceName) {
        return [];
      }

      // Find the specific service
      const domainServices = services[domain];
      if (!domainServices) {
        return [];
      }

      const service = domainServices[serviceName];
      if (!service) {
        return [];
      }

      // Create hover information with service details
      const markdown = await this.createServiceHoverMarkdown(domain, serviceName, service);
      return [markdown];
    } catch (error) {
      console.log("Error getting service hover info:", error);
      return [];
    }
  }

  private extractServiceIdFromLocation(location: JSONPath): string | null {
    if (location.length === 0) {
      return null;
    }

    // Get the current value from the JSON path
    // The last element in the path should be the service ID value
    const currentValue = location[location.length - 1];
    
    if (typeof currentValue === "string" && this.isValidServiceId(currentValue)) {
      return currentValue;
    }

    return null;
  }

  private isValidServiceId(value: string): boolean {
    // Check if the value matches service ID pattern (domain.service_name)
    return /^[a-z_]+\.[a-z0-9_]+$/.test(value);
  }

  private async createServiceHoverMarkdown(domain: string, serviceName: string, service: HassService): Promise<string> {
    const serviceId = `${domain}.${serviceName}`;
    // Use service.name if available, otherwise use the serviceId
    const title = service.name || serviceId;
    let markdown = `**${title}**\n\n`;

    // Add service description if available
    if (service.description) {
      markdown += `${service.description}\n\n`;
    }

    return markdown;
  }
}
