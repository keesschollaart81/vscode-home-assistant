import {
	createConnection, TextDocuments, ProposedFeatures, TextDocumentSyncKind
} from 'vscode-languageserver';

let connection = createConnection(ProposedFeatures.all);
let documents = new TextDocuments();
let workspaceFolder: string | null;

documents.onDidOpen((event) => {
	connection.console.log(`[Server(${process.pid}) ${workspaceFolder}] Document opened: ${event.document.uri}`);
});
documents.listen(connection);

connection.onInitialize((params) => {
	workspaceFolder = params.rootUri;
	connection.console.log(`[Server(${process.pid}) ${workspaceFolder}] Started and initialize received`);
	return {
		capabilities: {
			textDocumentSync: {
				openClose: true,
				change: TextDocumentSyncKind.None
			}
		}
	};
});
connection.listen();