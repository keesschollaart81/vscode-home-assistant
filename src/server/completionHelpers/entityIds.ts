import { MarkedString, CompletionItem, CompletionItemKind } from 'vscode-languageserver';
import { JSONWorkerContribution, JSONPath, CompletionsCollector } from 'vscode-json-languageservice';
import { IHaConnection } from '../home-assistant/haConnection';

export class EntityIdCompletionContribution implements JSONWorkerContribution {

    public static propertyMatches: string[] = [
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
        if (location.length < 2) {
            return;
        }
        var currentNode = location[location.length - 1];
        var parentNode = location[location.length - 2]; // in case or arrays, currentNode is the indexer for the array position
        if (!EntityIdCompletionContribution.propertyMatches.some(x => x === currentNode || (!isNaN(+currentNode) && x === parentNode))) {
            return null;
        }
        var entityIdCompletions = await this.haConnection.getEntityCompletions();
        entityIdCompletions.forEach(c => result.add(c));

        return null;
   }

    public collectValueCompletions = async (resource: string, location: JSONPath, currentKey: string, result: CompletionsCollector): Promise<any> => {
        if (!EntityIdCompletionContribution.propertyMatches.some(x => x === currentKey)) {
            return null;
        }
        var entityIdCompletions = await this.haConnection.getEntityCompletions();
        entityIdCompletions.forEach(c => result.add(c));

        return null;
    }

    public getInfoContribution(resource: string, location: JSONPath): Thenable<MarkedString[]> {
        return null;
    }
}