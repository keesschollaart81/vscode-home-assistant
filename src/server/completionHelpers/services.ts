import { MarkedString } from 'vscode-languageserver';
import { JSONWorkerContribution, JSONPath, CompletionsCollector } from 'vscode-json-languageservice';
import { IHaConnection } from '../home-assistant/haConnection';

export class ServicesCompletionContribution implements JSONWorkerContribution {

    public static propertyMatches: string[] = [ 
        "service"
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
        if (!ServicesCompletionContribution.propertyMatches.some(x => x === currentNode || x === parentNode)) {
            return null;
        }
        var servicesCompletions = await this.haConnection.getServiceCompletions();
        servicesCompletions.forEach(c => result.add(c));

        return null;
   }

    public collectValueCompletions = async (resource: string, location: JSONPath, currentKey: string, result: CompletionsCollector): Promise<any> => {
        if (!ServicesCompletionContribution.propertyMatches.some(x => x === currentKey)) {
            return null;
        }
        var servicesCompletions = await this.haConnection.getServiceCompletions();
        servicesCompletions.forEach(c => result.add(c));

        return null;
    }

    public getInfoContribution(resource: string, location: JSONPath): Thenable<MarkedString[]> {
        return null;
    }
}