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
} from "home-assistant-js-websocket";
import { IConfigurationService } from "../configuration";
import { createSocket } from "./socket";

export type HassArea = {
  area_id: string;
  floor_id: string | null;
  name: string;
  picture: string | null;
  icon: string | null;
  labels: string[];
  aliases: string[];
};

export type HassAreas = {
  [area_id: string]: HassArea;
};

export type HassFloor = {
  floor_id: string;
  name: string;
  level: number | null;
  icon: string | null;
  aliases: string[];
};

export type HassFloors = {
  [floor_id: string]: HassFloor;
};

export type HassLabel = {
  label_id: string;
  name: string;
  icon: string | null;
  color: string | null;
  description: string | null;
};

export type HassLabels = {
  [label_id: string]: HassLabel;
};

// Normal require(), and cast to the static type
const ha =
  // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
  require("home-assistant-js-websocket/dist/haws.cjs") as typeof import("home-assistant-js-websocket");

export interface IHaConnection {
  tryConnect(): Promise<void>;
  notifyConfigUpdate(conf: any): Promise<void>;
  getAreaCompletions(): Promise<CompletionItem[]>;
  getDomainCompletions(): Promise<CompletionItem[]>;
  getEntityCompletions(): Promise<CompletionItem[]>;
  getFloorCompletions(): Promise<CompletionItem[]>;
  getLabelCompletions(): Promise<CompletionItem[]>;
  getServiceCompletions(): Promise<CompletionItem[]>;
}

export class HaConnection implements IHaConnection {
  private connection: Connection | undefined;

  private hassAreas!: Promise<HassAreas>;

  private hassEntities!: Promise<HassEntities>;

  private hassFloors!: Promise<HassFloors>;

  private hassLabels!: Promise<HassLabels>;

  private hassServices!: Promise<HassServices>;

  constructor(private configurationService: IConfigurationService) {}

  public tryConnect = async (): Promise<void> => {
    await this.createConnection();
  };

  private async createConnection(): Promise<void> {
    if (!this.configurationService.isConfigured) {
      return;
    }

    if (this.connection !== undefined) {
      return;
    }

    const auth = new ha.Auth(<AuthData>{
      access_token: `${this.configurationService.token}`,
      expires: +new Date(new Date().getTime() + 1e11),
      hassUrl: `${this.configurationService.url}`,
      clientId: "",
      expires_in: +new Date(new Date().getTime() + 1e11),
      refresh_token: "",
    });

    try {
      console.log("Connecting to Home Assistant...");
      this.connection = await ha.createConnection({
        auth,
        createSocket: async () =>
          createSocket(auth, this.configurationService.ignoreCertificates),
      });
      console.log("Connected to Home Assistant");
    } catch (error) {
      this.handleConnectionError(error);
      throw error;
    }

    this.connection.addEventListener("ready", () => {
      console.log("(re-)connected to Home Assistant");
    });

    this.connection.addEventListener("disconnected", () => {
      console.warn("Lost connection with Home Assistant");
    });

    this.connection.addEventListener("reconnect-error", (data) => {
      console.error("Reconnect error with Home Assistant", data);
    });
  }

  private handleConnectionError = (error: any) => {
    this.connection = undefined;
    const tokenIndication = `${this.configurationService.token}`.substring(
      0,
      5,
    );
    let errorText = error;
    switch (error) {
      case 1:
        errorText = "ERR_CANNOT_CONNECT";
        break;
      case 2:
        errorText = "ERR_INVALID_AUTH";
        break;
      case 3:
        errorText = "ERR_CONNECTION_LOST";
        break;
      case 4:
        errorText = "ERR_HASS_HOST_REQUIRED";
        break;
    }
    const message = `Error connecting to your Home Assistant Server at ${this.configurationService.url} and token '${tokenIndication}...', check your network or update your VS Code Settings, make sure to (also) check your workspace settings! Error: ${errorText}`;
    console.error(message);
  };

