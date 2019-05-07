import { TextDocument, Position } from "vscode-languageserver";
import { getLineOffsets } from "yaml-language-server/out/server/src/languageservice/utils/arrUtils";
import { EntityIdCompletionContribution } from "./entityIds";

// this is the updated implementation from
// https://github.com/Microsoft/azure-pipelines-language-server/blob/master/language-service/src/utils/yamlServiceUtils.ts
// which works better than the original yaml-language-server one

export const nodeHolder = "~";  //This won't conflict with any legal Pipelines nodes

const nodeLineEnding = ":\r\n";
const nodeHolderWithEnding = nodeHolder + nodeLineEnding;

function is_EOL(c: number) {
    return (c === 0x0A/* LF */) || (c === 0x0D/* CR */);
}

export interface CompletionAdjustment {
    newText: string;
    newPosition: Position;
}

export function completionHelper(document: TextDocument, textDocumentPosition: Position): CompletionAdjustment {
    // Get the string we are looking at via a substring
    const lineNumber: number = textDocumentPosition.line;
    const lineOffsets: number[] = getLineOffsets(document.getText());
    const start: number = lineOffsets[lineNumber];  // Start of where the autocompletion is happening
    let end = 0;                                    // End of where the autocompletion is happening

    if (lineOffsets[lineNumber + 1] !== undefined) {
        end = lineOffsets[lineNumber + 1];
    } else {
        end = document.getText().length;
    }

    while (end - 1 >= start && is_EOL(document.getText().charCodeAt(end - 1))) {
        end--;
    }

    const textLine = document.getText().substring(start, end);

    // Check if the string we are looking at is a node
    if (textLine.indexOf(":") === -1) {
        // We need to add the ":" to load the nodes
        const documentText = document.getText();

        let newText = "";

        // This is for the empty line case
        const trimmedText = textLine.trim();
        if (trimmedText.length === 0 || (trimmedText.length === 1 && trimmedText[0] === '-')) {
            // Add a temp node that is in the document but we don't use at all.
            newText = documentText.substring(0, start + textDocumentPosition.character) + nodeHolderWithEnding + documentText.substr(start + textDocumentPosition.character);
        } else {
            // Add a colon to the end of the current line so we can validate the node
            newText = documentText.substring(0, start + textLine.length) + nodeLineEnding + documentText.substr(lineOffsets[lineNumber + 1] || documentText.length);
        }

        return {
            newText: newText,
            newPosition: textDocumentPosition,
        };

    } else {
        // All the nodes are loaded
        textDocumentPosition.character = textDocumentPosition.character - 1;
        return {
            newText: document.getText(),
            newPosition: textDocumentPosition,
        };
    }
}
 