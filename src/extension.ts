import * as vscode from 'vscode';
import { EntityIdCompletionProvider } from './entity-id-completion-provider';
import { HomeAssistant } from './homeassistant';
import { config } from './configuration';

export function activate(context: vscode.ExtensionContext) {

	let ha = new HomeAssistant();

	let completionProvider = vscode.languages.registerCompletionItemProvider(
		'yaml',
		new EntityIdCompletionProvider(ha),
		":",
		"-"
	);

	context.subscriptions.push(completionProvider);

	config.hasConfigOrAsk();
}

export function deactivate() { }