  public notifyConfigUpdate = async (): Promise<void> => {
    this.disconnect();
    try {
      await this.tryConnect();
    } catch (err) {
      // so be it, error is now displayed in logs
    }
  };

  private getHassAreas = async (): Promise<HassAreas> => {
    if (this.hassAreas !== undefined) {
      return this.hassAreas;
    }

    await this.createConnection();

    this.hassAreas = new Promise<HassAreas>(
      // eslint-disable-next-line @typescript-eslint/require-await, no-async-promise-executor, consistent-return
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

      completionItem.documentation = <MarkupContent>{
        kind: "markdown",
        value: `**${value.area_id}** \r\n \r\n`,
      };

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
      // eslint-disable-next-line @typescript-eslint/require-await, no-async-promise-executor, consistent-return
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

      completionItem.documentation = <MarkupContent>{
        kind: "markdown",
        value: `**${value.floor_id}** \r\n`,
      };
      completions.push(completionItem);
    }
    return completions;
  }

  private getHassEntities = async (): Promise<HassEntities> => {
    if (this.hassEntities !== undefined) {
      return this.hassEntities;
    }

    await this.createConnection();
    this.hassEntities = new Promise<HassEntities>(
      // eslint-disable-next-line @typescript-eslint/require-await, no-async-promise-executor, consistent-return
      async (resolve, reject) => {
        if (!this.connection) {
          return reject();
        }
        ha.subscribeEntities(this.connection, (entities) => {
          console.log(
            `Got ${Object.keys(entities).length} entities from Home Assistant`,
          );
          return resolve(entities);
        });
      },
    );
    return this.hassEntities;
  };

  private getHassLabels = async (): Promise<HassLabels> => {
    if (this.hassLabels !== undefined) {
      return this.hassLabels;
    }

    await this.createConnection();

    this.hassLabels = new Promise<HassLabels>(
      // eslint-disable-next-line @typescript-eslint/require-await, no-async-promise-executor, consistent-return
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

      completionItem.documentation = <MarkupContent>{
        kind: "markdown",
        value: `**${value.label_id}** \r\n`,
      };
      completions.push(completionItem);
    }
    return completions;
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

      completionItem.documentation = <MarkupContent>{
        kind: "markdown",
        value: `**${value.entity_id}** \r\n \r\n`,
      };

      if (value.state) {
        completionItem.documentation.value += `State: ${value.state} \r\n \r\n`;
      }
      completionItem.documentation.value += `| Attribute | Value | \r\n`;
      completionItem.documentation.value += `| :---- | :---- | \r\n`;

      for (const [attrKey, attrValue] of Object.entries(value.attributes)) {
        completionItem.documentation.value += `| ${attrKey} | ${attrValue} | \r\n`;
      }
      completions.push(completionItem);
    }
    return completions;
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

  private getHassServices = async (): Promise<HassServices> => {
    await this.createConnection();

    if (!this.hassServices) {
      this.hassServices = new Promise<HassServices>(
        // eslint-disable-next-line @typescript-eslint/require-await, no-async-promise-executor, consistent-return
        async (resolve, reject) => {
          if (!this.connection) {
            return reject();
          }
          ha.subscribeServices(this.connection, (services) => {
            console.log(
              `Got ${
                Object.keys(services).length
              } services from Home Assistant`,
            );
            return resolve(services);
          });
        },
      );
    }
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
          completionItem.documentation = <MarkupContent>{
            kind: "markdown",
            value: `**${domainKey}.${serviceKey}:** \r\n \r\n`,
          };

          completionItem.documentation.value += `| Field | Description | Example | \r\n`;
          completionItem.documentation.value += `| :---- | :---- | :---- | \r\n`;

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
    console.log(`Disconnecting from Home Assistant`);
    this.connection.close();
    this.connection = undefined;
  }

  public callApi = async (
    method: Method,
    api: string,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return resp.data;
    } catch (error) {
      console.error(error);
    }
    return Promise.resolve("");
  };

  public callService = async (
    domain: string,
    service: string,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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
