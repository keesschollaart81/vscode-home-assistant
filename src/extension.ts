import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  TransportKind,
  ServerOptions,
} from "vscode-languageclient";
import TelemetryReporter from "vscode-extension-telemetry";

const extensionId = "vscode-home-assistant";
const telemetryVersion = generateVersionString(
  vscode.extensions.getExtension(`keesschollaart.${extensionId}`),
);

let reporter: TelemetryReporter;

const documentSelector = [
  { language: "home-assistant", scheme: "file" },
  { language: "home-assistant", scheme: "untitled" },
];

export async function activate(
  context: vscode.ExtensionContext,
): Promise<void> {
  console.log("Home Assistant Extension has been activated!");

  reporter = new TelemetryReporter(
    extensionId,
    telemetryVersion,
    "ff172110-5bb2-4041-9f31-e157f1efda56",
  );

  try {
    reporter.sendTelemetryEvent("extension.activate");
  } catch (error) {
    // if something bad happens reporting telemetry, swallow it and move on
    console.log(error);
  }

  const serverModule = path.join(
    context.extensionPath,
    "out",
    "server",
    "server.js",
  );

  const debugOptions = { execArgv: ["--nolazy", "--inspect=6003"] };

  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: debugOptions,
    },
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector,
    synchronize: {
      configurationSection: "vscode-home-assistant",
      fileEvents: vscode.workspace.createFileSystemWatcher("**/*.?(e)y?(a)ml"),
    },
  };

  const client = new LanguageClient(
    "home-assistant",
    "Home Assistant Language Server",
    serverOptions,
    clientOptions,
  );

  // is this really needed?
  vscode.languages.setLanguageConfiguration("home-assistant", {
    wordPattern: /("(?:[^\\"]*(?:\\.)?)*"?)|[^\s{}[\],:]+/,
  });

  context.subscriptions.push(reporter);
  context.subscriptions.push(client.start());

  client
    .onReady()
    .then(() => {
      client.onNotification("no-config", async (): Promise<void> => {
        const goToSettings = "Go to Settings (UI)";
        const optionClicked = await vscode.window.showInformationMessage(
          "Please configure Home Assistant (search for 'Home Assistant' in settings).",
          goToSettings,
        );
        if (optionClicked === goToSettings) {
          await vscode.commands.executeCommand(
            "workbench.action.openSettings2",
          );
        }
      });
      client.onNotification("configuration_check_completed", async (result) => {
        if (result && result.result === "valid") {
          await vscode.window.showInformationMessage(
            "Home Assistant Configuration Checked, result: 'Valid'!",
          );
        } else {
          await vscode.window.showErrorMessage(
            `Home Assistant Configuration check resulted in an error: ${result.error}`,
          );
        }
      });
      let haOutputChannel: vscode.OutputChannel;
      client.onNotification("get_eror_log_completed", (result) => {
        if (!haOutputChannel) {
          haOutputChannel = vscode.window.createOutputChannel(
            "Home Assistant Error Log",
          );
        }
        haOutputChannel.appendLine(result);
        haOutputChannel.show();
      });

      let haTemplateRendererChannel: vscode.OutputChannel;
      client.onNotification("render_template_completed", (result) => {
        if (!haTemplateRendererChannel) {
          haTemplateRendererChannel = vscode.window.createOutputChannel(
            "Home Assistant Template Renderer",
          );
        }
        haTemplateRendererChannel.clear();
        haTemplateRendererChannel.appendLine(result);
        haTemplateRendererChannel.show();
      });
    })
    .catch((reason) => {
      console.error(JSON.stringify(reason));
      reporter.sendTelemetryEvent("extension.languageserver.onReadyError", {
        reason: JSON.stringify(reason),
      });
    });

  const commandMappings = [
    new CommandMappings(
      "vscode-home-assistant.reloadAll",
      "homeassistant",
      "reload_all",
    ),
    new CommandMappings(
      "vscode-home-assistant.scriptReload",
      "script",
      "reload",
    ),
    new CommandMappings("vscode-home-assistant.groupReload", "group", "reload"),
    new CommandMappings(
      "vscode-home-assistant.homeassistantReloadCoreConfig",
      "homeassistant",
      "reload_core_config",
    ),
    new CommandMappings(
      "vscode-home-assistant.homeassistantRestart",
      "homeassistant",
      "restart",
    ),
    new CommandMappings(
      "vscode-home-assistant.automationReload",
      "automation",
      "reload",
    ),
    new CommandMappings(
      "vscode-home-assistant.conversationReload",
      "conversation",
      "reload",
    ),
    new CommandMappings("vscode-home-assistant.sceneReload", "scene", "reload"),
    new CommandMappings(
      "vscode-home-assistant.themeReload",
      "frontend",
      "reload_themes",
    ),
    new CommandMappings(
      "vscode-home-assistant.homekitReload",
      "homekit",
      "reload",
    ),
    new CommandMappings(
      "vscode-home-assistant.filesizeReload",
      "filesize",
      "reload",
    ),
    new CommandMappings(
      "vscode-home-assistant.minMaxReload",
      "min_max",
      "reload",
    ),
    new CommandMappings(
      "vscode-home-assistant.genericThermostatReload",
      "generic_thermostat",
      "reload",
    ),
    new CommandMappings(
      "vscode-home-assistant.genericCameraReload",
      "generic",
      "reload",
    ),
    new CommandMappings("vscode-home-assistant.pingReload", "ping", "reload"),
    new CommandMappings("vscode-home-assistant.trendReload", "trend", "reload"),
    new CommandMappings(
      "vscode-home-assistant.historyStatsReload",
      "history_stats",
      "reload",
    ),
    new CommandMappings(
      "vscode-home-assistant.universalReload",
      "universal",
      "reload",
    ),
    new CommandMappings(
      "vscode-home-assistant.statisticsReload",
      "statistics",
      "reload",
    ),
    new CommandMappings(
      "vscode-home-assistant.filterReload",
      "filter",
      "reload",
    ),
    new CommandMappings("vscode-home-assistant.restReload", "rest", "reload"),
    new CommandMappings(
      "vscode-home-assistant.commandLineReload",
      "command_line",
      "reload",
    ),
    new CommandMappings(
      "vscode-home-assistant.bayesianReload",
      "bayesian",
      "reload",
    ),
    new CommandMappings(
      "vscode-home-assistant.telegramReload",
      "telegram",
      "reload",
    ),
    new CommandMappings("vscode-home-assistant.smtpReload", "smtp", "reload"),
    new CommandMappings("vscode-home-assistant.mqttReload", "mqtt", "reload"),
    new CommandMappings(
      "vscode-home-assistant.rpioGpioReload",
      "rpi_gpio",
      "reload",
    ),
    new CommandMappings("vscode-home-assistant.knxReload", "knx", "reload"),
    new CommandMappings(
      "vscode-home-assistant.templateReload",
      "template",
      "reload",
    ),
    new CommandMappings(
      "vscode-home-assistant.customTemplatesReload",
      "homeassistant",
      "reload_custom_templates",
    ),
    new CommandMappings(
      "vscode-home-assistant.hassioAddonRestartGitPull",
      "hassio",
      "addon_restart",
      { addon: "core_git_pull" },
    ),
    new CommandMappings(
      "vscode-home-assistant.hassioHostReboot",
      "hassio",
      "host_reboot",
    ),
  ];

  commandMappings.forEach((mapping) => {
    context.subscriptions.push(
      vscode.commands.registerCommand(mapping.commandId, async (_) => {
        await client.sendRequest("callService", {
          domain: mapping.domain,
          service: mapping.service,
          serviceData: mapping.serviceData,
        });
        await vscode.window.showInformationMessage(
          `Home Assistant service ${mapping.domain}.${mapping.service} called!`,
        );
      }),
    );
  });

  const inputReloadDomains = [
    "input_button",
    "input_boolean",
    "input_datetime",
    "input_number",
    "input_select",
    "input_text",
  ];

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-home-assistant.inputReload",
      async (_) => {
        await Promise.all(
          inputReloadDomains.map(async (domain) => {
            await client.sendRequest("callService", {
              domain,
              service: "reload",
            });
          }),
        );
        await vscode.window.showInformationMessage(
          "Home Assistant inputs reload called!",
        );
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-home-assistant.homeassistantCheckConfig",
      async () => {
        await client.sendRequest("checkConfig");
      },
    ),
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-home-assistant.getErrorLog",
      async () => {
        await client.sendRequest("getErrorLog");
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-home-assistant.renderTemplate",
      async () => {
        const editor = vscode.window.activeTextEditor;
        const selectedText = editor.document.getText(editor.selection);
        await client.sendRequest("renderTemplate", { template: selectedText });
      },
    ),
  );

  const fileAssociations = vscode.workspace
    .getConfiguration()
    .get("files.associations");
  if (
    !fileAssociations["*.yaml"] &&
    Object.values(fileAssociations).indexOf("home-assistant") === -1
  ) {
    await vscode.workspace
      .getConfiguration()
      .update("files.associations", { "*.yaml": "home-assistant" }, false);
  }
}

export async function deactivate(): Promise<void> {
  await reporter.dispose();
}

function generateVersionString(extension: vscode.Extension<any>): string {
  // if the extensionPath is a Git repo, this is probably an extension developer
  const isDevMode: boolean = extension
    ? fs.existsSync(`${extension.extensionPath}/.git`)
    : false;
  const baseVersion: string = extension
    ? extension.packageJSON.version
    : "0.0.0";

  return isDevMode ? `${baseVersion}-dev` : baseVersion;
}

export class CommandMappings {
  constructor(
    public commandId: string,
    public domain: string,
    public service: string,
    public serviceData?: {
      [key: string]: any;
    },
  ) {}
}
