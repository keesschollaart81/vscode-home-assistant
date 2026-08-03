import * as vscode from "vscode";
import { AuthManager } from "./manager";

/**
 * Command to manage the Home Assistant authentication (token and instance URL)
 */
export async function manageAuth(context: vscode.ExtensionContext): Promise<void> {
  const actions = [
    "Set Home Assistant Instance URL",
    "Set Token",
    "Clear Token",
    "Clear Home Assistant Instance URL",
    "View Auth Details (Obscured)",
    "Test Connection",
  ];
  
  const selectedAction = await vscode.window.showQuickPick(actions, {
    placeHolder: "Select an authentication action"
  });
  
  if (!selectedAction) {
    return;
  }
  
  switch (selectedAction) {
    case "Set Home Assistant Instance URL":
      await setInstanceUrl(context);
      break;
    case "Set Token":
      await setToken(context);
      break;
    case "Clear Token":
      await clearToken(context);
      break;
    case "Clear Home Assistant Instance URL":
      await clearInstanceUrl(context);
      break;
    case "View Auth Details (Obscured)":
      await viewAuthDetails(context);
      break;
    case "Test Connection": 
      await testConnection(context);
      break;
  }
}

async function setToken(context: vscode.ExtensionContext): Promise<void> {
  // First, check if we need to set the instance URL
  // Try to get URL from SecretStorage first
  let currentUrl = await AuthManager.getUrl(context);
  
  // If not in SecretStorage, check settings and environment
  if (!currentUrl) {
    const config = vscode.workspace.getConfiguration("vscode-home-assistant");
    currentUrl = config.get<string>("hostUrl") || process.env.HASS_SERVER || 
      (process.env.SUPERVISOR_TOKEN ? "http://supervisor/core" : "");
  }
  
  // Ask for instance URL if not already configured
  let instanceUrl = currentUrl;
  
  // Always ask for the instance URL for verification
  instanceUrl = await vscode.window.showInputBox({
    prompt: "Enter your Home Assistant instance URL",
    placeHolder: "http://homeassistant.local:8123",
    value: currentUrl || "http://homeassistant.local:8123", // Pre-fill default if currentUrl is empty
    validateInput: (input) => {
      // Basic URL validation
      try {
        if (!input) {
          return "Home Assistant instance URL is required";
        }
        
        const url = new URL(input);
        if (!url.protocol.startsWith("http")) {
          return "URL must start with http:// or https://";
        }
        
        return null; // Valid input
      } catch {
        return "Please enter a valid URL (e.g., http://homeassistant.local:8123)";
      }
    }
  });
  
  // User canceled the instance URL input
  if (!instanceUrl) {
    return;
  }
  
  // Save the instance URL
  if (instanceUrl !== currentUrl) {
    try {
      // Store in SecretStorage
      await AuthManager.storeUrl(context, instanceUrl);
      
      // Remove from settings if it exists
      const config = vscode.workspace.getConfiguration("vscode-home-assistant");
      if (config.get("hostUrl") !== undefined) {
        await config.update("hostUrl", undefined, vscode.ConfigurationTarget.Global);
      }
      
      vscode.window.showInformationMessage(`Home Assistant instance URL has been securely stored: ${instanceUrl}`);
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to store Home Assistant instance URL: ${error.message}`);
      return; // Don't proceed to token if URL failed
    }
  }

  const token = await vscode.window.showInputBox({
    prompt: "Enter your Home Assistant Long-Lived Access Token",
    password: true,
    placeHolder: "eyJhbGci..."
  });
  
  if (token) {
    try {
      await AuthManager.storeToken(context, token);
      // Remove from settings if it exists
      const config = vscode.workspace.getConfiguration("vscode-home-assistant");
      if (config.get("longLivedAccessToken") !== undefined) {
        await config.update("longLivedAccessToken", undefined, vscode.ConfigurationTarget.Global);
      }
      vscode.window.showInformationMessage("Home Assistant token has been securely stored.");
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to store token: ${error.message}`);
    }
  } else {
    vscode.window.showWarningMessage("No token was entered.");
  }
}

