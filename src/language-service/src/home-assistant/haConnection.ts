import {
  CompletionItem,
  CompletionItemKind,
  MarkupContent,
} from "vscode-languageserver-protocol";
import axios, { Method } from "axios";
import {
  type Connection,
  type HassEntities,
  type HassServices,
  type AuthData,
  createConnection as haCreateConnection,
  Auth as HaAuth,
  subscribeEntities,
  subscribeServices,
} from "home-assistant-js-websocket";
import { IConfigurationService } from "../configuration";
import { createSocket } from "./socket";

export interface HassArea {
  area_id: string;
  floor_id: string | null;
  name: string;
  picture: string | null;
  icon: string | null;
  labels: string[];
  aliases: string[];
}

export interface HassAreas {
  [area_id: string]: HassArea;
}

export interface HassFloor {
  floor_id: string;
  name: string;
  level: number | null;
  icon: string | null;
  aliases: string[];
}

export interface HassFloors {
  [floor_id: string]: HassFloor;
}

export interface HassLabel {
  label_id: string;
  name: string;
  icon: string | null;
  color: string | null;
  description: string | null;
}

export interface HassDevice {
  area_id: string | null;
  configuration_url: string | null;
  config_entries: string[];
  connections: [string, string][];
  disabled_by: string | null;
  entry_type: string | null;
  hw_version: string | null;
  id: string;
  identifiers: [string, string][];
  manufacturer: string | null;
  model: string | null;
  name_by_user: string | null;
  name: string | null;
  sw_version: string | null;
  via_device_id: string | null;
  labels: string[];
}

export interface HassDevices {
  [device_id: string]: HassDevice;
}

export interface HassLabels {
  [label_id: string]: HassLabel;
}

export interface HassEntityRegistryEntry {
  area_id: string | null;
  config_entry_id: string | null;
  device_id: string | null;
  disabled_by: string | null;
  entity_category: string | null;
  entity_id: string;
  has_entity_name: boolean;
  hidden_by: string | null;
  icon: string | null;
  id: string;
  name: string | null;
  options: Record<string, any>;
  original_name: string | null;
  platform: string;
  translation_key: string | null;
  unique_id: string | null;
  labels: string[];
}

export interface HassEntityRegistry {
  [entity_id: string]: HassEntityRegistryEntry;
}

// Normal require(), and cast to the static type
// const ha =

// require("home-assistant-js-websocket/dist/haws.cjs") as typeof import("home-assistant-js-websocket");

export interface IHaConnection {
  tryConnect(): Promise<void>;
  notifyConfigUpdate(conf: any): Promise<void>;
  getAreaCompletions(): Promise<CompletionItem[]>;
  getDeviceCompletions(): Promise<CompletionItem[]>;
  getDomainCompletions(): Promise<CompletionItem[]>;
  getEntityCompletions(): Promise<CompletionItem[]>;
  getFloorCompletions(): Promise<CompletionItem[]>;
  getLabelCompletions(): Promise<CompletionItem[]>;
  getServiceCompletions(): Promise<CompletionItem[]>;
  getHassEntities(): Promise<HassEntities>;
  getHassDevices(): Promise<HassDevices>;
  getHassEntityRegistry(): Promise<HassEntityRegistry>;
  getHassServices(): Promise<HassServices>;
}

export class HaConnection implements IHaConnection {
  private connection: Connection | undefined;

  private hassAreas!: Promise<HassAreas>;

  private hassDevices!: Promise<HassDevices>;

  private hassEntities!: Promise<HassEntities>;

  private hassEntityRegistry!: Promise<HassEntityRegistry>;

  private hassFloors!: Promise<HassFloors>;

  private hassLabels!: Promise<HassLabels>;

  private hassServices!: Promise<HassServices>;

  // Track the last successful configuration to avoid unnecessary reconnections
  private lastSuccessfulConfig: {
    token?: string;
    url?: string;
    ignoreCertificates?: boolean;
  } = {};

