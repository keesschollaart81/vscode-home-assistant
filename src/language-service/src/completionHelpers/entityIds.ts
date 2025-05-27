import { MarkedString } from "vscode-languageserver-protocol";
import {
  JSONWorkerContribution,
  JSONPath,
  CompletionsCollector,
} from "vscode-json-languageservice";
import { IHaConnection } from "../home-assistant/haConnection";

export class EntityIdCompletionContribution implements JSONWorkerContribution {
  public static propertyMatches: string[] = [
    "badges",
    "camera_image",
    "devices",
    "entities",
    "entity_config",
    "entity_id",
    "entity",
    "exclude_entities",
    "geo_location",
    "include_entities",
    "light",
    "lights",
    "scene",
    "zone",
    "zones",
    "group_members",
  ];

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
      !EntityIdCompletionContribution.propertyMatches.some(
        (x) =>
          x === currentNode ||
          (!Number.isNaN(+currentNode) && x === parentNode),
      )
    ) {
      return;
    }
    const entityIdCompletions = await this.haConnection.getEntityCompletions();
    entityIdCompletions.forEach((c) => {
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
      !EntityIdCompletionContribution.propertyMatches.some(
        (x) => x === currentKey,
      )
    ) {
      return;
    }

    const entityIdCompletions = await this.haConnection.getEntityCompletions();
    entityIdCompletions.forEach((c) => {
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
    return this.getEntityHoverInfo(location);
  }

  private async getEntityHoverInfo(
    location: JSONPath,
  ): Promise<MarkedString[]> {
    try {
      // Get the current word/value at the location
      const entityId = this.extractEntityIdFromLocation(location);
      if (!entityId) {
        return [];
      }

      // Get all entities from Home Assistant
      const entities = await this.haConnection.getHassEntities();
      if (!entities) {
        return [];
      }

      // Find the specific entity
      const entity = Object.values(entities).find(
        (e: any) => e.entity_id === entityId
      );

      if (!entity) {
        return [];
      }

      // Create hover information with current state
      const markdown = await this.createEntityHoverMarkdown(entity);
      return [markdown];
    } catch (error) {
      console.log("Error getting entity hover info:", error);
      return [];
    }
  }

  private extractEntityIdFromLocation(location: JSONPath): string | null {
    if (location.length === 0) {
      return null;
    }

    // Get the current value from the JSON path
    // The last element in the path should be the entity ID value
    const currentValue = location[location.length - 1];
    
    if (typeof currentValue === "string" && this.isValidEntityId(currentValue)) {
      return currentValue;
    }

    return null;
  }

  private isValidEntityId(value: string): boolean {
    // Check if the value matches entity ID pattern (domain.entity)
    return /^[a-z_]+\.[a-z0-9_]+$/.test(value);
  }

  private async createEntityHoverMarkdown(entity: any): Promise<string> {
    // Show friendly name on top, fallback to entity_id if missing
    const displayName = entity.attributes?.friendly_name || entity.entity_id;
    let markdown = `**${displayName}**\n\n`;

    // Get device and area information for contextual display
    const deviceInfo = await this.getDeviceForEntity(entity.entity_id);
    const areaName = deviceInfo ? await this.getAreaName(deviceInfo.area_id) : null;
    const floorName = deviceInfo ? await this.getFloorName(deviceInfo.area_id) : null;

    // Add contextual information (device, area, floor) right after entity name
    if (areaName || floorName) {
      if (areaName) {
        markdown += `📍 ${areaName}\n`;
      }
      if (floorName) {
        markdown += `🏠 ${floorName}\n`;
      }
      markdown += "\n";
    }

    // Current state
    if (entity.state !== undefined) {
      let stateDisplay = `**Current State:** \`${entity.state}\``;
      
      // Add unit of measurement if available
      if (entity.attributes?.unit_of_measurement) {
        stateDisplay += ` ${entity.attributes.unit_of_measurement}`;
      }
      markdown += stateDisplay + "\n\n";
    }

    // Last changed/updated information
    if (entity.last_changed) {
      try {
        const lastChanged = new Date(entity.last_changed);
        markdown += `**Last Changed:** ${lastChanged.toLocaleString()}\n\n`;
      } catch {
        // If date parsing fails, show raw value
        markdown += `**Last Changed:** ${entity.last_changed}\n\n`;
      }
    }

    // All attributes table (excluding useless ones)
    const attributeEntries: [string, string][] = [];

    // Add all attributes except filtered ones
    if (entity.attributes) {
      for (const [attr, value] of Object.entries(entity.attributes)) {
        // Filter out useless or redundant attributes
        if (attr === "supported_features" || attr === "friendly_name") {
          continue;
        }
        
        if (value !== undefined && value !== null) {
          const displayValue = Array.isArray(value) ? value.join(", ") : String(value);
          attributeEntries.push([attr, displayValue]);
        }
      }
    }

    if (attributeEntries.length > 0) {
      // Sort attributes alphabetically
      attributeEntries.sort((a, b) => a[0].localeCompare(b[0]));
      
      markdown += "| Attribute | Value |\n";
      markdown += "|:----------|:------|\n";
      
      for (const [attr, displayValue] of attributeEntries) {
        markdown += `| ${attr} | ${displayValue} |\n`;
      }
      markdown += "\n";
    }

    return markdown;
  }

  private async getAreaName(areaId: string | undefined): Promise<string | null> {
    if (!areaId) {
      return null;
    }

    try {
      const areaCompletions = await this.haConnection.getAreaCompletions();
      const area = areaCompletions.find(a => a.label === areaId);
      return area?.detail || areaId;
    } catch (error) {
      console.log("Error getting area name:", error);
      return areaId;
    }
  }

  private async getFloorName(areaId: string | undefined): Promise<string | null> {
    if (!areaId) {
      return null;
    }

    try {
      // First get the floor_id from the area
      const areaCompletions = await this.haConnection.getAreaCompletions();
      const area = areaCompletions.find(a => a.label === areaId);
      
      if (!area?.documentation) {
        return null;
      }

      // Extract floor info from area documentation
      const docValue = typeof area.documentation === "string" 
        ? area.documentation 
        : area.documentation.value;
        
      const floorMatch = docValue.match(/Floor:\s*([^\r\n]+)/);
      if (!floorMatch || floorMatch[1].trim() === "No floor assigned") {
        return null;
      }

      const floorId = floorMatch[1].trim();
      
      // Get human-readable floor name
      const floorCompletions = await this.haConnection.getFloorCompletions();
      const floor = floorCompletions.find(f => f.label === floorId);
      return floor?.detail || floorId;
    } catch (error) {
      console.log("Error getting floor name:", error);
      return null;
    }
  }

  private async getDeviceForEntity(entityId: string): Promise<{ area_id: string | null; id: string } | null> {
    if (!entityId) {
      return null;
    }

    try {
      // Get the entity registry entry to find device_id
      const entityRegistry = await this.haConnection.getHassEntityRegistry();
      const entityEntry = entityRegistry[entityId];
      
      if (!entityEntry || !entityEntry.device_id) {
        return null;
      }

      // Get the device information
      const devices = await this.haConnection.getHassDevices();
      const device = devices[entityEntry.device_id];
      
      if (!device) {
        return null;
      }

      return {
        area_id: device.area_id,
        id: device.id
      };
    } catch (error) {
      console.log("Error getting device for entity:", error);
      return null;
    }
  }
}
