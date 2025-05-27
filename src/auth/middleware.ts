import { MessageConnection } from "vscode-jsonrpc";
import {
  ConfigurationRequest,
  DidChangeConfigurationNotification,
  DidChangeConfigurationParams,
} from "vscode-languageserver-protocol";
import * as vscode from "vscode";
import { AuthManager } from "./manager";

/**
 * Middleware to intercept configuration requests and inject token and URL from SecretStorage
 */
export class AuthMiddleware {
  private static outputChannel: vscode.OutputChannel;
  private constructor(private readonly context: vscode.ExtensionContext) {}

  /**
   * Get or create debug output channel
   */
  private static getOutputChannel(): vscode.OutputChannel {
    if (!AuthMiddleware.outputChannel) {
      AuthMiddleware.outputChannel = vscode.window.createOutputChannel("Home Assistant Auth");
    }
    return AuthMiddleware.outputChannel;
  }

  /**
   * Log a debug message with timestamp
   */
  private static log(message: string): void {
    const timestamp = new Date().toISOString().replace("T", " ").replace(/\..+/, "");
    const formattedMessage = `[${timestamp}] ${message}`;
    console.log(formattedMessage);
    AuthMiddleware.getOutputChannel().appendLine(formattedMessage);
  }

  /**
   * Install the auth middleware on a language client connection
   * @param context Extension context
   * @param connection The client's message connection
   */
  public static async install(
    context: vscode.ExtensionContext,
    connection: MessageConnection
  ): Promise<void> {
    const middleware = new AuthMiddleware(context);
    
    AuthMiddleware.log("Installing auth middleware on connection");
    
    // Override the original request handler
    const originalSendRequest = connection.sendRequest;
    connection.sendRequest = async function(type: any, ...params: any[]): Promise<any> {
      const typeStr = typeof type === "string" ? type : type?.method || String(type);
      AuthMiddleware.log(`Sending request type: ${typeStr}`);
      
      if (type === ConfigurationRequest.type) {
        return middleware.handleConfigurationRequest(
          originalSendRequest.bind(connection),
          type,
          ...params
        );
      }
      
      return originalSendRequest.apply(connection, [type, ...params]);
    };
    
    // Override the original notification handler
    const originalSendNotification = connection.sendNotification;
    connection.sendNotification = async function(type: any, ...params: any[]): Promise<void> {
      const typeStr = typeof type === "string" ? type : type?.method || String(type);
      AuthMiddleware.log(`Sending notification type: ${typeStr}`);
      
      if (type === DidChangeConfigurationNotification.type) {
        return middleware.handleDidChangeConfigurationNotification(
          originalSendNotification.bind(connection),
          type,
          ...params
        );
      }
      
      return originalSendNotification.apply(connection, [type, ...params]);
    };
    
    AuthMiddleware.log("Auth middleware successfully installed");
    
    // Immediately send configuration update with the token and URL
    await middleware.sendInitialConfiguration(connection);
  }
  
  /**
   * Send initial configuration with token and URL to ensure it's available immediately
   */
  private async sendInitialConfiguration(connection: MessageConnection): Promise<void> {
    try {
      AuthMiddleware.log("Sending initial configuration with token and URL");
      
      // Get token from multiple sources
      const secretToken = await AuthManager.getToken(this.context);
      const envToken = process.env.HASS_TOKEN || process.env.SUPERVISOR_TOKEN;
      
      const config = vscode.workspace.getConfiguration("vscode-home-assistant");
      const settingsToken = config.get<string>("longLivedAccessToken");
      
      const token = secretToken || envToken || settingsToken;
      
      if (!token) {
        AuthMiddleware.log("No token available for initial configuration");
        return;
      }
      
      // Get URL from SecretStorage first, then fallback to other sources
      const secretUrl = await AuthManager.getUrl(this.context);
      const settingsUrl = config.get<string>("hostUrl");
      const envUrl = process.env.HASS_SERVER || 
        (process.env.SUPERVISOR_TOKEN ? "http://supervisor/core" : "");
      
      const hostUrl = secretUrl || settingsUrl || envUrl;
      
      if (!hostUrl) {
        AuthMiddleware.log("No server URL available for initial configuration");
        return;
      }
        
      // Create configuration object
      const settings = {
        "vscode-home-assistant": {
          longLivedAccessToken: token,
          hostUrl: hostUrl,
          ignoreCertificates: config.get<boolean>("ignoreCertificates") || false,
          // Adding a timestamp to ensure the configuration is seen as "new" by the server
          configTimestamp: Date.now()
        }
      };
      
      // Send configuration notification
      AuthMiddleware.log(`Sending initial configuration with token (length: ${token.length}, first 5 chars: ${token.substring(0, 5)}...) and URL (${hostUrl})`);
      
      // Create notification params
      const params: DidChangeConfigurationParams = {
        settings: settings
      };
      
      // Send notification
      await connection.sendNotification(DidChangeConfigurationNotification.type, params);
      AuthMiddleware.log("Initial configuration with token and URL sent");
      
      // Wait a bit and send again to ensure it's received after server is fully initialized
      setTimeout(async () => {
        try {
          AuthMiddleware.log("Sending follow-up configuration to ensure token and URL are set");
          settings["vscode-home-assistant"].configTimestamp = Date.now();
          await connection.sendNotification(DidChangeConfigurationNotification.type, { settings });
          AuthMiddleware.log("Follow-up configuration with token and URL sent");
        } catch (followupError) {
          AuthMiddleware.log(`Error sending follow-up configuration: ${followupError.message}`);
        }
      }, 2000);
    } catch (error) {
      AuthMiddleware.log(`Error sending initial configuration: ${error.message}`);
    }
  }
  
