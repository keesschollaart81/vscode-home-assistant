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
        client.onNotification("configuration_check_completed", async (result) => {
            if (result && result.result === "valid") {
                vscode.window.showInformationMessage("Home Assistant Configuration Checked, result: 'Valid'!");
            }
            else {
                vscode.window.showErrorMessage(`Home Assistant Configuration check resulted in an error: ${result.error}`);
            }
        });
        var haOutputChannel: vscode.OutputChannel;
        client.onNotification("get_eror_log_completed", async (result) => {
            if (!haOutputChannel) {
                haOutputChannel = vscode.window.createOutputChannel("Home Assistant Error Log");
            }
            haOutputChannel.appendLine(result);
            haOutputChannel.show();
        });

    }).catch((reason) => {
        console.error(JSON.stringify(reason));
        reporter.sendTelemetryEvent('extension.languageserver.onReadyError', { 'reason': JSON.stringify(reason) });
    });

    let commandMappings = [
        new CommandMappings('vscode-home-assistant.scriptReload', "script", "reload"),
        new CommandMappings('vscode-home-assistant.groupReload', "group", "reload"),
        new CommandMappings('vscode-home-assistant.homeassistantReloadCoreConfig', "homeassistant", "reload_core_config"),
        new CommandMappings('vscode-home-assistant.homeassistantRestart', "homeassistant", "restart"),
        new CommandMappings('vscode-home-assistant.automationReload', "automation", "reload"),
        new CommandMappings('vscode-home-assistant.sceneReload', "scene", "reload"),
        new CommandMappings('vscode-home-assistant.themeReload', "frontend", "reload_themes"),
        new CommandMappings('vscode-home-assistant.hassioAddonRestartGitPull', "hassio", "addon_restart", { addon: "core_git_pull" }),
        new CommandMappings('vscode-home-assistant.hassioHostReboot', "hassio", "host_reboot")
    ];

    commandMappings.forEach(mapping => {
        context.subscriptions.push(vscode.commands.registerCommand(mapping.commandId, _ => {
            client.sendRequest("callService", { domain: mapping.domain, service: mapping.service, serviceData: mapping.serviceData });
        }));
    });

    let inputReloadDomains = [
        'input_boolean', 'input_datetime', 'input_number', 'input_select', 'input_text'
    ];

    context.subscriptions.push(vscode.commands.registerCommand("vscode-home-assistant.inputReload", _ => {
        inputReloadDomains.forEach((domain) => {
            client.sendRequest("callService", { domain, service: 'reload' })
        })
    }))

    context.subscriptions.push(vscode.commands.registerCommand("vscode-home-assistant.homeassistantCheckConfig", _ => client.sendRequest("checkConfig")));
    context.subscriptions.push(vscode.commands.registerCommand("vscode-home-assistant.getErrorLog", _ => client.sendRequest("getErrorLog")));

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

export class CommandMappings {
    constructor(public commandId: string, public domain: string, public service: string, public serviceData?: any) {

    }
}
