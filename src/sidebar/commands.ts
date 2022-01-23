import { ExtensionContext } from "vscode";
import {
  HelpAndFeedbackView,
  Command,
} from "vscode-ext-help-and-feedback-view";
import { extensionId } from "../constants";

interface Reload {
  name: string;
  command: string;
}

export function registerCommandsView(context: ExtensionContext): void {
  const commands: Reload[] = [
    {
      name: "Scripts",
      command: `${extensionId}.scriptReload`,
    },
    {
      name: "Groups",
      command: `${extensionId}.groupReload`,
    },
    {
      name: "Configuration",
      command: `${extensionId}.homeassistantReloadCoreConfig`,
    },
    {
      name: "Automations",
      command: `${extensionId}.automationReload`,
    },
    {
      name: "Scenes",
      command: `${extensionId}.sceneReload`,
    },
    {
      name: "Themes",
      command: `${extensionId}.themeReload`,
    },
    {
      name: "Inputs",
      command: `${extensionId}.inputReload`,
    },
    {
      name: "HomeKit",
      command: `${extensionId}.homekitReload`,
    },
    {
      name: "File Size",
      command: `${extensionId}.filesizeReload`,
    },
    {
      name: "Min/Max",
      command: `${extensionId}.minMaxReload`,
    },
    {
      name: "Generic Thermostat",
      command: `${extensionId}.genericThermostatReload`,
    },
    {
      name: "Generic Camera",
      command: `${extensionId}.genericCameraReload`,
    },
    {
      name: "Ping",
      command: `${extensionId}.pingReload`,
    },
    {
      name: "Trend",
      command: `${extensionId}.trendReload`,
    },
    {
      name: "History Stats",
      command: `${extensionId}.historyStatsReload`,
    },
    {
      name: "Universal Media Player",
      command: `${extensionId}.universalReload`,
    },
    {
      name: "Statistics",
      command: `${extensionId}.statisticsReload`,
    },
    {
      name: "Filter",
      command: `${extensionId}.filterReload`,
    },
    {
      name: "REST",
      command: `${extensionId}.restReload`,
    },
    {
      name: "Command Line",
      command: `${extensionId}.commandLineReload`,
    },
    {
      name: "Bayesian",
      command: `${extensionId}.bayesianReload`,
    },
    {
      name: "Telegram",
      command: `${extensionId}.telegramReload`,
    },
    {
      name: "SMTP",
      command: `${extensionId}.smtpReload`,
    },
    {
      name: "MQTT",
      command: `${extensionId}.mqttReload`,
    },
    {
      name: "Raspberry Pi GPIO",
      command: `${extensionId}.rpioGpioReload`,
    },
    {
      name: "KNX",
      command: `${extensionId}.knxReload`,
    },
    {
      name: "Template Entities",
      command: `${extensionId}.templateReload`,
    },
  ];

  const items: Command[] = commands
    .sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    })
    .map((reload) => ({
      icon: "sync",
      title: `Reload ${reload.name}`,
      command: reload.command,
    }));

  // eslint-disable-next-line
  new HelpAndFeedbackView(context, "homeassistantCommands", items);
}
