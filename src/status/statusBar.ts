import * as vscode from "vscode";
import { AuthManager } from "../auth/manager";
import { testHomeAssistantConnection } from "../auth/debug";

/**
 * Status bar item for showing Home Assistant connection status
 * Shows the connected instance name, or "Connect" if no connection is available
 */
export class HomeAssistantStatusBar {
  private statusBarItem: vscode.StatusBarItem;
  private instanceName: string | undefined;
  private context: vscode.ExtensionContext;
  private checkInProgress = false;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    
    // Create status bar item with medium priority (closer to the right side)
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    
    // Set command to be executed when clicking the status bar item
    this.statusBarItem.command = "vscode-home-assistant.manageAuth";
    
    // Set initial status
    this.updateStatus("disconnected");
    this.statusBarItem.show();
    
    // Register the status bar item to be disposed when the extension is deactivated
    context.subscriptions.push(this.statusBarItem);
  }

  /**
   * Set the status directly based on server notification
   */
  public setConnectionStatus(status: "connected" | "error", instanceInfo?: { name?: string }): void {
    if (status === "connected" && instanceInfo?.name) {
      this.instanceName = instanceInfo.name;
    }
    this.updateStatus(status);
  }

  /**
   * Check the connection status and update the status bar accordingly
   * Should be called on startup and when authentication changes
   */
  public async checkConnectionStatus(): Promise<void> {
    // Prevent multiple simultaneous checks
    if (this.checkInProgress) {
      return;
    }

    try {
      this.checkInProgress = true;
      
      // Get token and URL from SecretStorage
      const token = await AuthManager.getToken(this.context);
      const url = await AuthManager.getUrl(this.context);
      
      // If token or URL is missing, show disconnected status
      if (!token || !url) {
        this.updateStatus("disconnected");
        return;
      }

      // Get config to check if we should ignore certificates
      const config = vscode.workspace.getConfiguration("vscode-home-assistant");
      const ignoreCertificates = !!config.get<boolean>("ignoreCertificates");
      
      // Test connection to Home Assistant
      const response = await testHomeAssistantConnection(url, token, ignoreCertificates);
      
      if (response.success) {
        // Extract instance name from connection response data if available
        let instanceName = "Home Assistant";
        if (response.data) {
          // Try to get instance name from different possible properties
          if (response.data.location_name) {
            instanceName = response.data.location_name;
          } else if (response.data.config?.location_name) {
            instanceName = response.data.config.location_name;
          }
          
          // Store instance name and version for display
          this.instanceName = instanceName;
        }
        
        this.updateStatus("connected");
      } else {
        this.updateStatus("error");
      }
    } catch (error) {
      console.error("Error checking Home Assistant connection status:", error);
      this.updateStatus("error");
    } finally {
      this.checkInProgress = false;
    }
  }

  /**
   * Open the Home Assistant instance in a browser
   */
  public async openInBrowser(): Promise<void> {
    try {
      const url = await AuthManager.getUrl(this.context);
      
      if (url) {
        // Open the URL in the user's default browser
        vscode.env.openExternal(vscode.Uri.parse(url));
      } else {
        vscode.window.showErrorMessage("Home Assistant URL is not configured. Please set it first.");
        // Show the authentication management dialog if URL is not set
        vscode.commands.executeCommand("vscode-home-assistant.manageAuth");
      }
    } catch (error) {
      console.error("Error opening Home Assistant in browser:", error);
      vscode.window.showErrorMessage(`Failed to open Home Assistant: ${error.message || "Unknown error"}`);
    }
  }

  /**
   * Update the status bar UI based on the connection status
   */
  private updateStatus(status: "connected" | "disconnected" | "error"): void {
    // Update the status bar UI without storing the status value
    switch (status) {
      case "connected":
        this.statusBarItem.text = `$(home) ${this.instanceName || "Connected"}`;
        this.statusBarItem.tooltip = "Click to open Home Assistant in browser";
        this.statusBarItem.command = "vscode-home-assistant.openInBrowser";
        break;
      case "disconnected":
        this.statusBarItem.text = "$(home) Connect";
        this.statusBarItem.tooltip = "Connect to Home Assistant";
        this.statusBarItem.command = "vscode-home-assistant.manageAuth";
        break;
      case "error":
        this.statusBarItem.text = "$(home) Error";
        this.statusBarItem.tooltip = "Error connecting to Home Assistant";
        this.statusBarItem.command = "vscode-home-assistant.manageAuth";
        break;
    }
  }

  /**
   * Dispose the status bar item
   */
  public dispose(): void {
    this.statusBarItem.dispose();
  }
}
