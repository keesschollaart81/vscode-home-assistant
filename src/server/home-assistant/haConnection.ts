import * as ha from "home-assistant-js-websocket";
import { CompletionItem, CompletionItemKind, MarkupContent } from 'vscode-languageserver';
import { IConfigurationService } from "../configuration";
import { createSocket } from "./socket";

export interface IHaConnection {
    tryConnect(): Promise<void>;
    notifyConfigUpdate(conf: any);
    getEntityCompletions(): Promise<CompletionItem[]>;
    getServiceCompletions(): Promise<CompletionItem[]>;
}

export class HaConnection implements IHaConnection {

    private connection: ha.Connection | undefined;
    private hassEntities!: Promise<ha.HassEntities>;
    private hassServices!: Promise<ha.HassServices>;

    constructor(private configurationService: IConfigurationService) { }

    public tryConnect = async () => {
        await this.createConnection();
    }

    private async createConnection(): Promise<void> {

        if (!this.configurationService.isConfigured) {
            return;
        }

        if (this.connection !== undefined) {
            return;
        }

        let auth = new ha.Auth(<ha.AuthData>{
            access_token: `${this.configurationService.token}`,
            expires: +new Date(new Date().getTime() + 1e11),
            hassUrl: `${this.configurationService.url}`,
            clientId: "",
            expires_in: +new Date(new Date().getTime() + 1e11),
            refresh_token: ""
        });

        try {
            console.log("Connecting to Home Assistant...");
            this.connection = await ha.createConnection({
                auth: auth,
                createSocket: async () => createSocket(auth, this.configurationService.ignoreCertificates)
            });
            console.log("Connected to Home Assistant");
        }
        catch (error) {
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
        var tokenIndication = `${this.configurationService.token}`.substring(0, 5);
        var errorText = error;
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
        let message = `Error connecting to your Home Assistant Server at ${this.configurationService.url} and token '${tokenIndication}...', check your network or update your VS Code Settings, make sure to (also) check your workspace settings! Error: ${errorText}`;
        console.error(message);
    }

    public notifyConfigUpdate = async (): Promise<void> => {
        this.disconnect();
        try {
            await this.tryConnect();
        }
        catch (err) {
            // so be it, error is now displayed in logs
        }
    }

    private getHassEntities = async (): Promise<ha.HassEntities> => {
        await this.createConnection();

        if (!this.hassEntities) {
            this.hassEntities = new Promise<ha.HassEntities>(async (resolve, reject) => {
                if (!this.connection) {
                    return reject();
                }
                ha.subscribeEntities(this.connection, entities => {
                    console.log(`Got ${Object.keys(entities).length} entities from Home Assistant`);
                    return resolve(entities);
                });
            });
        }
        return await this.hassEntities;
    }

    public async getEntityCompletions(): Promise<CompletionItem[]> {

        let entities = await this.getHassEntities();

        if (!entities) {
            return [];
        }

        let completions: CompletionItem[] = [];

        for (const [, value] of Object.entries(entities)) {
            let completionItem = CompletionItem.create(`${value.entity_id}`);
            completionItem.kind = CompletionItemKind.EnumMember;
            completionItem.filterText = `${value.entity_id}`;
            completionItem.insertText = completionItem.filterText;
            completionItem.data = {};
            completionItem.data.isEntity = true;

            completionItem.documentation = <MarkupContent>{
                kind: "markdown",
                value: `**${value.entity_id}** \r\n \r\n`
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

    private getHassServices = async (): Promise<ha.HassServices> => {
        await this.createConnection();

        if (!this.hassServices) {
            this.hassServices = new Promise<ha.HassServices>(async (resolve, reject) => {
                if (!this.connection) {
                    return reject();
                }
                ha.subscribeServices(this.connection, services => {
                    console.log(`Got ${Object.keys(services).length} services from Home Assistant`);
                    return resolve(services);
                });
            });
        }
        return await this.hassServices;
    }

    public async getServiceCompletions(): Promise<CompletionItem[]> {

        let services = await this.getHassServices();

        if (!services) {
            return [];
        }

        let completions: CompletionItem[] = [];

        for (const [domainKey, domainValue] of Object.entries(services)) {
            for (const [serviceKey, serviceValue] of Object.entries(domainValue)) {
                let completionItem = CompletionItem.create(`${domainKey}.${serviceKey}`);
                completionItem.kind = CompletionItemKind.EnumMember;
                completionItem.filterText = `${domainKey}.${serviceKey}`;
                completionItem.insertText = completionItem.filterText;
                completionItem.data = {};
                completionItem.data.isService = true;

                var fields = Object.entries(serviceValue.fields);

                if (fields.length > 0) {
                    completionItem.documentation = <MarkupContent>{
                        kind: "markdown",
                        value: `**${domainKey}.${serviceKey}:** \r\n \r\n`
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

    public disconnect() {
        if (!this.connection) {
            return;
        }
        console.log(`Disconnecting from Home Assistant`);
        this.connection.close();
        this.connection = undefined;
    }
}