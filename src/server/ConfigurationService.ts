import { DidChangeConfigurationParams } from "vscode-languageserver";

export interface IConfigurationService {
    isConfigured: boolean;
    token?: string;
    url?: string;
    ignoreCertificates: boolean;
    updateConfiguration(config: DidChangeConfigurationParams): void;
}
export interface HomeAssistantConfiguration {
    token?: string;
    url?: string;
    ignoreCertificates: boolean;
}

export class ConfigurationService implements IConfigurationService {
    public isConfigured: boolean = false;
    public token?: string;
    public url?: string;
    public ignoreCertificates: boolean = false;

    public updateConfiguration = (config: DidChangeConfigurationParams): void => {
        var incoming = <HomeAssistantConfiguration>config.settings;
        this.token = incoming.token;
        this.url = incoming.url;
        this.ignoreCertificates = !!incoming.ignoreCertificates;

        this.isConfigured = true;
    };

}
