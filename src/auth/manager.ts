import * as vscode from "vscode";

/**
 * AuthManager class to handle Home Assistant tokens and Home Assistant instance URL securely using VS Code SecretStorage
 */
export class AuthManager {
  private static readonly TOKEN_KEY = "home-assistant.token";
  private static readonly URL_KEY = "home-assistant.url";

  /**
   * Get the stored token from SecretStorage or environment variables
   * @param context Extension context
   * @returns The stored token or undefined if not found
   */
  public static async getToken(context: vscode.ExtensionContext): Promise<string | undefined> {
    // First try to get token from SecretStorage
    const secretToken = await context.secrets.get(AuthManager.TOKEN_KEY);
    
    // If no secret token, check environment variables
    if (!secretToken) {
      const envToken = process.env.HASS_TOKEN || process.env.SUPERVISOR_TOKEN;
      if (envToken) {
        return envToken;
      }
    }
    
    return secretToken;
  }

  /**
   * Store a token in SecretStorage
   * @param context Extension context
   * @param token Token to store
   */
  public static async storeToken(context: vscode.ExtensionContext, token: string): Promise<void> {
    await context.secrets.store(AuthManager.TOKEN_KEY, token);
  }

  /**
   * Delete the stored token from SecretStorage
   * @param context Extension context
   */
  public static async deleteToken(context: vscode.ExtensionContext): Promise<void> {
    await context.secrets.delete(AuthManager.TOKEN_KEY);
  }
  
  /**
   * Get the stored URL from SecretStorage or environment variables
   * @param context Extension context
   * @returns The stored URL or undefined if not found
   */
  public static async getUrl(context: vscode.ExtensionContext): Promise<string | undefined> {
    // First try to get URL from SecretStorage
    const secretUrl = await context.secrets.get(AuthManager.URL_KEY);
    
    // If no secret URL, check environment variables
    if (!secretUrl) {
      const envUrl = process.env.HASS_SERVER || 
                    (process.env.SUPERVISOR_TOKEN ? "http://supervisor/core" : undefined);
      if (envUrl) {
        return envUrl;
      }
    }
    
    return secretUrl;
  }

  /**
   * Store a URL in SecretStorage
   * @param context Extension context
   * @param url URL to store
   */
  public static async storeUrl(context: vscode.ExtensionContext, url: string): Promise<void> {
    await context.secrets.store(AuthManager.URL_KEY, url);
  }

  /**
   * Delete the stored URL from SecretStorage
   * @param context Extension context
   */
  public static async deleteUrl(context: vscode.ExtensionContext): Promise<void> {
    await context.secrets.delete(AuthManager.URL_KEY);
  }

  /**
   * Check if both token and URL are stored in SecretStorage or environment variables.
   * @param context Extension context
   * @returns True if both token and URL are found, false otherwise.
   */
  public static async hasCredentials(context: vscode.ExtensionContext): Promise<boolean> {
    const token = await AuthManager.getToken(context);
    const url = await AuthManager.getUrl(context);
    return !!token && !!url;
  }

  /**
   * Migrate token from settings.json to SecretStorage
   * @param context Extension context
   * @returns true if a token was migrated, false otherwise
   */
  public static async migrateTokenFromSettings(context: vscode.ExtensionContext): Promise<boolean> {
    const config = vscode.workspace.getConfiguration("vscode-home-assistant");
    const token = config.get<string>("longLivedAccessToken");

    // If there's no token in settings, nothing to migrate
    if (!token) {
      return false;
    }

    try {
      // Store in SecretStorage
      await AuthManager.storeToken(context, token);

      // Clear from settings
      await config.update("longLivedAccessToken", undefined, vscode.ConfigurationTarget.Global);
      
      // Inform user
      vscode.window.showInformationMessage(
        "Your Home Assistant access token has been securely migrated to VS Code's SecretStorage. It is no longer stored in your settings.json file."
      );
      
      return true;
    } catch (error) {
      console.error("Failed to migrate token to SecretStorage:", error);
      return false;
    }
  }
  
  /**
   * Migrate Home Assistant instance URL from settings.json to SecretStorage
   * @param context Extension context
   * @returns true if a URL was migrated, false otherwise
   */
  public static async migrateUrlFromSettings(context: vscode.ExtensionContext): Promise<boolean> {
    const config = vscode.workspace.getConfiguration("vscode-home-assistant");
    const url = config.get<string>("hostUrl");

    // If there's no URL in settings, nothing to migrate
    if (!url) {
      return false;
    }

    try {
      // Store in SecretStorage
      await AuthManager.storeUrl(context, url);

      // Clear from settings
      await config.update("hostUrl", undefined, vscode.ConfigurationTarget.Global);
      
      // Inform user
      vscode.window.showInformationMessage(
        "Your Home Assistant instance URL has been securely migrated to VS Code's SecretStorage. It is no longer stored in your settings.json file."
      );
      
      return true;
    } catch (error) {
      console.error("Failed to migrate URL to SecretStorage:", error);
      return false;
    }
  }

  /**
   * Get token UI helper that tries to get token from SecretStorage first, then falls back to settings.json
   * Also validates Home Assistant instance URL is set
   * @param context Extension context
   * @returns The token or undefined if not found
   */
  public static async getTokenWithUI(context: vscode.ExtensionContext): Promise<string | undefined> {
    // Check if Home Assistant instance URL is configured in SecretStorage first
    let hostUrl = await AuthManager.getUrl(context);
    
    // If not in SecretStorage, check settings and environment
    if (!hostUrl) {
      const config = vscode.workspace.getConfiguration("vscode-home-assistant");
      hostUrl = config.get<string>("hostUrl") || process.env.HASS_SERVER || 
        (process.env.SUPERVISOR_TOKEN ? "http://supervisor/core" : "");
      
      // If found in settings, migrate it
      if (config.get<string>("hostUrl")) {
        await AuthManager.migrateUrlFromSettings(context);
      }
    }
    
    // If no URL is configured, ask for it
    if (!hostUrl) {
      hostUrl = await vscode.window.showInputBox({
        prompt: "Enter your Home Assistant instance URL",
        placeHolder: "http://homeassistant.local:8123",
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
      
      // User canceled the Home Assistant instance URL input
      if (!hostUrl) {
        return undefined;
      }
      
      // Store URL in SecretStorage
      await AuthManager.storeUrl(context, hostUrl);
      vscode.window.showInformationMessage(`Home Assistant instance URL set to: ${hostUrl}`);
    }
    
    // Try to get token from SecretStorage first
    let token = await AuthManager.getToken(context);
    
    // If not found in SecretStorage, check environment variables
    if (!token) {
      token = process.env.HASS_TOKEN || process.env.SUPERVISOR_TOKEN;
    }
    
    // If not found in SecretStorage or environment, try from settings
    if (!token) {
      const config = vscode.workspace.getConfiguration("vscode-home-assistant");
      token = config.get<string>("longLivedAccessToken");
      
      // If found in settings, migrate it
      if (token) {
        await AuthManager.migrateTokenFromSettings(context);
      }
    }
    
    // If still no token, prompt user to enter one
    if (!token) {
      token = await vscode.window.showInputBox({
        prompt: "Enter your Home Assistant Long-Lived Access Token",
        password: true,
        placeHolder: "eyJhbGci..."
      });
      
      if (token) {
        await AuthManager.storeToken(context, token);
      }
    }
    
    return token;
  }
}