  // Event callbacks for connection status
  public onConnectionEstablished: ((info: { name?: string; version?: string }) => void) | undefined;
  public onConnectionFailed: ((error: string) => void) | undefined;

  // Track the last entity count to avoid logging duplicate messages
  private lastEntityCount: number | undefined;

  constructor(private configurationService: IConfigurationService) {}

  public tryConnect = async (): Promise<void> => {
    try {
      await this.createConnection();
    } catch (error) {
      console.error("Failed to create initial connection:", error);
      // Don't rethrow - we want to allow partial functionality even if connection fails
    }
  };

  private async createConnection(): Promise<void> {
    // Enhanced connection debugging
    console.log("Creating Home Assistant connection...");
    console.log(`Configuration status: ${this.configurationService.isConfigured ? "Configured" : "Not Configured"}`);
    console.log(`URL configured: ${this.configurationService.url ? "Yes" : "No"}`);
    console.log(`Token available: ${this.configurationService.token ? "Yes" : "No"}`);
    
    if (!this.configurationService.isConfigured) {
      console.log("Home Assistant is not configured, aborting connection attempt");
      return;
    }

    if (this.connection !== undefined) {
      console.log("Connection already exists, reusing existing connection");
      return;
    }

    // Log connection details before creating auth
    console.log(`Creating Home Assistant connection to URL: ${this.configurationService.url}`);
    
    if (!this.configurationService.url) {
      console.error("No URL configured for Home Assistant - connection will fail");
    }
    
    if (!this.configurationService.token) {
      console.error("No token configured for Home Assistant - authentication will fail");
      console.error("Debug: ConfigurationService state:", {
        isConfigured: this.configurationService.isConfigured,
        hasURL: !!this.configurationService.url,
        hasToken: !!this.configurationService.token,
        ignoreCerts: this.configurationService.ignoreCertificates
      });
    } else {
      console.log(`Using token with length: ${this.configurationService.token.length}, first chars: ${this.configurationService.token.substring(0, 5)}...`);
    }
    
    // Create proper WebSocket URL from HTTP URL
    const hassUrl = this.configurationService.url || "";
    let wsUrl = "";
    
    if (hassUrl) {
      try {
        const url = new URL(`${hassUrl}/api/websocket`);
        const wsProtocol = url.protocol === "https:" ? "wss:" : "ws:";
        wsUrl = `${wsProtocol}//${url.host}${url.pathname}`;
        console.log(`Generated WebSocket URL: ${wsUrl}`);
      } catch (error) {
        console.error(`Failed to generate WebSocket URL from ${hassUrl}:`, error);
      }
    }
    
    // Log token status before connection
    console.log(`Creating Home Assistant connection to URL: ${hassUrl}`);
    const hasToken = !!this.configurationService.token;
    console.log(`Token available for connection: ${hasToken ? "Yes" : "No"}`);
    if (hasToken) {
      console.log(`Token appears valid (length: ${this.configurationService.token!.length})`);
    } else {
      console.error("No token available! Authentication will fail.");
    }
    
    // Create auth object with both HTTP and WebSocket URLs
    const auth = new HaAuth({
      access_token: this.configurationService.token || "",
      expires: +new Date(new Date().getTime() + 1e11),
      wsUrl: wsUrl,
      clientId: "",
      expires_in: +new Date(new Date().getTime() + 1e11),
      refresh_token: "",
      // Custom property for HTTP URL that may be used in custom components
      hassUrl: hassUrl,
    } as AuthData);

    try {
      // Validate required connection params before attempting connection
      if (!auth.wsUrl) {
        console.error("Missing WebSocket URL - unable to connect to Home Assistant");
        this.handleConnectionError("ERR_MISSING_WS_URL");
        throw new Error("Missing WebSocket URL for Home Assistant connection");
      }
      
      if (!auth.accessToken) {
        console.error("Missing access token - Home Assistant authentication will fail");
        // Continue trying - the connection might work for non-secured endpoints
      }
      
      console.log("Connecting to Home Assistant...");
      console.log(`Using WebSocket URL: ${auth.wsUrl}`);
      
      this.connection = await haCreateConnection({
        auth,
        createSocket: async () =>
          createSocket(auth, this.configurationService.ignoreCertificates),
      });
      console.log("Connected to Home Assistant");
      
      // Store successful connection configuration
      this.lastSuccessfulConfig = {
        token: this.configurationService.token,
        url: this.configurationService.url,
        ignoreCertificates: this.configurationService.ignoreCertificates
      };
      console.log("Stored successful connection configuration for future reference");
      
      // Notify about successful connection
      if (this.onConnectionEstablished) {
        try {
          // Get instance name if possible
          let instanceName;
          let version;
          try {
            const configResponse = await this.callApi("get", "config");
            if (configResponse && typeof configResponse === "object") {
              instanceName = configResponse.location_name;
              version = configResponse.version;
            }
          } catch (error) {
            console.log("Could not fetch Home Assistant instance name:", error);
          }
          
          // Trigger connection established callback
          this.onConnectionEstablished({
            name: instanceName,
            version: version
          });
        } catch (cbError) {
          console.error("Error in connection established callback:", cbError);
        }
      }
    } catch (error) {
      console.error("Failed to connect to Home Assistant:", error);
      
      // Notify about connection failure
      if (this.onConnectionFailed) {
        let errorMessage = "Unknown error";
        if (typeof error === "string") {
          errorMessage = error;
        } else if (error && typeof error === "object" && "message" in error) {
          errorMessage = error.message as string;
        }
        try {
          this.onConnectionFailed(errorMessage);
        } catch (cbError) {
          console.error("Error in connection failed callback:", cbError);
        }
      }
      
      this.handleConnectionError(error);
      throw error;
    }

    this.connection.addEventListener("ready", () => {
      console.log("(re-)connected to Home Assistant");
      if (this.onConnectionEstablished) {
        this.onConnectionEstablished({ name: "Home Assistant", version: "1.0" });
      }
    });

    this.connection.addEventListener("disconnected", () => {
      console.warn("Lost connection with Home Assistant");
    });

    this.connection.addEventListener("reconnect-error", (data) => {
      console.error("Reconnect error with Home Assistant", data);
      if (this.onConnectionFailed) {
        this.onConnectionFailed("Reconnect error");
      }
    });
  }

