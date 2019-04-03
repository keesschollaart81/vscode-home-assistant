import * as vscode from 'vscode';
import { EntityIdCompletionProvider } from './entity-id-completion-provider';
import { HomeAssistant } from './homeassistant';
import { Config }  from './configuration';
import { ServiceCompletionProvider } from './service-completion-provider';

export function activate(context: vscode.ExtensionContext) {
	let config = new Config();
	let ha = new HomeAssistant(config);

	let entityCompletionProvider = vscode.languages.registerCompletionItemProvider(
		'yaml',
		new EntityIdCompletionProvider(ha),
		":",
		"-"
	);
	let serviceCompletionProvider = vscode.languages.registerCompletionItemProvider(
		'yaml',
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
}

export function deactivate() { }
