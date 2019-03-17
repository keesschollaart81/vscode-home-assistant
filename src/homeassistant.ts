import * as ha from "home-assistant-js-websocket";
import * as s from "./socket";
import { config } from "./configuration";
import { CompletionItem } from "vscode";
import * as vscode from 'vscode';

export class HomeAssistant {

    connection: ha.Connection | undefined;
    hassEntities: ha.HassEntities | undefined;

    private async ensureConnection(): Promise<void> {
        return new Promise(async (resolve, reject) => {

            let hasConfig = await config.hasConfigOrAsk();
            if (!hasConfig) {
                return reject();
            }

            if (this.connection) {
                return resolve();
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
                console.log("Connecting to Home Assistant...")
                this.connection = await ha.createConnection({
                    auth,
                    createSocket: async () => s.createSocket(auth)
                });
            }
            catch (error) {
                this.connection = undefined;
                vscode.window.showErrorMessage(`Error connecting to your Home Assistant Server at ${config.haUrl}, check your network or update your VS Code Settings. Error: ${error.message}`);
                console.error(error);
                return reject(error);
            }

            this.connection.addEventListener("ready", () => {
                console.log("Connected to Home Assistant");
            });

            this.connection.addEventListener("disconnected", () => {
                console.log("Lost connection with Home Assistant");
            });

            ha.subscribeEntities(this.connection, entities => {
                console.log(`Got ${Object.keys(entities).length} from Home Assistant`);
                this.hassEntities = entities;
                return resolve();
            });
        });
    }

    public async getEntityCompletions(): Promise<HomeAssistantCompletionItem[]> {
        await this.ensureConnection();

        if (!this.hassEntities) {
            return [];
        }

        let completions: HomeAssistantCompletionItem[] = [];

        for (const [key, value] of Object.entries(this.hassEntities)) {
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
}

export class HomeAssistantCompletionItem extends CompletionItem {
} 