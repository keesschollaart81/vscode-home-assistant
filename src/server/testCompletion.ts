'use strict';

import { MarkedString, CompletionItemKind, CompletionItem } from 'vscode-languageserver';
import { JSONWorkerContribution, JSONPath, CompletionsCollector } from 'vscode-json-languageservice'; 



export class EntityIdCompletionContribution implements JSONWorkerContribution {

    private propertyMatches: string[] = [
        "entity_id",
        "entity",
        "entities",
        "include_entities",
        "exclude_entities",
        "badges"
    ];

    constructor() {
    }

    public collectDefaultCompletions(resource: string, result: CompletionsCollector): Thenable<any> {
        return null;
    }

    public collectPropertyCompletions = async (resource: string, location: JSONPath, currentWord: string, addValue: boolean, isLast: boolean, result: CompletionsCollector): Promise<any> => {
        // if (this.isSettingsFile(resource) && location.length === 1 && location[0] === 'files.associations') {
        // 	globProperties.forEach(e => {
        // 		e.filterText = e.insertText;
        // 		result.add(e);
        // 	});
        // }

        return null;
    }

    public collectValueCompletions = async (resource: string, location: JSONPath, currentKey: string, result: CompletionsCollector): Promise<any> => {
        // if (this.isSettingsFile(resource) && location.length === 1 && location[0] === 'files.associations') {
        // 	this.languageIds.forEach(l => {
        // 		result.add({
        // 			kind: CompletionItemKind.Value,
        // 			label: l,
        // 			insertText: JSON.stringify('{{' + l + '}}'),
        // 			filterText: JSON.stringify(l)
        // 		});
        // 	});
        // }
        if (!this.propertyMatches.some(x => x === currentKey)) {
            return null;
        }

        var completion = <CompletionItem>{
            kind: CompletionItemKind.EnumMember,
            label: "label",
            insertText: "insertText",
            filterText: "filterText"
        };

        result.add(completion);

        return null;
    }

    public getInfoContribution(resource: string, location: JSONPath): Thenable<MarkedString[]> {
        return null;
    }
}