  /**
   * Handle configuration request and inject token and URL from SecretStorage
   */
  private async handleConfigurationRequest(
    originalSendRequest: (type: any, ...params: any[]) => Promise<any>,
    type: any,
    ...params: any[]
  ): Promise<any> {
    AuthMiddleware.log("Handling configuration request");
    const result = await originalSendRequest(type, ...params);

    if (Array.isArray(result)) {
      for (const item of result) {
        if (item && typeof item === "object" && "vscode-home-assistant" in item) {
          const secretToken = await AuthManager.getToken(this.context);
          const envToken = process.env.HASS_TOKEN || process.env.SUPERVISOR_TOKEN;
          const config = vscode.workspace.getConfiguration("vscode-home-assistant");
          const settingsToken = config.get<string>("longLivedAccessToken");
          const token = secretToken || envToken || settingsToken;

          const secretUrl = await AuthManager.getUrl(this.context);
          const settingsUrl = config.get<string>("hostUrl");
          const envUrl = process.env.HASS_SERVER ||
            (process.env.SUPERVISOR_TOKEN ? "http://supervisor/core" : null);
          const url = secretUrl || settingsUrl || envUrl;

          if (!item["vscode-home-assistant"]) {
            item["vscode-home-assistant"] = {};
          }

          if (token) {
            AuthMiddleware.log(`Injecting token (length: ${token.length}, first 5 chars: ${token.substring(0, 5)}...) into configuration`);
            item["vscode-home-assistant"].longLivedAccessToken = token;

            AuthMiddleware.log("Token injection verification: " +
              (item["vscode-home-assistant"].longLivedAccessToken === token ?
                "SUCCESS" : "FAILED"));

            const obscuredToken = token.length <= 10
              ? "***"
              : `${token.substring(0, 5)}...${token.substring(token.length - 5)}`;
            AuthMiddleware.log(`Using token (obscured): ${obscuredToken}`);

            if (!secretToken && (settingsToken || envToken)) {
              AuthMiddleware.log("Token was found in settings or environment but not in SecretStorage, attempting migration");
              try {
                await AuthManager.storeToken(this.context, token);
                if (settingsToken) {
                  await config.update("longLivedAccessToken", undefined, vscode.ConfigurationTarget.Global);
                  AuthMiddleware.log("Successfully migrated token from settings.json to SecretStorage");
                } else {
                  AuthMiddleware.log("Using environment token, copied to SecretStorage for future use");
                }
              } catch (error) {
                AuthMiddleware.log(`Failed to migrate token to SecretStorage: ${error.message}`);
              }
            }
          } else {
            AuthMiddleware.log("WARNING: No token found in SecretStorage, environment, or settings for configuration item");
          }

          if (url) {
            AuthMiddleware.log(`Injecting URL (${url}) into configuration`);
            item["vscode-home-assistant"].hostUrl = url;

            // Migrate URL if found in settings but not SecretStorage (mirroring DidChangeConfigurationNotification)
            if (!secretUrl && settingsUrl) {
              AuthMiddleware.log("URL was found in settings (request) but not in SecretStorage, attempting migration");
              try {
                await AuthManager.storeUrl(this.context, url);
                await config.update("hostUrl", undefined, vscode.ConfigurationTarget.Global);
                AuthMiddleware.log("Successfully migrated URL from settings.json (request) to SecretStorage");
              } catch (error) {
                AuthMiddleware.log(`Failed to migrate URL to SecretStorage (request): ${error.message}`);
              }
            }
          }

          // Fallback URL injection if still not set (original logic)
          const currentSettingsUrlFallback = config.get<string>("hostUrl"); // Re-fetch as it might have been cleared by migration
          const currentEnvUrlFallback = process.env.HASS_SERVER ||
              (process.env.SUPERVISOR_TOKEN ? "http://supervisor/core" : "");
          const fallbackUrl = currentSettingsUrlFallback || currentEnvUrlFallback;

          if (fallbackUrl && !item["vscode-home-assistant"].hostUrl) {
            item["vscode-home-assistant"].hostUrl = fallbackUrl;
            AuthMiddleware.log(`Also injected fallback URL: ${fallbackUrl}`);
          }
        }
      }
    }
    return result;
  }
  
