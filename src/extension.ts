import * as path from 'path';
import * as vscode from 'vscode';
import { LanguageClient, LanguageClientOptions, TransportKind, ServerOptions } from 'vscode-languageclient';

const documentSelector = [
    { language: 'home-assistant', scheme: 'file' },
    { language: 'home-assistant', scheme: 'untitled' }
];

export function activate(context: vscode.ExtensionContext) {

	var serverModule = path.join(context.extensionPath, 'out', 'server', 'server.js');

   var debugOptions = { execArgv: ['--nolazy', "--inspect=6003"] };

   var serverOptions: ServerOptions = {
	   run: { module: serverModule, transport: TransportKind.ipc },
	   debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
   };

   var clientOptions: LanguageClientOptions = {
	   documentSelector,
	   synchronize: {
		   configurationSection: 'vscode-home-assistant',
		   fileEvents: vscode.workspace.createFileSystemWatcher('**/*.?(e)y?(a)ml')
	   }
   };

   var client = new LanguageClient('home-assistant', 'Home Assistant Language Server', serverOptions, clientOptions);
   
   // is this really needed?
   vscode.languages.setLanguageConfiguration('home-assistant', { wordPattern: /("(?:[^\\\"]*(?:\\.)?)*"?)|[^\s{}\[\],:]+/ });
 
   context.subscriptions.push(client.start());
}

export function deactivate() { }
