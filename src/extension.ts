import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { LanguageClientOptions } from "vscode-languageclient";
import {
  LanguageClient,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";
import TelemetryReporter from "vscode-extension-telemetry";
import { AuthManager } from "./auth/manager";
import { AuthMiddleware } from "./auth/middleware";
import { manageAuth, testConnection } from "./auth/commands";
import { debugAuthSettings } from "./auth/debug";
import { repairAuthConfiguration } from "./auth/repair";

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

  // Attempt to migrate token from settings to SecretStorage if needed
  try {
    const migratedToken = await AuthManager.migrateTokenFromSettings(context);
    if (migratedToken) {
      console.log("Successfully migrated token from settings to SecretStorage");
    }

    // Attempt to migrate Home Assistant instance URL from settings to SecretStorage if needed
    const migratedUrl = await AuthManager.migrateUrlFromSettings(context);
    if (migratedUrl) {
      console.log("Successfully migrated Home Assistant instance URL from settings to SecretStorage");
    }
  } catch (error) {
    console.error("Failed to migrate credentials:", error);
  }

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
    initializationOptions: async () => {
      // Pass token and URL directly in initialization options
      try {
        const token = await AuthManager.getToken(context);
        const url = await AuthManager.getUrl(context);
        const config = vscode.workspace.getConfiguration("vscode-home-assistant");

        console.log("Setting up initialization options for Home Assistant language server");
        console.log(`Token available: ${token ? "Yes" : "No"}`);
        console.log(`Home Assistant instance URL available: ${url ? "Yes" : "No"}`);

        // Use SecretStorage values first, then fallback to settings
        return {
          "vscode-home-assistant": {
            longLivedAccessToken: token || "",
            hostUrl: url || config.get<string>("hostUrl") || "",
            ignoreCertificates: !!config.get<boolean>("ignoreCertificates")
          }
        };
      } catch (error) {
        console.error("Failed to set initialization options:", error);
        return {};
      }
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
    .then(async () => {
      // Install our auth middleware to inject the token and URL from SecretStorage
      try {
        // @ts-expect-error - We need to access the connection which is private
        const connection = client._connection || client;
        await AuthMiddleware.install(context, connection);
        console.log("Auth middleware successfully installed");

        // Force an initial configuration refresh to ensure token and URL are set
        const config = vscode.workspace.getConfiguration("vscode-home-assistant");

        // Get the token and URL directly and explicitly trigger a configuration update
        const token = await AuthManager.getToken(context);
        const url = await AuthManager.getUrl(context); // Also check URL

        if (token && url) { // Ensure both token and URL are present
          console.log("Token and Home Assistant instance URL found, explicitly sending configuration update");
          // Force update some setting to trigger a configuration refresh
          await config.update("triggerConfigRefresh", Date.now(), vscode.ConfigurationTarget.Global);

          // Wait a bit and force another refresh to ensure token and URL reach the server
          setTimeout(async () => {
            try {
              console.log("Sending follow-up configuration refresh");
              await config.update("triggerConfigRefresh", Date.now(), vscode.ConfigurationTarget.Global);
            } catch (error) {
              console.error("Error sending follow-up configuration refresh:", error);
            }
          }, 3000);
        } else if (!token) {
          console.log("No token found in SecretStorage, connection may fail");
          vscode.window.showWarningMessage("No Home Assistant authentication token found. Please set authentication via the 'Home Assistant: Manage Authentication' command.");
        } else if (!url) {
          console.log("No Home Assistant instance URL found in SecretStorage, connection may fail");
          vscode.window.showWarningMessage("No Home Assistant instance URL found. Please set the URL via the 'Home Assistant: Manage Authentication' command.");
        }
      } catch (error) {
        console.error("Failed to install auth middleware:", error);
      }
      client.onNotification("no-config", async (): Promise<void> => {
        if (await AuthManager.hasCredentials(context)) {
          console.log("'no-config' notification received from server, but credentials (token and/or Home Assistant instance URL) found in SecretStorage. Ignoring pop-up.");
          return;
        }
        const manageAuthCommand = "Manage Authentication";
        const optionClicked = await vscode.window.showInformationMessage(
          "No Home Assistant authentication (token and/or Home Assistant instance URL) found. Please set authentication.",
          manageAuthCommand,
        );
        if (optionClicked === manageAuthCommand) {
          await vscode.commands.executeCommand(
            "vscode-home-assistant.manageAuth",
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

  // Register the token management command
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-home-assistant.manageAuth",
      () => manageAuth(context)
    )
  );

  // Register the debug token command
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-home-assistant.debugAuth",
      () => debugAuthSettings(context)
    )
  );

  // Register the token repair command
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-home-assistant.repairAuth",
      () => repairAuthConfiguration(context)
    )
  );

  // Register the test connection command
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-home-assistant.testConnection",
      () => testConnection(context)
    )
  );

  const fileAssociations = vscode.workspace
    .getConfiguration()
    .get("files.associations") as { [key: string]: string };
  if (
    !fileAssociations["*.yaml"] &&
    Object.values(fileAssociations).indexOf("home-assistant") === -1
  ) {
    await vscode.workspace
      .getConfiguration()
      .update("files.associations", { "*.yaml": "home-assistant" }, false);
  }

  // Initial check for credentials
  if (!(await AuthManager.hasCredentials(context))) {
    // Delay the message slightly to avoid race conditions with other startup messages
    setTimeout(() => {
      const manageAuthCommandText = "Manage Authentication";
      vscode.window.showInformationMessage(
        "Welcome to the Home Assistant VS Code Extension! To get started, please set your Home Assistant token and instance URL.",
        manageAuthCommandText
      ).then(selection => {
        if (selection === manageAuthCommandText) {
          vscode.commands.executeCommand("vscode-home-assistant.manageAuth");
        }
      });
    }, 1000);
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