  private handleConnectionError = (error: any) => {
    this.connection = undefined;
    
    // Ensure we have some token to use for debugging
    let tokenIndication = "(no token)";
    if (this.configurationService.token) {
      tokenIndication = `${this.configurationService.token}`.substring(0, 5) + "...";
    }
    
    // Get a more descriptive error message
    let errorText = error;
    let detailedError = "";
    
    switch (error) {
      case 1:
        errorText = "ERR_CANNOT_CONNECT";
        detailedError = "Cannot connect to the server. Check your network connection and server URL.";
        break;
      case 2:
        errorText = "ERR_INVALID_AUTH";
        detailedError = "Authentication failed. Your token may be invalid or expired.";
        break;
      case 3:
        errorText = "ERR_CONNECTION_LOST";
        detailedError = "Connection was established but then lost. The server might be restarting.";
        break;
      case 4:
        errorText = "ERR_HASS_HOST_REQUIRED";
        detailedError = "No Home Assistant host URL configured. Please set a valid host URL.";
        break;
      case "ERR_MISSING_WS_URL":
        errorText = "ERR_MISSING_WS_URL";
        detailedError = "Failed to generate WebSocket URL. Check your Host URL configuration.";
        break;
      default:
        // If it's an object with a message property, use that
        if (error && typeof error === "object" && "message" in error) {
          detailedError = error.message;
        } else if (error && typeof error === "object" && "code" in error) {
          // Node.js networking errors
          errorText = `Network Error: ${error.code}`;
          if (error.code === "ENOTFOUND") {
            detailedError = "Host not found. Check your server URL and network connection.";
          } else if (error.code === "ECONNREFUSED") {
            detailedError = "Connection refused. Verify the server is running and accessible.";
          } else {
            detailedError = `Error connecting to server: ${error.code}`;
          }
        }
    }
    
    // Log detailed diagnostics
    console.error(`Error connecting to Home Assistant Server at ${this.configurationService.url || "(no URL)"}`);
    console.error(`Token: ${tokenIndication}`);
    console.error(`Error code: ${errorText}`);
    console.error(`Details: ${detailedError || "No additional details"}`);
    
    // Also log the full message for backwards compatibility
    const message = `Error connecting to your Home Assistant Server at ${this.configurationService.url || "(no URL)"} and token '${tokenIndication}', check your network or update your VS Code Settings, make sure to (also) check your workspace settings! Error: ${errorText} - ${detailedError}`;
    console.error(message);
  };

