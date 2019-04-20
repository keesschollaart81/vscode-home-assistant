import { createConnection, TextDocuments, ProposedFeatures, TextDocumentSyncKind, RequestType} from 'vscode-languageserver';
import { getLanguageService } from './yamlLanguageService';
import * as path from 'path';
import { parse as parseYAML } from 'yaml-language-server/out/server/src/languageservice/parser/yamlParser';
// import * as vscode from 'vscode';
import { NestedYamlParser, VsCodeFileAccessor } from './yamlDiscovery';

let connection = createConnection(ProposedFeatures.all);
let documents = new TextDocuments();
let workspaceFolder: string | null;
documents.listen(connection);
 
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


export let languageService = getLanguageService( 
    workspaceContext,
    {
        validation: true
    }
);
documents.onDidChangeContent(async (textDocumentChangeEvent) =>{
	if (!textDocumentChangeEvent.document) {
        return;
    }

    if (textDocumentChangeEvent.document.getText().length === 0) {
        return;
    }
 

    var vsCodeFileAccessor = new VsCodeFileAccessor(workspaceFolder,connection);
    var parser = new NestedYamlParser(vsCodeFileAccessor);
    var parseResult = await parser.parse([ 
        path.join(workspaceFolder,"configuration.yaml"),
        path.join(workspaceFolder,"ui-lovelace.yaml")
    ]);

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
        connection.sendDiagnostics({ uri: textDocumentChangeEvent.document.uri, diagnostics: diagnostics });
    }, (error) => {
        connection.window.showErrorMessage(`oops: ${error}`);
     });
    })

documents.onDidOpen((event) => {
	connection.console.log(`[Server(${process.pid}) ${workspaceFolder}] Document opened: ${event.document.uri}`);
}); 

connection.listen();
 