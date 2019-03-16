import * as vscode from "vscode"; 

export const config = {
    get all() {
        return vscode.workspace.getConfiguration("vscode-home-assistant");
    },
    get haUrl() {
        return config.all.get<string>("ha-url") || "https://localhost:8123";
    },
    get haToken() {
        return config.all.get<string>("ha-token");
    }
};