  public notifyConfigUpdate = async (): Promise<void> => {
    console.log("Configuration update detected, checking if reconnection is needed...");
    
    // Check if the token or URL has changed since last successful connection
    const tokenChanged = this.lastSuccessfulConfig.token !== this.configurationService.token;
    const urlChanged = this.lastSuccessfulConfig.url !== this.configurationService.url;
    const certSettingChanged = this.lastSuccessfulConfig.ignoreCertificates !== this.configurationService.ignoreCertificates;
    
    if (!tokenChanged && !urlChanged && !certSettingChanged) {
      console.log("No relevant configuration changes detected, skipping reconnection");
      return;
    }
    
    console.log("Configuration changes detected, reconnecting to Home Assistant...");
    if (tokenChanged) {
      console.log("Token has changed, reconnection required");
    }
    if (urlChanged) {
      console.log("Server URL has changed, reconnection required");
    }
    if (certSettingChanged) {
      console.log("Certificate settings changed, reconnection required");
    }
    
    this.disconnect();
    
    // Reset connection state to force full reconnection
    this.connection = undefined;
    this.hassAreas = undefined as any;
    this.hassDevices = undefined as any;
    this.hassEntities = undefined as any;
    this.hassEntityRegistry = undefined as any;
    this.hassFloors = undefined as any;
    this.hassLabels = undefined as any;
    this.hassServices = undefined as any;
    
    try {
      await this.tryConnect();
      console.log("Successfully reconnected to Home Assistant after configuration update");
      
      // Update last successful configuration
      this.lastSuccessfulConfig = {
        token: this.configurationService.token,
        url: this.configurationService.url,
        ignoreCertificates: this.configurationService.ignoreCertificates
      };
      
      // Notify about successful reconnection
      if (this.onConnectionEstablished) {
        try {
          // Get instance name if possible
          let instanceName;
          let version;
          try {
            const configResponse = await this.callApi("get", "config");
            if (configResponse && typeof configResponse === "object") {
              instanceName = configResponse.location_name;
              version = configResponse.version;
            }
          } catch (error) {
            console.log("Could not fetch Home Assistant instance name after reconnection:", error);
          }
          
          this.onConnectionEstablished({
            name: instanceName,
            version: version
          });
        } catch (cbError) {
          console.error("Error in connection established callback after config update:", cbError);
        }
      }
    } catch (error) {
      console.error("Failed to reconnect after configuration update:", error);
      
      // Notify about connection failure
      if (this.onConnectionFailed) {
        let errorMessage = "Unknown error";
        if (typeof error === "string") {
          errorMessage = error;
        } else if (error && typeof error === "object" && "message" in error) {
          errorMessage = error.message as string;
        }
        try {
          this.onConnectionFailed(errorMessage);
        } catch (cbError) {
          console.error("Error in connection failed callback after config update:", cbError);
        }
      }
      // Error is already displayed in logs via error handler
    }
  };