async function clearToken(context: vscode.ExtensionContext): Promise<void> {
  const confirmation = await vscode.window.showWarningMessage(
    "Are you sure you want to clear the stored Home Assistant token from SecretStorage? This will not affect tokens in workspace settings or environment variables.",
    { modal: true },
    "Yes"
  );
  
  if (confirmation === "Yes") {
    try {
      await AuthManager.deleteToken(context);
      vscode.window.showInformationMessage("Home Assistant token has been cleared from SecretStorage.");
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to clear token: ${error.message}`);
    }
  }
}

async function viewAuthDetails(context: vscode.ExtensionContext): Promise<void> {
  const config = vscode.workspace.getConfiguration("vscode-home-assistant");
  
  // Check all sources for credentials
  const envToken = process.env.HASS_TOKEN || process.env.SUPERVISOR_TOKEN;
  const tokenInspection = config.inspect<string>("longLivedAccessToken");
  const workspaceToken = tokenInspection?.workspaceFolderValue || tokenInspection?.workspaceValue;
  const globalToken = tokenInspection?.globalValue;
  const secretToken = await context.secrets.get("home-assistant.token");
  
  const envUrl = process.env.HASS_SERVER || (process.env.SUPERVISOR_TOKEN ? "http://supervisor/core" : undefined);
  const urlInspection = config.inspect<string>("hostUrl");
  const workspaceUrl = urlInspection?.workspaceFolderValue || urlInspection?.workspaceValue;
  const globalUrl = urlInspection?.globalValue;
  const secretUrl = await context.secrets.get("home-assistant.url");
  
  // Determine active credentials based on priority
  const activeToken = envToken || workspaceToken || secretToken;
  const activeUrl = envUrl || workspaceUrl || secretUrl;
  
  let message = "Home Assistant Authentication Details:\n";
  message += "\n--- Instance URL ---";
  
  if (activeUrl) {
    message += `\nActive URL: ${activeUrl}`;
    if (envUrl === activeUrl) {
      message += " (from environment variable)";
    } else if (workspaceUrl === activeUrl) {
      message += " (from workspace settings)";
    } else if (secretUrl === activeUrl) {
      message += " (from SecretStorage)";
    }
  } else {
    message += "\nActive URL: Not set";
  }
  
  message += "\n\nAll URL sources:";
  message += `\n  Environment: ${envUrl || "Not set"}`;
  message += `\n  Workspace settings: ${workspaceUrl || "Not set"}`;
  message += `\n  SecretStorage: ${secretUrl || "Not set"}`;
  message += `\n  Global settings (deprecated): ${globalUrl || "Not set"}`;
  
  message += "\n\n--- Access Token ---";
  
  if (activeToken) {
    const obscuredToken = activeToken.length <= 10 
      ? "***" 
      : `${activeToken.substring(0, 5)}...${activeToken.substring(activeToken.length - 5)}`;
    message += `\nActive Token: ${obscuredToken}`;
    if (envToken === activeToken) {
      message += " (from environment variable)";
    } else if (workspaceToken === activeToken) {
      message += " (from workspace settings)";
    } else if (secretToken === activeToken) {
      message += " (from SecretStorage)";
    }
  } else {
    message += "\nActive Token: Not set";
  }
  
  message += "\n\nAll token sources:";
  message += `\n  Environment: ${envToken ? "Present" : "Not set"}`;
  message += `\n  Workspace settings: ${workspaceToken ? "Present" : "Not set"}`;
  message += `\n  SecretStorage: ${secretToken ? "Present" : "Not set"}`;
  message += `\n  Global settings (deprecated): ${globalToken ? "Present" : "Not set"}`;
  
  message += "\n\nPriority order: Environment > Workspace settings > SecretStorage";
  
  vscode.window.showInformationMessage(message, { modal: true });
}

export async function testConnection(context: vscode.ExtensionContext): Promise<void> {
  const token = await AuthManager.getToken(context);
  const hostUrl = await AuthManager.getUrl(context);
  
  if (!hostUrl) {
    vscode.window.showErrorMessage(
      "Home Assistant instance URL is not set. Please set it first."
    );
    // Optionally, prompt to set it now
    const setNow = await vscode.window.showQuickPick(["Set Home Assistant Instance URL Now"], {
      placeHolder: "Home Assistant instance URL is missing",
    });
    if (setNow === "Set Home Assistant Instance URL Now") {
      await setInstanceUrl(context);
      // Re-check after attempting to set
      const newHostUrl = await AuthManager.getUrl(context);
      if (!newHostUrl) {
        return; // User cancelled or failed to set
      }
      // If token is also missing, prompt for that too or guide user
      if (!token) {
        vscode.window.showInformationMessage("Home Assistant instance URL set. Now please ensure your token is also set via the 'Set Token' command.");
        return;
      }
      // If both are now set, continue with the test
      await testConnection(context);
    }
    return;
  }
  
  if (!token) {
    vscode.window.showErrorMessage(
      "Home Assistant token is not set. Please set it first."
    );
    // Optionally, prompt to set it now
    const setNow = await vscode.window.showQuickPick(["Set Token Now"], {
      placeHolder: "Token is missing",
    });
    if (setNow === "Set Token Now") {
      await setToken(context); 
      // Re-check after attempting to set
      const newToken = await AuthManager.getToken(context);
      if (!newToken) {
        return; // User cancelled or failed to set
      }
      // If token is now set, continue with the test
      await testConnection(context); 
    }
    return;
  }
  
  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Testing Home Assistant Connection",
      cancellable: false,
    },
    async (progress) => {
      progress.report({ increment: 0, message: "Connecting..." });
      
      try {
        const response = await fetch(`${hostUrl}/api/`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        progress.report({ increment: 50, message: "Validating response..." });
        
        if (response.ok) {
          const data: any = await response.json(); // Add type assertion to any
          if (data.message === "API running.") {
            progress.report({ increment: 100, message: "Connection successful!" });
            vscode.window.showInformationMessage(
              `Successfully connected to Home Assistant at ${hostUrl}. API is running.`
            );
          } else {
            progress.report({ increment: 100, message: "Connection failed." });
            vscode.window.showErrorMessage(
              `Connected to Home Assistant at ${hostUrl}, but API response was unexpected: ${data.message || "No message"}`
            );
          }
        } else {
          progress.report({ increment: 100, message: "Connection failed." });
          let errorMessage = `Failed to connect to Home Assistant at ${hostUrl}. Status: ${response.status} ${response.statusText}`;
          try {
            const errorBody: any = await response.json(); // Add type assertion to any
            if (errorBody && errorBody.message) {
              errorMessage += ` - ${errorBody.message}`;
            }
          } catch {
            // Ignore if error body is not JSON or doesn't have message
          }
          vscode.window.showErrorMessage(errorMessage);
        }
      } catch (error) {
        progress.report({ increment: 100, message: "Connection error." });
        vscode.window.showErrorMessage(
          `Error connecting to Home Assistant at ${hostUrl}: ${error.message}`
        );
      }
    }
  );
}

async function setInstanceUrl(context: vscode.ExtensionContext): Promise<void> {
  const currentUrl = await AuthManager.getUrl(context);
  
  const newUrl = await vscode.window.showInputBox({
    prompt: "Enter your Home Assistant instance URL",
    placeHolder: "http://homeassistant.local:8123",
    value: currentUrl || "http://homeassistant.local:8123", // Pre-fill default if currentUrl is empty
    validateInput: (input) => {
      // Basic URL validation
      try {
        if (!input) {
          return "Home Assistant instance URL is required";
        }
        
        const url = new URL(input);
        if (!url.protocol.startsWith("http")) {
          return "URL must start with http:// or https://";
        }
        
        return null; // Valid input
      } catch {
        return "Please enter a valid URL (e.g., http://homeassistant.local:8123)";
      }
    }
  });
  
  if (newUrl && newUrl !== currentUrl) {
    try {
      await AuthManager.storeUrl(context, newUrl);
      // Remove from settings if it exists
      const config = vscode.workspace.getConfiguration("vscode-home-assistant");
      if (config.get("hostUrl") !== undefined) {
        await config.update("hostUrl", undefined, vscode.ConfigurationTarget.Global);
      }
      vscode.window.showInformationMessage(`Home Assistant instance URL has been securely stored: ${newUrl}`);
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to store Home Assistant instance URL: ${error.message}`);
    }
  } else if (!newUrl) {
    vscode.window.showWarningMessage("No Home Assistant instance URL was entered.");
  } else {
    vscode.window.showInformationMessage("Home Assistant instance URL is already up to date.");
  }
}

async function clearInstanceUrl(context: vscode.ExtensionContext): Promise<void> {
  const confirmation = await vscode.window.showWarningMessage(
    "Are you sure you want to clear the stored Home Assistant instance URL from SecretStorage? This will not affect URLs in workspace settings or environment variables.",
    { modal: true },
    "Yes"
  );

  if (confirmation === "Yes") {
    try {
      await AuthManager.deleteUrl(context);
      vscode.window.showInformationMessage("Home Assistant instance URL has been cleared from SecretStorage.");
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to clear Home Assistant instance URL: ${error.message}`);
    }
  }
}
