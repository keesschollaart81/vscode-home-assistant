import { HomeAssistantRoot } from "./homeassistant";
import {
  DeviceClasses,
  IncludeNamed,
  UnitSystem,
  Secret,
  TimeZone,
} from "./types";

export interface Core {
  auth_mfa_modules?: Array<any> | IncludeNamed; // TODO: Extract similar as in integrations
  auth_providers?: AuthProviders[] | IncludeNamed; // TODO: Extract similar as in integrations

  /**
   * Customize entities.
   * https://www.home-assistant.io/docs/configuration/customizing-devices/
   */
  customize?: CoreCustomize | IncludeNamed;

  /**
   * Customize all entities of a given domain.
   * https://www.home-assistant.io/docs/configuration/customizing-devices/
   */
  customize_domain?: CoreCustomize | IncludeNamed;

  /**
   * Customize entities matching a pattern.
   * https://wwww.home-assistant.io/docs/configuration/customizing-devices/
   */
  customize_glob?: CoreCustomize | IncludeNamed;

  /**
   * Altitude above sea level in meters. Impacts weather/sunrise data.
   * https://www.home-assistant.io/docs/configuration/basic/#elevation
   *
   * @TJS-type integer
   */
  elevation?: number | Secret;

  /**
   * The URL that Home Assistant is available on from the internet. For example: https://example.duckdns.org:8123. Note that this setting may only contain a protocol, hostname and port; using a path is not supported.
   * https://www.home-assistant.io/docs/configuration/basic/#external_url
   */
  external_url?: string | Secret;

  /**
   * The URL that Home Assistant is available on from your local network. For example: http://homeassistant.local:8123. Note that this setting may only contain a protocol, hostname and port; using a path is not supported.
   * https://www.home-assistant.io/docs/configuration/basic/#internal_url
   */
  internal_url?: string | Secret;

  /**
   * Latitude of your location required to calculate the time the sun rises and sets.
   * https://www.home-assistant.io/docs/configuration/basic/#latitude
   *
   * @minimum -90
   * @maximum 90
   */
  latitude?: number | Secret;

  /**
   * Longitude of your location required to calculate the time the sun rises and sets.
   * https://www.home-assistant.io/docs/configuration/basic/#longitude
   *
   * @minimum -180
   * @maximum 180
   */
  longitude?: number | Secret;

  /**
   * Name of the location where Home Assistant is running.
   * https://www.home-assistant.io/docs/configuration/basic/#name
   */
  name?: string | Secret;

  /**
   * Packages in Home Assistant provide a way to bundle different component’s configuration together. It allows for "splitting" your configuration.
   * https://www.home-assistant.io/docs/configuration/packages/
   */
  packages?: Array<HomeAssistantRoot> | IncludeNamed;

  /**
   * Pick your time zone from the column TZ of Wikipedia’s list of tz database time
   * https://www.home-assistant.io/docs/configuration/basic/#time_zone
   * https://www.wikiwand.com/en/List_of_tz_database_time_zones
   */
  time_zone?: TimeZone | Secret;

  /**
   * "metric" for Metric, "imperial" for Imperial.
   * This also sets temperature unit Home Assistant will use.
   * https://www.home-assistant.io/docs/configuration/basic/#unit_system
   */
  unit_system?: UnitSystem | Secret;

  /**
   * List of folders that can be used as sources for sending files.
   * https://www.home-assistant.io/docs/configuration/basic/#whitelist_external_dirs
   */
  whitelist_external_dirs?: string[] | Secret;
}

export interface CoreCustomize {
  [key: string]: CoreCustomizeItem | IncludeNamed;
}

/**
 * @TJS-additionalProperties true
 */
interface CoreCustomizeItem {
  /**
   * For switches with an assumed state two buttons are shown (turn off, turn on) instead of a switch.
   * https://www.home-assistant.io/docs/configuration/customizing-devices/#assumed_state
   */
  assumed_state?: boolean;

  /**
   * Sets the class of the device, changing the device state and icon that is displayed on the UI (see below).
   * Please note: It does not set the unit_of_measurement.
   * https://www.home-assistant.io/docs/configuration/customizing-devices/#device_class
   */
  device_class?: DeviceClasses;

  /**
   * URL to use as picture for entity.
   * https://www.home-assistant.io/docs/configuration/customizing-devices/#entity_picture
   */
  entity_picture?: string;

  /**
   * Name of the entity as displayed in the UI.
   * Please note that most of the time you can just rename the entity in the UI itself.
   * https://www.home-assistant.io/docs/configuration/customizing-devices/#friendly_name
   */
  friendly_name?: string;

  /**
   * Any icon from MaterialDesignIcons.com. Prefix name with mdi:. For example: mdi:home.
   * Please note that most of the time you can just change the entity icon in the UI itself.
   * https://www.home-assistant.io/docs/configuration/customizing-devices/#icon
   */
  icon?: string;

  /**
   * Sets the initial state for automations, on (true) or off (false).
   * https://www.home-assistant.io/docs/configuration/customizing-devices/#initial_state
   */
  initial_state?: boolean;

  /**
   * Defines the units of measurement, if any. This will also influence the graphical presentation in the history visualization as continuous value. Sensors with missing unit_of_measurement are showing as discrete values.
   * https://wwww.home-assistant.io/docs/configuration/customizing-devices/#unit_of_measurement
   */
  unit_of_measurement?: string;
}

/**
 * TODO: Definitions below need to be extracted in a similar fashion as integrations.
 */
export type AuthProviders =
  | HomeAssistantAuthProvider
  | TrustedNetworksAuthProvider
  | CommandLineAuthProvider
  | LegacyApiPasswordAuthProvider;

export interface HomeAssistantAuthProvider {
  type: "homeassistant";
}
export interface TrustedNetworksAuthProvider {
  type: "trusted_networks";
  trusted_networks: string | string[] | any[];
  trusted_users?: {
    [key: string]: string | Array<string | { [key: string]: string }>;
  };
  allow_bypass_login?: boolean;
}
export interface CommandLineAuthProvider {
  type: "command_line";
  command: string;
  args?: any;
  meta?: boolean;
}
export interface LegacyApiPasswordAuthProvider {
  type: "legacy_api_password";
  api_password: string;
}