  private getHassAreas = async (): Promise<HassAreas> => {
    if (this.hassAreas !== undefined) {
      return this.hassAreas;
    }

    await this.createConnection();

    this.hassAreas = new Promise<HassAreas>(
      // eslint-disable-next-line no-async-promise-executor
      async (resolve, reject) => {
        if (!this.connection) {
          return reject();
        }
        this.connection
          ?.sendMessagePromise<HassArea[]>({
            type: "config/area_registry/list",
          })
          .then((areas) => {
            console.log(`Got ${areas.length} areas from Home Assistant`);
            const repacked_areas: HassAreas = {};
            areas.forEach((area) => {
              repacked_areas[area.area_id] = area;
            });
            return resolve(repacked_areas);
          });
      },
    );
    return this.hassAreas;
  };

  public async getAreaCompletions(): Promise<CompletionItem[]> {
    const areas = await this.getHassAreas();

    if (!areas) {
      return [];
    }

    const completions: CompletionItem[] = [];

    for (const [, value] of Object.entries(areas)) {
      const completionItem = CompletionItem.create(`${value.area_id}`);
      completionItem.detail = value.name;
      completionItem.kind = CompletionItemKind.Variable;
      completionItem.filterText = `${value.area_id} ${value.name}`;
      completionItem.insertText = value.area_id;
      completionItem.data = {};
      completionItem.data.isArea = true;

      completionItem.documentation = {
        kind: "markdown",
        value: `**${value.area_id}** \r\n \r\n`,
      } as MarkupContent;

      let floor = value.floor_id;
      if (!floor) {
        floor = "No floor assigned";
      }
      completionItem.documentation.value += `Floor: ${floor} \r\n \r\n`;

      completions.push(completionItem);
    }
    return completions;
  }

  private getHassFloors = async (): Promise<HassFloors> => {
    if (this.hassFloors !== undefined) {
      return this.hassFloors;
    }

    await this.createConnection();

    this.hassFloors = new Promise<HassFloors>(
      // eslint-disable-next-line no-async-promise-executor
      async (resolve, reject) => {
        if (!this.connection) {
          return reject();
        }
        this.connection
          ?.sendMessagePromise<HassFloor[]>({
            type: "config/floor_registry/list",
          })
          .then((floors) => {
            console.log(`Got ${floors.length} floors from Home Assistant`);
            const repacked_floors: HassFloors = {};
            floors.forEach((floor) => {
              repacked_floors[floor.floor_id] = floor;
            });
            return resolve(repacked_floors);
          });
      },
    );
    return this.hassFloors;
  };

  public async getFloorCompletions(): Promise<CompletionItem[]> {
    const floors = await this.getHassFloors();

    if (!floors) {
      return [];
    }

    const completions: CompletionItem[] = [];

    for (const [, value] of Object.entries(floors)) {
      const completionItem = CompletionItem.create(`${value.floor_id}`);
      completionItem.detail = value.name;
      completionItem.kind = CompletionItemKind.Variable;
      completionItem.filterText = `${value.floor_id} ${value.name}`;
      completionItem.insertText = value.floor_id;
      completionItem.data = {};
      completionItem.data.isFloor = true;

      completionItem.documentation = {
        kind: "markdown",
        value: `**${value.floor_id}** \r\n`,
      } as MarkupContent;
      completions.push(completionItem);
    }
    return completions;
  }

  private getHassDevicesInternal = async (): Promise<HassDevices> => {
    if (this.hassDevices !== undefined) {
      return this.hassDevices;
    }

    await this.createConnection();

    this.hassDevices = new Promise<HassDevices>(
      // eslint-disable-next-line no-async-promise-executor
      async (resolve, reject) => {
        if (!this.connection) {
          return reject();
        }
        this.connection
          ?.sendMessagePromise<HassDevice[]>({
            type: "config/device_registry/list",
          })
          .then((devices) => {
            console.log(`Got ${devices.length} devices from Home Assistant`);
            const repacked_devices: HassDevices = {};
            devices.forEach((device) => {
              repacked_devices[device.id] = device;
            });
            return resolve(repacked_devices);
          });
      },
    );
    return this.hassDevices;
  };

