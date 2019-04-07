import { createConnection, TextDocuments, ProposedFeatures, TextDocumentSyncKind, RequestType} from 'vscode-languageserver';
import { getLanguageService, ClientSettings } from './yamlLanguageService';
import { URI } from 'yaml-language-server/out/server/src/languageservice/utils/uri';
import { CustomSchemaContentRequest } from 'yaml-language-server/out/server/src/server';
import * as path from 'path';
import { parse as parseYAML } from 'yaml-language-server/out/server/src/languageservice/parser/yamlParser';

let connection = createConnection(ProposedFeatures.all);
let documents = new TextDocuments();
let workspaceFolder: string | null;
documents.listen(connection);
connection.window.

connection.onInitialize((params) => {
	workspaceFolder = params.rootUri;
	connection.console.log(`[Server(${process.pid}) ${workspaceFolder}] Started and initialize received`);
	return {
		capabilities: {
			textDocumentSync: {
				openClose: true,
				change: documents.syncKind
			}
		}
	};
});
 
let workspaceContext = {
    resolveRelativePath: (relativePath: string, resource: string) => {
        return path.resolve(resource, relativePath);
    }
};
let schemaRequestService = (uri: string): Thenable<string> => {
    if (uri.startsWith('file://')) {
        let fsPath = uri;
        return new Promise<string>((c, e) => {
            // fs.readFile(fsPath, 'UTF-8', (err, result) => {
            //     err ? e('') : c(result.toString());
            // });
        });
    } else if (uri.startsWith('vscode://')) {
        return connection.sendRequest(new RequestType('vscode/content'), uri).then(responseText => {
            return responseText;
        }, error => {
            return error.message;
        });
    } else {
        let scheme = URI.parse(uri).scheme.toLowerCase();
        if (scheme !== 'http' && scheme !== 'https') {
            // custom scheme
            return <Thenable<string>>connection.sendRequest(CustomSchemaContentRequest.type, uri);
        }
    }
    if (uri.indexOf('//schema.management.azure.com/') !== -1) {
        connection.telemetry.logEvent({
            key: 'json.schema',
            value: {
                schemaURL: uri
            }
        });
    }
    // let headers = { 'Accept-Encoding': 'gzip, deflate' };
    // return xhr({ url: uri, followRedirects: 5, headers }).then(response => {
    //     return response.responseText;
    // }, (error: XHRResponse) => {
    //     return null;
    // });
};


export let languageService = getLanguageService(
    schemaRequestService,
    workspaceContext,
    {
        validation: true
    }
);
documents.onDidChangeContent((textDocumentChangeEvent) =>{
	if (!textDocumentChangeEvent.document) {
        return;
    }

    if (textDocumentChangeEvent.document.getText().length === 0) {
        return;
    }

    let yamlDocument = parseYAML(textDocumentChangeEvent.document.getText(), []);
    if (!yamlDocument) {
        return;
    }
    languageService.doValidation(textDocumentChangeEvent.document, yamlDocument).then((diagnosticResults) => {

        if (!diagnosticResults) {
            return;
        }
        let diagnostics = [];
        for (let diagnosticItem in diagnosticResults) {
            diagnosticResults[diagnosticItem].severity = 1; //Convert all warnings to errors
            diagnostics.push(diagnosticResults[diagnosticItem]);
        }

        // connection.sendDiagnostics({ uri: textDocumentChangeEvent.document.uri, diagnostics: removeDuplicatesObj(diagnostics) });
    }, (error) => { });})

documents.onDidOpen((event) => {
	connection.console.log(`[Server(${process.pid}) ${workspaceFolder}] Document opened: ${event.document.uri}`);
}); 

connection.listen();