  /**
   * Handle configuration notification and inject token and URL from SecretStorage
   */
  private async handleDidChangeConfigurationNotification(
    originalSendNotification: (type: any, ...params: any[]) => Promise<void>,
    type: any,
    ...params: any[]
  ): Promise<void> {
    AuthMiddleware.log("Handling configuration notification");
    
    if (params.length > 0) {
      const notification = params[0] as DidChangeConfigurationParams;
      if (notification && notification.settings) {
        // Ensure the vscode-home-assistant settings object exists
        if (!notification.settings["vscode-home-assistant"]) {
          notification.settings["vscode-home-assistant"] = {};
          AuthMiddleware.log("Created missing vscode-home-assistant settings object in notification");
        }
        
        // Try to get token from multiple sources
        const secretToken = await AuthManager.getToken(this.context);
        const envToken = process.env.HASS_TOKEN || process.env.SUPERVISOR_TOKEN;
        
        const config = vscode.workspace.getConfiguration("vscode-home-assistant");
        const settingsToken = config.get<string>("longLivedAccessToken");
        
        const token = secretToken || envToken || settingsToken;
        
        // Try to get URL from SecretStorage first, then fallback to settings
        const secretUrl = await AuthManager.getUrl(this.context);
        const settingsUrl = config.get<string>("hostUrl");
        const envUrl = process.env.HASS_SERVER || 
          (process.env.SUPERVISOR_TOKEN ? "http://supervisor/core" : undefined);
        
        const url = secretUrl || settingsUrl || envUrl;
        
        // Inject token if available
        if (token) {
          AuthMiddleware.log(`Injecting token (length: ${token.length}) into notification`);
          notification.settings["vscode-home-assistant"].longLivedAccessToken = token;
          
          // Inject URL if available
          if (url) {
            AuthMiddleware.log(`Injecting URL (${url}) into notification`);
            notification.settings["vscode-home-assistant"].hostUrl = url;
            
            // If URL was found in settings but not in SecretStorage, migrate it
            if (!secretUrl && settingsUrl) {
              AuthMiddleware.log("URL was found in settings but not in SecretStorage, attempting migration");
              try {
                await AuthManager.storeUrl(this.context, url);
                await config.update("hostUrl", undefined, vscode.ConfigurationTarget.Global);
                AuthMiddleware.log("Successfully migrated URL from settings.json to SecretStorage");
              } catch (error) {
                AuthMiddleware.log(`Failed to migrate URL to SecretStorage: ${error.message}`);
              }
            }
          }
          
          // If the token was from settings.json or environment, migrate it to SecretStorage
          if (!secretToken && (settingsToken || envToken)) {
            AuthMiddleware.log("Token was found in settings or environment but not in SecretStorage, attempting migration");
            try {
              await AuthManager.storeToken(this.context, token);
              if (settingsToken) {
                await config.update("longLivedAccessToken", undefined, vscode.ConfigurationTarget.Global);
                AuthMiddleware.log("Successfully migrated token from settings.json to SecretStorage");
              } else {
                AuthMiddleware.log("Using environment token, copied to SecretStorage for future use");
              }
            } catch (error) {
              AuthMiddleware.log(`Failed to migrate token to SecretStorage: ${error.message}`);
            }
          }
        } else {
          AuthMiddleware.log("WARNING: No token found in SecretStorage, environment, or settings for notification");
        }
      }
    }
    
    return originalSendNotification(type, ...params);
  }
}
