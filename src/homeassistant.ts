import * as ha from "home-assistant-js-websocket";
import { config } from "./configuration";
import { CompletionItem } from "vscode";
import * as vscode from 'vscode';

const WebSocket = require("ws");

export class HomeAssistant {

    private connection: ha.Connection | undefined;
    private hassEntities!: Promise<ha.HassEntities>;
    private hassServices!: Promise<ha.HassServices>;

    private async ensureConnection(): Promise<void> {

        let hasConfig = await config.hasConfigOrAsk();
        if (!hasConfig) {
            return;
        }

        if (this.connection) {
            return;
        }

        let auth = new ha.Auth(<ha.AuthData>{
            access_token: config.haToken,
            expires: +new Date(new Date().getTime() + 1e11),
            hassUrl: config.haUrl,
            clientId: "",
            expires_in: +new Date(new Date().getTime() + 1e11),
            refresh_token: ""
        });

        try {
            console.log("Connecting to Home Assistant...");
            this.connection = await ha.createConnection({ auth, WebSocket });
        }
        catch (error) {
            this.connection = undefined;
            vscode.window.showErrorMessage(`Error connecting to your Home Assistant Server at ${config.haUrl}, check your network or update your VS Code Settings. Error: ${error}`);
            console.error(error);
            throw error;
        }

        this.connection.addEventListener("ready", () => {
            console.log("Connected to Home Assistant");
        });

        this.connection.addEventListener("disconnected", () => {
            console.log("Lost connection with Home Assistant");
        });

        this.hassEntities = new Promise<ha.HassEntities>(async (resolve, reject) => {
            if (!this.connection) {
                return reject();
            }
            ha.subscribeEntities(this.connection, entities => {
                console.log(`Got ${Object.keys(entities).length} entities from Home Assistant`);
                return resolve(entities);
            });
        });
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

    public async getEntityCompletions(): Promise<HomeAssistantCompletionItem[]> {
        await this.ensureConnection();

        if (!await this.hassEntities) {
            return [];
        }

        let completions: HomeAssistantCompletionItem[] = [];

        for (const [key, value] of Object.entries(await this.hassEntities)) {
            let completionItem = new HomeAssistantCompletionItem(` ${value.entity_id}`, vscode.CompletionItemKind.EnumMember);

            completionItem.documentation = new vscode.MarkdownString(`**${value.entity_id}** \r\n \r\n`);
            if (value.state) {
                completionItem.documentation.appendMarkdown(`State: ${value.state} \r\n \r\n`);
            }
            completionItem.documentation.appendMarkdown(`| Attribute | Value | \r\n`);
            completionItem.documentation.appendMarkdown(`| :---- | :---- | \r\n`);

            for (const [attrKey, attrValue] of Object.entries(value.attributes)) {
                completionItem.documentation.appendMarkdown(`| ${attrKey} | ${attrValue} | \r\n`);
            }
            completions.push(completionItem);
        }
        return completions;
    }

    public async getServiceCompletions(): Promise<HomeAssistantCompletionItem[]> {
        await this.ensureConnection();

        if (!this.hassServices) {
            return [];
        }

        let completions: HomeAssistantCompletionItem[] = [];

        for (const [domainKey, domainValue] of Object.entries(await this.hassServices)) {
            for (const [serviceKey, serviceValue] of Object.entries(domainValue)) {
                let completionItem = new HomeAssistantCompletionItem(` ${domainKey}.${serviceKey}`, vscode.CompletionItemKind.EnumMember);

                var fields = Object.entries(serviceValue.fields);

                if (fields.length > 0) {
                    completionItem.documentation = new vscode.MarkdownString(`**${domainKey}.${serviceKey}:** \r\n \r\n`);
                    completionItem.documentation.appendMarkdown(`| Field | Description | Example | \r\n`);
                    completionItem.documentation.appendMarkdown(`| :---- | :---- | :---- | \r\n`);

                    for (const [fieldKey, fieldValue] of fields) {
                        completionItem.documentation.appendMarkdown(`| ${fieldKey} | ${fieldValue.description} |  ${fieldValue.example} | \r\n`);
                    }
                }
                completions.push(completionItem);
            }
        }

        return completions;
    }

    public disconnect () {
        console.log(`Disconnecting from Home Assistant`);
        
        if (!this.connection) {
            return;
        }
        this.connection.close();
        this.connection = undefined;
    }
}

export class HomeAssistantCompletionItem extends CompletionItem {
} 