  public async getHassDevices(): Promise<HassDevices> {
    return this.getHassDevicesInternal();
  }

  public async getDeviceCompletions(): Promise<CompletionItem[]> {
    const devices = await this.getHassDevices();

    if (!devices) {
      return [];
    }

    const completions: CompletionItem[] = [];

    for (const [, value] of Object.entries(devices)) {
      const completionItem = CompletionItem.create(`${value.id}`);
      completionItem.detail = value.name || value.id;
      completionItem.kind = CompletionItemKind.Variable;
      completionItem.filterText = `${value.id} ${value.name || ""}`;
      completionItem.insertText = value.id;
      completionItem.data = {};
      completionItem.data.isDevice = true;

      completionItem.documentation = {
        kind: "markdown",
        value: `**${value.id}** \r\n \r\n`,
      } as MarkupContent;

      if (value.name) {
        completionItem.documentation.value += `Name: ${value.name} \r\n \r\n`;
      }

      if (value.manufacturer) {
        completionItem.documentation.value += `Manufacturer: ${value.manufacturer} \r\n \r\n`;
      }

      if (value.model) {
        completionItem.documentation.value += `Model: ${value.model} \r\n \r\n`;
      }

      let area = value.area_id;
      if (!area) {
        area = "No area assigned";
      }
      completionItem.documentation.value += `Area: ${area} \r\n \r\n`;

      completions.push(completionItem);
    }
    return completions;
  }

  public async getHassEntities(): Promise<HassEntities> {
    if (this.hassEntities !== undefined) {
      return this.hassEntities;
    }

    await this.createConnection();

    this.hassEntities = new Promise<HassEntities>(
      // eslint-disable-next-line no-async-promise-executor
      async (resolve, reject) => {
        if (!this.connection) {
          return reject();
        }
        
        // Subscribe to entities and resolve with the initial state
        subscribeEntities(this.connection, (entities) => {
          const entityCount = Object.keys(entities).length;
          
          // Only log if the entity count has changed
          if (this.lastEntityCount !== entityCount) {
            if (this.lastEntityCount === undefined) {
              // Initial load
              console.log(`Got ${entityCount} entities from Home Assistant`);
            } else {
              const diff = entityCount - this.lastEntityCount;
              if (diff > 0) {
                console.log(`Got ${diff} new entities from Home Assistant (total: ${entityCount})`);
              } else {
                console.log(`${Math.abs(diff)} entities have been removed from Home Assistant (total: ${entityCount})`);
              }
            }
            this.lastEntityCount = entityCount;
          }
          
          resolve(entities);
        });
      },
    );
    return this.hassEntities;
  }

  private getHassEntityRegistryInternal = async (): Promise<HassEntityRegistry> => {
    if (this.hassEntityRegistry !== undefined) {
      return this.hassEntityRegistry;
    }

    await this.createConnection();

    this.hassEntityRegistry = new Promise<HassEntityRegistry>(
      // eslint-disable-next-line no-async-promise-executor
      async (resolve, reject) => {
        if (!this.connection) {
          return reject();
        }
        this.connection
          ?.sendMessagePromise<HassEntityRegistryEntry[]>({
            type: "config/entity_registry/list",
          })
          .then((entityEntries) => {
            console.log(`Got ${entityEntries.length} entity registry entries from Home Assistant`);
            const repacked_entities: HassEntityRegistry = {};
            entityEntries.forEach((entry) => {
              repacked_entities[entry.entity_id] = entry;
            });
            return resolve(repacked_entities);
          });
      },
    );
    return this.hassEntityRegistry;
  };

  public async getHassEntityRegistry(): Promise<HassEntityRegistry> {
    return this.getHassEntityRegistryInternal();
  }

