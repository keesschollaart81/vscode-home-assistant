import * as vscode from "vscode"; 

export const config = {
    get all() { 
        return vscode.workspace.getConfiguration("vscode-home-assistant");
    },
    get haUrl() {
        return config.all.get<string>("hostUrl");
    },
    get haToken() {
        return config.all.get<string>("longLivedAccessToken");
    },
    async hasConfigOrAsk(): Promise<boolean> {

        if (this.haUrl && this.haToken){
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
};

