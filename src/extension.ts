import * as path from 'path';
import * as vscode from 'vscode';
import { LanguageClient, LanguageClientOptions, TransportKind, ServerOptions } from 'vscode-languageclient';
import { EntityIdCompletionProvider } from './entity-id-completion-provider';
import { HomeAssistant } from './homeassistant';
import { Config }  from './configuration';
import { ServiceCompletionProvider } from './service-completion-provider';

const documentSelector = [
    { language: 'yaml', scheme: 'file' },
    { language: 'yaml', scheme: 'untitled' }
];

export function activate(context: vscode.ExtensionContext) {
	let config = new Config();
	let ha = new HomeAssistant(config);

	let entityCompletionProvider = vscode.languages.registerCompletionItemProvider(
		documentSelector,
		new EntityIdCompletionProvider(ha),
		":",
		"-"
	);
	let serviceCompletionProvider = vscode.languages.registerCompletionItemProvider(
		documentSelector,
		new ServiceCompletionProvider(ha),
		":"
	);

	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(() => {
		ha.disconnect();
		config.reset();
	}));
	
	context.subscriptions.push(entityCompletionProvider);
	context.subscriptions.push(serviceCompletionProvider);

	config.hasConfigOrAsk();

   // start language client
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
   client.onReady().then(() =>{
	client.onRequest('ha/openTextDocument', vscode.workspace.openTextDocument);
   })
   context.subscriptions.push(client.start());
}

export function deactivate() { }