  private getHassLabels = async (): Promise<HassLabels> => {
    if (this.hassLabels !== undefined) {
      return this.hassLabels;
    }

    await this.createConnection();

    this.hassLabels = new Promise<HassLabels>(
      // eslint-disable-next-line no-async-promise-executor
      async (resolve, reject) => {
        if (!this.connection) {
          return reject();
        }
        this.connection
          ?.sendMessagePromise<HassLabel[]>({
            type: "config/label_registry/list",
          })
          .then((labels) => {
            console.log(`Got ${labels.length} labels from Home Assistant`);
            const repacked_labels: HassLabels = {};
            labels.forEach((label) => {
              repacked_labels[label.label_id] = label;
            });
            return resolve(repacked_labels);
          });
      },
    );
    return this.hassLabels;
  };

  public async getLabelCompletions(): Promise<CompletionItem[]> {
    const labels = await this.getHassLabels();

    if (!labels) {
      return [];
    }

    const completions: CompletionItem[] = [];

    for (const [, value] of Object.entries(labels)) {
      const completionItem = CompletionItem.create(`${value.label_id}`);
      completionItem.detail = value.name;
      completionItem.kind = CompletionItemKind.Variable;
      completionItem.filterText = `${value.label_id} ${value.name}`;
      completionItem.insertText = value.label_id;
      completionItem.data = {};
      completionItem.data.isLabel = true;

      completionItem.documentation = {
        kind: "markdown",
        value: `**${value.label_id}** \r\n`,
      } as MarkupContent;
      completions.push(completionItem);
    }
    return completions;
  }

