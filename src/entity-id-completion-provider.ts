
import * as vscode from "vscode";
import { HomeAssistant } from "./homeassistant";

export class EntityIdCompletionProvider implements vscode.CompletionItemProvider {

    constructor(private ha: HomeAssistant) {
    }

    async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {

        let linePrefix = document
            .lineAt(position)
            .text.substr(0, position.character);

        const match = linePrefix.match(/(.*)entity_id(:)?( )?([-\w]+?)?$/);
        // const match = linePrefix.endsWith("entity_id:");
        if (!match) {
            return [];
        }

        let entityCompletions = await this.ha.getEntityCompletions();

        return {
            incomplete: true,
            items: entityCompletions
        };
    }
}
