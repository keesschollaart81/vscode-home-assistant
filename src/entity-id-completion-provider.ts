
import * as vscode from "vscode";
import { HomeAssistant } from "./homeassistant";

export class EntityIdCompletionProvider implements vscode.CompletionItemProvider {

    propertyMatches = [
        /(.*)entity_id(:)?( )?([-\w]+?)?$/,
        /(.*)entity(:)?( )?([-\w]+?)?$/,
        /(.*)entities(:)?( )?([-\w]+?)?$/,
        /(.*)include_entities(:)?( )?([-\w]+?)?$/,
        /(.*)exclude_entities(:)?( )?([-\w]+?)?$/
    ];

    constructor(private ha: HomeAssistant) {
    }

    async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {

        let linePrefix = document
            .lineAt(position)
            .text.substr(0, position.character);

        const isSingleLineMatch = this.propertyMatches.some(regex => regex.test(linePrefix));

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
            return this.propertyMatches.some(regex => regex.test(thisLine.text));
        }
        return false;
    }
}
