import { ExtensionContext } from "vscode";
import {
  HelpAndFeedbackView,
  Command,
} from "vscode-ext-help-and-feedback-view";

interface Reload {
  name: string;
  command: string;
}

export function registerCommandsView(context: ExtensionContext): void {
  const commands: Reload[] = [
    {
      name: "Scripts",
      command: "vscode-home-assistant.scriptReload",
    },
    {
      name: "Groups",
      command: "vscode-home-assistant.groupReload",
    },
    {
      name: "Configuration",
      command: "vscode-home-assistant.homeassistantReloadCoreConfig",
    },
    {
      name: "Automations",
      command: "vscode-home-assistant.automationReload",
    },
    {
      name: "Scenes",
      command: "vscode-home-assistant.sceneReload",
    },
    {
      name: "Themes",
      command: "vscode-home-assistant.themeReload",
    },
    {
      name: "Inputs",
      command: "vscode-home-assistant.inputReload",
    },
    {
      name: "HomeKit",
      command: "vscode-home-assistant.homekitReload",
    },
    {
      name: "File Size",
      command: "vscode-home-assistant.filesizeReload",
    },
    {
      name: "Min/Max",
      command: "vscode-home-assistant.minMaxReload",
    },
    {
      name: "Generic Thermostat",
      command: "vscode-home-assistant.genericThermostatReload",
    },
    {
      name: "Generic Camera",
      command: "vscode-home-assistant.genericCameraReload",
    },
    {
      name: "Ping",
      command: "vscode-home-assistant.pingReload",
    },
    {
      name: "Trend",
      command: "vscode-home-assistant.trendReload",
    },
    {
      name: "History Stats",
      command: "vscode-home-assistant.historyStatsReload",
    },
    {
      name: "Universal Media Player",
      command: "vscode-home-assistant.universalReload",
    },
    {
      name: "Statistics",
      command: "vscode-home-assistant.statisticsReload",
    },
    {
      name: "Filter",
      command: "vscode-home-assistant.filterReload",
    },
    {
      name: "REST",
      command: "vscode-home-assistant.restReload",
    },
    {
      name: "Command Line",
      command: "vscode-home-assistant.commandLineReload",
    },
    {
      name: "Bayesian",
      command: "vscode-home-assistant.bayesianReload",
    },
    {
      name: "Telegram",
      command: "vscode-home-assistant.telegramReload",
    },
    {
      name: "SMTP",
      command: "vscode-home-assistant.smtpReload",
    },
    {
      name: "MQTT",
      command: "vscode-home-assistant.mqttReload",
    },
    {
      name: "Raspberry Pi GPIO",
      command: "vscode-home-assistant.rpioGpioReload",
    },
    {
      name: "KNX",
      command: "vscode-home-assistant.knxReload",
    },
    {
      name: "Template Entities",
      command: "vscode-home-assistant.templateReload",
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