  private async getAreaName(areaId: string | undefined): Promise<string | null> {
    if (!areaId) {
      return null;
    }

    try {
      const areaCompletions = await this.getAreaCompletions();
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
      const areaCompletions = await this.getAreaCompletions();
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
      const floorCompletions = await this.getFloorCompletions();
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
      const entityRegistry = await this.getHassEntityRegistry();
      const entityEntry = entityRegistry[entityId];
      
      if (!entityEntry || !entityEntry.device_id) {
        return null;
      }

      // Get the device information
      const devices = await this.getHassDevices();
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

  public async getEntityCompletions(): Promise<CompletionItem[]> {
    const entities = await this.getHassEntities();

    if (!entities) {
      return [];
    }

    const completions: CompletionItem[] = [];

    for (const [, value] of Object.entries(entities)) {
      const completionItem = CompletionItem.create(`${value.entity_id}`);
      completionItem.detail = value.attributes.friendly_name;
      completionItem.kind = CompletionItemKind.Variable;
      completionItem.filterText = `${value.entity_id} ${value.attributes.friendly_name}`;
      completionItem.insertText = value.entity_id;
      completionItem.data = {};
      completionItem.data.isEntity = true;

      // Create documentation using the same format as hover cards
      completionItem.documentation = {
        kind: "markdown",
        value: await this.createEntityCompletionMarkdown(value),
      } as MarkupContent;

      completions.push(completionItem);
    }
    return completions;
  }

  private async createEntityCompletionMarkdown(entity: any): Promise<string> {
    // Show friendly name on top, fallback to entity_id if missing
    let markdown = "";

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

  public async getDomainCompletions(): Promise<CompletionItem[]> {
    const entities = await this.getHassEntities();
    let domains = [];

    if (!entities) {
      return [];
    }

    for (const [, value] of Object.entries(entities)) {
      domains.push(value.entity_id.split(".")[0]);
    }
    domains = [...new Set(domains)];

    const completions: CompletionItem[] = [];
    for (const domain of domains) {
      const completionItem = CompletionItem.create(domain);
      completionItem.kind = CompletionItemKind.Variable;
      completionItem.data = {};
      completionItem.data.isDomain = true;
      completions.push(completionItem);
    }
    return completions;
  }

  public async getHassServices(): Promise<HassServices> {
    if (this.hassServices !== undefined) {
      return this.hassServices;
    }
    await this.createConnection();

    this.hassServices = new Promise<HassServices>(
      // eslint-disable-next-line no-async-promise-executor
      async (resolve, reject) => {
        if (!this.connection) {
          return reject();
        }
        subscribeServices(this.connection, (services: HassServices) => {
          console.log(
            `Got ${Object.keys(services).length} services from Home Assistant`,
          );
          return resolve(services);
        });
      },
    );
    return this.hassServices;
  };

  public async getServiceCompletions(): Promise<CompletionItem[]> {
    const services = await this.getHassServices();

    if (!services) {
      return [];
    }

    const completions: CompletionItem[] = [];

    for (const [domainKey, domainValue] of Object.entries(services)) {
      for (const [serviceKey, serviceValue] of Object.entries(domainValue)) {
        const completionItem = CompletionItem.create(
          `${domainKey}.${serviceKey}`,
        );
        completionItem.kind = CompletionItemKind.EnumMember;
        completionItem.filterText = `${domainKey}.${serviceKey}`;
        completionItem.insertText = completionItem.filterText;
        completionItem.data = {};
        completionItem.data.isService = true;

        const fields = Object.entries(serviceValue.fields);

        if (fields.length > 0) {
          completionItem.documentation = {
            kind: "markdown",
            value: `**${domainKey}.${serviceKey}:** \r\n \r\n`,
          } as MarkupContent;

          completionItem.documentation.value +=
            "| Field | Description | Example | \r\n";
          completionItem.documentation.value +=
            "| :---- | :---- | :---- | \r\n";

          for (const [fieldKey, fieldValue] of fields) {
            completionItem.documentation.value += `| ${fieldKey} | ${fieldValue.description} |  ${fieldValue.example} | \r\n`;
          }
        }
        completions.push(completionItem);
      }
    }

    return completions;
  }

  public disconnect(): void {
    if (!this.connection) {
      return;
    }
    console.log("Disconnecting from Home Assistant");
    this.connection.close();
    this.connection = undefined;
    
    // Notify about disconnection if handler exists
    if (this.onConnectionFailed) {
      try {
        this.onConnectionFailed("Disconnected");
      } catch (error) {
        console.error("Error in connection failed callback during disconnect:", error);
      }
    }
  }

  public callApi = async (
    method: Method,
    api: string,
    requestBody?: any,
  ): Promise<any> => {
    try {
      const resp = await axios.request({
        method,
        url: `${this.configurationService.url}/api/${api}`,
        headers: {
          Authorization: `Bearer ${this.configurationService.token}`,
        },
        data: requestBody,
      });

      return resp.data;
    } catch (error) {
      console.error(`Error calling API ${api}:`, error);
      
      // Extract error information for better error messages
      if (error.response) {
        // The request was made and the server responded with a status code outside of 2xx range
        console.error(`Response status: ${error.response.status}`);
        console.error(`Response data:`, error.response.data);
        
        // Return the error data to allow the caller to handle it
        return error.response.data;
      } else if (error.request) {
        // The request was made but no response was received
        return { error: "No response received from Home Assistant" };
      } else {
        // Something happened in setting up the request
        if (typeof error === "object" && error !== null) {
          if (error.message) {
            return { error: error.message };
          }
          try {
            return { error: JSON.stringify(error) };
          } catch {
            return { error: "Unknown error occurred" };
          }
        }
        return { error: String(error) };
      }
    }
    return Promise.resolve("");
  };

  public callService = async (
    domain: string,
    service: string,

    serviceData: any,
  ): Promise<any> => {
    try {
      const resp = await axios.request({
        method: "POST",
        url: `${this.configurationService.url}/api/services/${domain}/${service}`,
        headers: {
          Authorization: `Bearer ${this.configurationService.token}`,
        },
        data: serviceData,
      });

      console.log(
        `Service Call ${domain}.${service} made succesfully, response:`,
      );
      console.log(JSON.stringify(resp.data, null, 1));
    } catch (error) {
      console.error(error);
    }
    return Promise.resolve();
  };
}
