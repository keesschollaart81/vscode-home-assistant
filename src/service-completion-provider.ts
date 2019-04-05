
import * as vscode from "vscode";
import { HomeAssistant } from "./homeassistant";

export class ServiceCompletionProvider implements vscode.CompletionItemProvider {
 
    constructor(private ha: HomeAssistant) {
    }

    async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {

        let linePrefix = document
            .lineAt(position)
            .text.substr(0, position.character);

        const isSingleLineMatch = /(.*)service(:)?( )?([-\w]+?)?$/.test(linePrefix);

        if (!isSingleLineMatch) {
            return [];
        }

        let serviceCompletions = await this.ha.getServiceCompletions();

        console.log(`Showing ${serviceCompletions.length} completions`);

        return {
            incomplete: false,
            items: serviceCompletions
        };
    }
}
