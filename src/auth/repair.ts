import * as vscode from "vscode";
import { AuthManager } from "./manager";

/**
 * Repair the Home Assistant authentication configuration (token and Home Assistant instance URL)
 * This function addresses common migration and storage issues for both token and URL.
 * Only checks and migrates from global settings, not workspace settings.
 */
export async function repairAuthConfiguration(context: vscode.ExtensionContext): Promise<void> {
  const config = vscode.workspace.getConfiguration("vscode-home-assistant");
  
  // Only check global settings (not workspace settings) for migration
  const tokenInspection = config.inspect<string>("longLivedAccessToken");
  const globalToken = tokenInspection?.globalValue;
  const secretToken = await context.secrets.get("home-assistant.token");
  
  const urlInspection = config.inspect<string>("hostUrl");
  const globalUrl = urlInspection?.globalValue;
  const secretUrl = await context.secrets.get("home-assistant.url");

  let issuesFixed = false;
  const messages: string[] = [];

  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBar.text = "Repairing Home Assistant authentication...";
  statusBar.show();

  try {
    // --- Token Repair Logic ---
    if (globalToken && !secretToken) {
      await AuthManager.storeToken(context, globalToken);
      await config.update("longLivedAccessToken", undefined, vscode.ConfigurationTarget.Global);
      messages.push("Token migrated from global settings to secure storage.");
      issuesFixed = true;
    } else if (globalToken && secretToken) {
      await config.update("longLivedAccessToken", undefined, vscode.ConfigurationTarget.Global);
      messages.push("Duplicate token in global settings.json removed; secure token kept.");
      issuesFixed = true;
    } else if (!globalToken && !secretToken) {
      messages.push("No token found in global settings or secure storage. Use workspace settings or environment variables, or set one using 'Manage Home Assistant Authentication'.");
    } else {
      messages.push("Token is correctly stored securely.");
    }

    // --- URL Repair Logic ---
    if (globalUrl && !secretUrl) {
      await AuthManager.storeUrl(context, globalUrl);
      await config.update("hostUrl", undefined, vscode.ConfigurationTarget.Global);
      messages.push("Home Assistant instance URL migrated from global settings to secure storage.");
      issuesFixed = true;
    } else if (globalUrl && secretUrl) {
      await config.update("hostUrl", undefined, vscode.ConfigurationTarget.Global);
      messages.push("Duplicate Home Assistant instance URL in global settings.json removed; secure URL kept.");
      issuesFixed = true;
    } else if (!globalUrl && !secretUrl) {
      messages.push("No Home Assistant instance URL found in global settings or secure storage. Use workspace settings or environment variables, or set one using 'Manage Home Assistant Authentication'.");
      // Prompt to set URL if not found at all
      const newUrl = await vscode.window.showInputBox({
        prompt: "Enter your Home Assistant instance URL (e.g., http://homeassistant.local:8123)",
        placeHolder: "http://homeassistant.local:8123",
        ignoreFocusOut: true,
      });
      if (newUrl) {
        await AuthManager.storeUrl(context, newUrl);
        messages.push(`Home Assistant instance URL set to: ${newUrl}`);
        issuesFixed = true;
      }
    } else {
      messages.push("Home Assistant instance URL is correctly stored securely.");
    }

    if (issuesFixed) {
      vscode.window.showInformationMessage(
        `Home Assistant auth repair complete: ${messages.join(" ")}`
      );
    } else {
      vscode.window.showInformationMessage(
        `Home Assistant auth check complete: ${messages.join(" ")}`
      );
    }

  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to repair auth configuration: ${error.message}`
    );
  } finally {
    statusBar.dispose();
  }
}
