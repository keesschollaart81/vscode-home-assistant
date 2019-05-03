import { MarkedString, CompletionItem, CompletionItemKind } from 'vscode-languageserver';
import { JSONWorkerContribution, JSONPath, CompletionsCollector } from 'vscode-json-languageservice';
import { IHaConnection } from './haConnection';

export class EntityIdCompletionContribution implements JSONWorkerContribution {

    private propertyMatches: string[] = [
        "entity_id",
        "entity",
        "entities",
        "include_entities",
        "exclude_entities",
        "badges"
    ];

    constructor(private haConnection: IHaConnection) {
    }

    public collectDefaultCompletions(resource: string, result: CompletionsCollector): Thenable<any> {
        return null;
    }

    public collectPropertyCompletions = async (resource: string, location: JSONPath, currentWord: string, addValue: boolean, isLast: boolean, result: CompletionsCollector): Promise<any> => {
        return null;
    }

    public collectValueCompletions = async (resource: string, location: JSONPath, currentKey: string, result: CompletionsCollector): Promise<any> => {
        if (!this.propertyMatches.some(x => x === currentKey)) {
            return null;
        }
        let item: CompletionItem = { kind: CompletionItemKind.Property, label: "label", insertText: "inserttext" };
        result.add(item);

        // var entityIdCompletions = await this.haConnection.getEntityCompletions();
        // entityIdCompletions.forEach(c => {
        //     // result.add(c)
        // });

        return null;
    }

    public getInfoContribution(resource: string, location: JSONPath): Thenable<MarkedString[]> {
        return null;
    }
}