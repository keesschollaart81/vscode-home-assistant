import { DidChangeConfigurationParams } from "vscode-languageserver";

export interface IConfigurationService {
    isConfigured: boolean;
    token?: string;
    url?: string;
    ignoreCertificates: boolean;
    updateConfiguration(config: DidChangeConfigurationParams): void;
}

export interface HomeAssistantConfiguration {
    longLivedAccessToken?: string;
    hostUrl?: string;
    ignoreCertificates: boolean;
}

export class ConfigurationService implements IConfigurationService {
    public isConfigured: boolean = false;
    public token?: string;
    public url?: string;
    public ignoreCertificates: boolean = false;

    public updateConfiguration = (config: DidChangeConfigurationParams): void => {
        var incoming = <HomeAssistantConfiguration>config.settings["vscode-home-assistant"];
       
        this.token = incoming.longLivedAccessToken;
        this.url = incoming.hostUrl;
        this.ignoreCertificates = !!incoming.ignoreCertificates;

        this.isConfigured = true;
    }
}
