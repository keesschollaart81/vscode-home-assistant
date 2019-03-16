import * as vscode from 'vscode';
import { EntityIdCompletionProvider } from './entity-id-completion-provider';
import { HomeAssistant } from './homeassistant';

export function activate(context: vscode.ExtensionContext) {
	var ha = new HomeAssistant();
	context.subscriptions.push(
		vscode.languages.registerCompletionItemProvider(
			'yaml',
			new EntityIdCompletionProvider(ha),
			":"
		)
	);
}

export function deactivate() { }
