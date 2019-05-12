import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { LanguageClient, LanguageClientOptions, TransportKind, ServerOptions } from 'vscode-languageclient';
import TelemetryReporter from 'vscode-extension-telemetry';

const myExtensionId = 'vscode-home-assistant';
const telemetryVersion = generateVersionString(vscode.extensions.getExtension(`keesschollaart.${myExtensionId}`));

let reporter: TelemetryReporter;

const documentSelector = [
    { language: 'home-assistant', scheme: 'file' },
    { language: 'home-assistant', scheme: 'untitled' }
];

export function activate(context: vscode.ExtensionContext) {
    console.log('Home Assistant Extension has been activated!');

    reporter = new TelemetryReporter(myExtensionId, telemetryVersion, 'ff172110-5bb2-4041-9f31-e157f1efda56');
    try {
        reporter.sendTelemetryEvent('extension.activate');
    } catch (e) {
        // if something bad happens reporting telemetry, swallow it and move on
        console.log(`${e}`);
    }

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

    context.subscriptions.push(reporter);
    context.subscriptions.push(client.start());

    client.onReady().then(async () => {
        client.onNotification("no-config", async () => {
            let goToSettings = "Go to Settings (UI)";
            var optionClicked = await vscode.window.showInformationMessage("Please configure Home Assistant (search for 'Home Assistant' in settings).", goToSettings);
            if (optionClicked === goToSettings) {
                vscode.commands.executeCommand("workbench.action.openSettings2");
            }
        });
    }).catch((reason) => {
        console.error(JSON.stringify(reason));
        reporter.sendTelemetryEvent('extension.languageserver.onReadyError', { 'reason': JSON.stringify(reason) });
    });

    var fileAssociations = vscode.workspace.getConfiguration().get("files.associations");
    if (!fileAssociations["*.yaml"]) {
        vscode.workspace.getConfiguration().update("files.associations", { "*.yaml": "home-assistant" }, false);
    }
}

export function deactivate() {
    reporter.dispose();
}

function generateVersionString(extension: vscode.Extension<any>): string {
    // if the extensionPath is a Git repo, this is probably an extension developer
    const isDevMode: boolean = extension ? fs.existsSync(extension.extensionPath + '/.git') : false;
    const baseVersion: string = extension ? extension.packageJSON.version : "0.0.0";

    return isDevMode ? `${baseVersion}-dev` : baseVersion;
}