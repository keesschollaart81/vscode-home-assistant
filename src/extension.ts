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
import { HassEntity } from "home-assistant-js-websocket";
import { EntitiesProvider } from "./sidebar/entities";
import { registerCommandsView } from "./sidebar/commands";
import {
  extensionId,
  fullExtensionId,
  inputReloadDomains,
  languageId,
} from "./constants";
import { registerHelpAndFeedbackView } from "./sidebar/helpAndFeedback";

const telemetryVersion = generateVersionString(
  vscode.extensions.getExtension(fullExtensionId)
);

let reporter: TelemetryReporter;

const documentSelector = [
  { language: languageId, scheme: "file" },
  { language: languageId, scheme: "untitled" },
];

export async function activate(
  context: vscode.ExtensionContext
): Promise<void> {
  console.log("Home Assistant Extension has been activated!");

  reporter = new TelemetryReporter(
    extensionId,
    telemetryVersion,
    "ff172110-5bb2-4041-9f31-e157f1efda56"
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
    "server.js"
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
      configurationSection: extensionId,
      fileEvents: vscode.workspace.createFileSystemWatcher("**/*.?(e)y?(a)ml"),
    },
  };

  const client = new LanguageClient(
    languageId,
    "Home Assistant Language Server",
    serverOptions,
    clientOptions
  );

  // is this really needed?
  vscode.languages.setLanguageConfiguration(languageId, {
    wordPattern: /("(?:[^\\"]*(?:\\.)?)*"?)|[^\s{}[\],:]+/,
  });

  context.subscriptions.push(reporter);
  context.subscriptions.push(client.start());

  client
    .onReady()
    .then(() => {
      const entitiesProvider = new EntitiesProvider(context);
      registerCommandsView(context);
      registerHelpAndFeedbackView(context);

      client.onNotification("no-config", async (): Promise<void> => {
        const goToSettings = "Go to Settings (UI)";
        const optionClicked = await vscode.window.showInformationMessage(
          "Please configure Home Assistant (search for 'Home Assistant' in settings).",
          goToSettings
        );
        if (optionClicked === goToSettings) {
          await vscode.commands.executeCommand(
            "workbench.action.openSettings2"
          );
        }
      });
      client.onNotification("configuration_check_completed", async (result) => {
        if (result && result.result === "valid") {
          await vscode.window.showInformationMessage(
            "Home Assistant Configuration Checked, result: 'Valid'!"
          );
        } else {
          await vscode.window.showErrorMessage(
            `Home Assistant Configuration check resulted in an error: ${result.error}`
          );
        }
      });
      let haOutputChannel: vscode.OutputChannel;
      client.onNotification("get_eror_log_completed", (result) => {
        if (!haOutputChannel) {
          haOutputChannel = vscode.window.createOutputChannel(
            "Home Assistant Error Log"
          );
        }
        haOutputChannel.appendLine(result);
        haOutputChannel.show();
      });

      let haTemplateRendererChannel: vscode.OutputChannel;
      client.onNotification("render_template_completed", (result) => {
        if (!haTemplateRendererChannel) {
          haTemplateRendererChannel = vscode.window.createOutputChannel(
            "Home Assistant Template Renderer"
          );
        }
        haTemplateRendererChannel.clear();
        haTemplateRendererChannel.appendLine(result);
        haTemplateRendererChannel.show();
      });

      client.onNotification("fetch_entities_completed", async (entities) => {
        if (entities) {
          const values: HassEntity[] = Object.values(entities);
          await vscode.window.showInformationMessage(
            `Fetched ${values.length} entities`
          );

          entitiesProvider.updateEntities(values);
        }
      });
    })
    .catch((reason) => {
      console.error(JSON.stringify(reason));
      reporter.sendTelemetryEvent("extension.languageserver.onReadyError", {
        reason: JSON.stringify(reason),
      });
    });

  const commandMappings = [
    new CommandMappings(`${extensionId}.scriptReload`, "script", "reload"),
    new CommandMappings(`${extensionId}.groupReload`, "group", "reload"),
    new CommandMappings(
      `${extensionId}.homeassistantReloadCoreConfig`,
      "homeassistant",
      "reload_core_config"
    ),
    new CommandMappings(
      `${extensionId}.homeassistantRestart`,
      "homeassistant",
      "restart"
    ),
    new CommandMappings(
      `${extensionId}.automationReload`,
      "automation",
      "reload"
    ),
    new CommandMappings(`${extensionId}.sceneReload`, "scene", "reload"),
    new CommandMappings(
      `${extensionId}.themeReload`,
      "frontend",
      "reload_themes"
    ),
    new CommandMappings(`${extensionId}.homekitReload`, "homekit", "reload"),
    new CommandMappings(`${extensionId}.filesizeReload`, "filesize", "reload"),
    new CommandMappings(`${extensionId}.minMaxReload`, "min_max", "reload"),
    new CommandMappings(
      `${extensionId}.genericThermostatReload`,
      "generic_thermostat",
      "reload"
    ),
    new CommandMappings(
      `${extensionId}.genericCameraReload`,
      "generic",
      "reload"
    ),
    new CommandMappings(`${extensionId}.pingReload`, "ping", "reload"),
    new CommandMappings(`${extensionId}.trendReload`, "trend", "reload"),
    new CommandMappings(
      `${extensionId}.historyStatsReload`,
      "history_stats",
      "reload"
    ),
    new CommandMappings(
      `${extensionId}.universalReload`,
      "universal",
      "reload"
    ),
    new CommandMappings(
      `${extensionId}.statisticsReload`,
      "statistics",
      "reload"
    ),
    new CommandMappings(`${extensionId}.filterReload`, "filter", "reload"),
    new CommandMappings(`${extensionId}.restReload`, "rest", "reload"),
    new CommandMappings(
      `${extensionId}.commandLineReload`,
      "command_line",
      "reload"
    ),
    new CommandMappings(`${extensionId}.bayesianReload`, "bayesian", "reload"),
    new CommandMappings(`${extensionId}.telegramReload`, "telegram", "reload"),
    new CommandMappings(`${extensionId}.smtpReload`, "smtp", "reload"),
    new CommandMappings(`${extensionId}.mqttReload`, "mqtt", "reload"),
    new CommandMappings(`${extensionId}.rpioGpioReload`, "rpi_gpio", "reload"),
    new CommandMappings(`${extensionId}.knxReload`, "knx", "reload"),
    new CommandMappings(`${extensionId}.templateReload`, "template", "reload"),
    new CommandMappings(
      `${extensionId}.hassioAddonRestartGitPull`,
      "hassio",
      "addon_restart",
      { addon: "core_git_pull" }
    ),
    new CommandMappings(
      `${extensionId}.hassioHostReboot`,
      "hassio",
      "host_reboot"
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
          `Home Assistant service ${mapping.domain}.${mapping.service} called!`
        );
      })
    );
  });

  context.subscriptions.push(
    vscode.commands.registerCommand(`${extensionId}.inputReload`, async (_) => {
      await Promise.all(
        inputReloadDomains.map(async (domain) => {
          await client.sendRequest("callService", {
            domain,
            service: "reload",
          });
        })
      );
      await vscode.window.showInformationMessage(
        "Home Assistant inputs reload called!"
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      `${extensionId}.homeassistantCheckConfig`,
      async () => {
        await client.sendRequest("checkConfig");
      }
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(`${extensionId}.getErrorLog`, async () => {
      await client.sendRequest("getErrorLog");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      `${extensionId}.renderTemplate`,
      async () => {
        const editor = vscode.window.activeTextEditor;
        const selectedText = editor.document.getText(editor.selection);
        await client.sendRequest("renderTemplate", { template: selectedText });
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      `${extensionId}.fetchEntities`,
      async () => {
        await client.sendRequest("fetchEntities");
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      `${extensionId}.openEntityLogbook`,
      (treeItem) => {
        const { hostUrl } = vscode.workspace.getConfiguration()[extensionId];
        return vscode.commands.executeCommand(
          "vscode.open",
          vscode.Uri.parse(`${hostUrl}logbook/?entity_id=${treeItem.label}`)
        );
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      `${extensionId}.openEntityHistory`,
      (treeItem) => {
        const { hostUrl } = vscode.workspace.getConfiguration()[extensionId];
        return vscode.commands.executeCommand(
          "vscode.open",
          vscode.Uri.parse(`${hostUrl}history/?entity_id=${treeItem.label}`)
        );
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(`${extensionId}.copyEntities`, (nodes) =>
      vscode.env.clipboard.writeText(nodes.label)
    )
  );

  const fileAssociations = vscode.workspace
    .getConfiguration()
    .get("files.associations");
  if (
    !fileAssociations["*.yaml"] &&
    Object.values(fileAssociations).indexOf(languageId) === -1
  ) {
    await vscode.workspace
      .getConfiguration()
      .update("files.associations", { "*.yaml": languageId }, false);
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
    }
  ) {}
}
