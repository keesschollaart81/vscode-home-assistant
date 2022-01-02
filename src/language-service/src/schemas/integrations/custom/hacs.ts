/**
 * Home Assistant Community Store
 * https://hacs.xyz/
 * Source: https://github.com/hacs/integration/blob/1.1.2/custom_components/hacs/configuration_schema.py
 */
export type Domain = "hacs";
export interface Schema {
  /**
   * Github Personal Access Token.
   * https://hacs.xyz/docs/configuration/legacy
   *
   * @TJS-pattern ^[0-9a-zA-Z_]{40}$
   */
  token: string;

  /**
   * Enable tracking of AppDaemon apps.
   * https://hacs.xyz/docs/configuration/legacy
   */
  appdaemon?: boolean;

  /**
   * Enable hacs debug mode.
   * https://hacs.xyz/docs/configuration/legacy
   */
  debug?: boolean;

  /**
   * Boolean to enable experimental features.
   * https://hacs.xyz/docs/configuration/legacy
   */
  experimental?: boolean;

  /**
   * Development option to point to the development repository of the frontend.
   */
  frontend_repo_url?: string;

  /**
   * Development option to point to the development repository of the frontend.
   */
  frontend_repo?: string;

  /**
   * Enable tracking of NetDaemon apps.
   * https://hacs.xyz/docs/configuration/legacy
   */
  netdaemon?: boolean;

  /**
   * Number of releases to show in the version selector.
   * https://hacs.xyz/docs/configuration/legacy
   *
   * @TSJ-type integer
   */
  release_limit?: number;

  /**
   * The icon used for the sidepanel link.
   * https://hacs.xyz/docs/configuration/legacy
   */
  sidepanel_icon?: string;

  /**
   * he name used for the sidepanel link.
   * https://hacs.xyz/docs/configuration/legacy
   */
  sidepanel_title?: string;
}
