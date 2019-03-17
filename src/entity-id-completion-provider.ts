
import * as vscode from "vscode";
import { HomeAssistant } from "./homeassistant";

export class EntityIdCompletionProvider implements vscode.CompletionItemProvider {

    entityIdPropertyMatch = /(.*)entity_id(:)?( )?([-\w]+?)?$/;

    constructor(private ha: HomeAssistant) {
    }

    async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {

        let linePrefix = document
            .lineAt(position)
            .text.substr(0, position.character);

        const isSingleLineMatch = linePrefix.match(this.entityIdPropertyMatch);

        if (!isSingleLineMatch && !this.isMultiLineMatch(document, position)) {
            return [];
        }

        let entityCompletions = await this.ha.getEntityCompletions();

        return {
            incomplete: false,
            items: entityCompletions
        };
    }

    isMultiLineMatch(document: vscode.TextDocument, position: vscode.Position): boolean {
        let currentLine = position.line;
        while (currentLine > 0) {
            var thisLine = document.lineAt(currentLine);
            let isOtherItemInList = thisLine.text.match(/-\s*([-\w]+)?(\.)?([-\w]+?)?\s*$/);
            if (isOtherItemInList) {
                currentLine--;
                continue;
            }
            return this.entityIdPropertyMatch.test(thisLine.text);
        }
        return false;
    }
}
