import { DidChangeConfigurationParams } from "vscode-languageserver-protocol";
import * as vscodeUri from "vscode-uri";

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
  public isConfigured = false;

  public token?: string;

  public url?: string;

  public ignoreCertificates = false;

  constructor() {
    this.setConfigViaEnvironmentVariables();

    this.isConfigured = `${this.url}` !== "";
  }

  public updateConfiguration = (config: DidChangeConfigurationParams): void => {
    const incoming = <HomeAssistantConfiguration>(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      config.settings["vscode-home-assistant"]
    );

    this.token = incoming.longLivedAccessToken;
    if (incoming.hostUrl !== undefined) {
      this.url = this.getUri(incoming.hostUrl);
    }
    this.ignoreCertificates = !!incoming.ignoreCertificates;

    this.setConfigViaEnvironmentVariables();

    this.isConfigured = `${this.url}` !== "";
  };

  private setConfigViaEnvironmentVariables() {
    if (!this.url && process.env.HASS_SERVER) {
      this.url = this.getUri(process.env.HASS_SERVER);
    }
    if (!this.token && process.env.HASS_TOKEN) {
      this.token = process.env.HASS_TOKEN;
    }
    if (!this.url && !this.token && process.env.SUPERVISOR_TOKEN) {
      this.url = this.getUri("http://supervisor/core");
      this.token = process.env.SUPERVISOR_TOKEN;
    }
  }

  private getUri = (value: string): string => {
    if (!value) {
      return "";
    }
    const uri = vscodeUri.URI.parse(value);
    return `${uri.scheme}://${uri.authority}${uri.path.replace(/\/$/, "")}`;
  };
}
