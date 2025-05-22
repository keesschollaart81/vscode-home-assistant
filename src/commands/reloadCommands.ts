import * as vscode from "vscode";
import { CommandMappings } from "../extension";

/**
 * Register all reload related commands
 * @param context The extension context
 * @param commandMappings The command mappings defined in the extension
 * @param client The language client to send requests to
 */
export function registerReloadCommands(
  context: vscode.ExtensionContext, 
  commandMappings: CommandMappings[], 
  client: any
): void {
  // Register each command mapping
  commandMappings.filter(mapping => mapping.commandId.toLowerCase().includes("reload"))
    .forEach((mapping) => {
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
        })
      );
    });
  
  // Register special case for inputReload that handles multiple domains
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-home-assistant.inputReload",
      async (_) => {
        const inputReloadDomains = [
          "input_button",
          "input_boolean",
          "input_datetime",
          "input_number",
          "input_select",
          "input_text",
        ];

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
    )
  );

  // Register the reload integrations menu command
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-home-assistant.showReloadIntegrations",
      () => showReloadIntegrations(commandMappings)
    )
  );
}

/**
 * Shows a quick pick menu with all reload commands
 * @param commandMappings The command mappings defined in the extension
 */
export async function showReloadIntegrations(commandMappings: CommandMappings[]): Promise<void> {
  try {
    // Filter all reload commands
    const reloadCommands = commandMappings
      .filter(cmd => cmd.commandId.toLowerCase().includes("reload"))
      .filter(cmd => cmd.commandId !== "vscode-home-assistant.reloadAll") // Filter out "reloadAll" since it's available in the main menu
      .map(cmd => {
        // Extract just the integration name (domain) from the command ID
        // For example, extract "script" from "vscode-home-assistant.scriptReload"
        const domainName = cmd.domain === "homeassistant" ? "Core" : cmd.domain;
        
        return {
          label: cmd.commandId.replace("vscode-home-assistant.", ""),
          description: `${cmd.domain}.${cmd.service}`,
          commandId: cmd.commandId,
          domain: cmd.domain,
          service: cmd.service,
          // Add a simpler name property to use in the UI
          simpleName: domainName
        };
      });
    
    // Format commands for the quick pick
    const formattedCommands = reloadCommands.map(cmd => {
      // No categories needed since we're not showing them

      return {
        // Just use the integration name as the label
        label: formatIntegrationName(cmd.simpleName),
        // Show only the domain and service in the description
        description: `${cmd.domain}.${cmd.service}`,
        // Remove the detail field to simplify the display
        commandId: cmd.commandId
      };
    });
    
    const selectedCommand = await vscode.window.showQuickPick(
      formattedCommands,
      { 
        placeHolder: "Select integration to reload",
        matchOnDescription: true
      }
    );
    
    // Execute the selected command
    if (selectedCommand) {
      await vscode.commands.executeCommand(selectedCommand.commandId);
    }
  } catch (error) {
    vscode.window.showErrorMessage(`Error showing reload integrations: ${error.message}`);
  }
}

/**
 * Format an integration name to be more readable
 */
function formatIntegrationName(name: string): string {
  // Capitalize first letter
  let formatted = name.charAt(0).toUpperCase() + name.slice(1);
  
  // Insert spaces before capital letters
  formatted = formatted.replace(/([A-Z])/g, " $1").trim();
  
  return formatted;
}
