import * as vscode from "vscode";

export class Config {
 
    private url: string | undefined;
    private token: string | undefined;
 
    public haUrl(): string | undefined {
        if (!this.url) {
            var config = vscode.workspace.getConfiguration("vscode-home-assistant");
            let haUrlViaConfig = config.get<string>("hostUrl");
            if (!haUrlViaConfig && process.env.HASS_SERVER) {
                console.log("Reading HA URL from Environment Variables");
                this.url = process.env.HASS_SERVER;
            }
            else {
                console.log("Reading HA URL from settings");
                this.url = haUrlViaConfig;
            }
        }
        return this.url;
    }

    public haToken(): string | undefined {
        if (!this.token) {
            var config = vscode.workspace.getConfiguration("vscode-home-assistant");
            let haTokenViaConfig = config.get<string>("longLivedAccessToken");
            if (!haTokenViaConfig && process.env.HASS_TOKEN) {
                console.log("Reading HA Token from Environment Variables");
                this.token = process.env.HASS_TOKEN;
            }
            else {
                console.log("Reading HA Token from settings");
                this.token = haTokenViaConfig;
            }
        }
        return this.token;
    }

    public reset(): any {
        this.url = undefined;
        this.token = undefined;
    }

    public async hasConfigOrAsk(): Promise<boolean> {

        if (this.haUrl && this.haToken) {
            return true;
        }

        var optionClicked = await vscode.window.showInformationMessage(
            "Update your settings to integrate with Home Assistant",
            "Now",
            "Later");

        if (!optionClicked || optionClicked === "Later") {
            return false;
        }

        var url = await vscode.window.showInputBox(<vscode.InputBoxOptions>{
            prompt: "Enter your Home Assistant (base) URL",
            placeHolder: "https://your.homeassistant.com:8123",
            ignoreFocusOut: true
        });
        if (!url) {
            return false;
        }

        var token = await vscode.window.showInputBox(<vscode.InputBoxOptions>{
            prompt: "Enter a Home Assistant 'Long-Lived Access Token', create one on your user/profile page in HA.",
            password: true,
            ignoreFocusOut: true
        });
        if (!token) {
            return false;
        }

        let config = vscode.workspace.getConfiguration("vscode-home-assistant");
        await config.update("hostUrl", url, true);
        await config.update("longLivedAccessToken", token, true);

        return true;
    }
}
