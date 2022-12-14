/**
 * Cloud integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/cloud/__init__.py
 */
import { Domains, Entities, IncludeNamed } from "../../types";

export type Domain = "cloud";

export interface Schema {
  /**
   * This option is for development, you do not need it in general.
   */
  account_link_url?: string;

  /**
   * This option is for development, you do not need it in general.
   */
  acme_directory_server?: string;

  /**
   * This option is for development, you do not need it in general.
   */
  alexa_access_token_url?: string;

  /**
   * Configure the Amazon Alexa integration.
   * https://www.nabucasa.com/config/amazon_alexa/
   */
  alexa?: {
    /**
     * Filters for entities to include/exclude from Alexa.
     * https://www.nabucasa.com/config/amazon_alexa/
     */
    filter?: Filter;

    /**
     * Entity specific configuration for Alexa.
     * https://www.nabucasa.com/config/amazon_alexa/
     */
    entity_config?: { [key: string]: AlexaEntity } | IncludeNamed;
  };

  /**
   * This option is for development, you do not need it in general.
   */
  cloudhook_create_url?: string;

  /**
   * This option is for development, you do not need it in general.
   */
  cognito_client_id?: string;

  /**
   * This option is for development, you do not need it in general.
   */
  google_actions_report_state_url?: string;

  /**
   * The Google Assistant integration allows users to control the entities via the Home Assistant Smart Home skill for Google Assistant.
   * https://www.nabucasa.com/config/google_assistant/
   */
  google_actions?: {
    /**
     * Filters for entities to include/exclude from Google Assistant.
     * https://www.nabucasa.com/config/google_assistant/
     */
    filter?: Filter;

    /**
     * Entity specific configuration for Google Assistant.
     * https://www.nabucasa.com/config/google_assistant/
     */
    entity_config?: { [key: string]: GoogleEntity } | IncludeNamed;
  };

  /**
   * This option is for development, you do not need it in general.
   */
  mode?: "production" | "development";

  /**
   * This option is for development, you do not need it in general.
   */
  region?: string;

  /**
   * This option is for development, you do not need it in general.
   */
  relayer?: string;

  /**
   * This option is for development, you do not need it in general.
   */
  remote_api_url?: string;

  /**
   * This option is for development, you do not need it in general.
   */
  subscription_info_url?: string;

  /**
   * This option is for development, you do not need it in general.
   */
  user_pool_id?: string;

  /**
   * This option is for development, you do not need it in general.
   */
  voice_api_url?: string;
}

interface Filter {
  /**
   * The list of domains to be excluded.
   */
  exclude_domains?: Domains;

  /**
   * The list of entity ids to be excluded,
   */
  exclude_entities?: Entities;

  /**
   * Exclude all entities matching a listed pattern (e.g., switch.garage_*).
   */
  exclude_entity_globs?: string[];

  /**
   * The list of domains to be included.
   */
  include_domains?: Domains;

  /**
   * The list of entity ids to be included.
   */
  include_entities?: Entities;

  /**
   * Include all entities matching a listed pattern (e.g., light.living_room_*).
   */
  include_entity_globs?: string[];
}

interface AlexaEntity {
  /**
   * Description of entity to show in Alexa.
   */
  description?: string;

  /**
   * The display category to use in Alexa.
   * Available categories: https://developer.amazon.com/en-US/docs/alexa/device-apis/alexa-discovery.html#display-categories
   */
  display_categories?:
    | "ACTIVITY_TRIGGER"
    | "AIR_CONDITIONER"
    | "AIR_FRESHENER"
    | "AIR_PURIFIER"
    | "AUTO_ACCESSORY"
    | "BLUETOOTH_SPEAKER"
    | "CAMERA"
    | "CHRISTMAS_TREE"
    | "COFFEE_MAKER"
    | "COMPUTER"
    | "CONTACT_SENSOR"
    | "DISHWASHER"
    | "DOOR"
    | "DOORBELL"
    | "DRYER"
    | "EXTERIOR_BLIND"
    | "FAN"
    | "GAME_CONSOLE"
    | "GARAGE_DOOR"
    | "HEADPHONES"
    | "HUB"
    | "INTERIOR_BLIND"
    | "LAPTOP"
    | "LIGHT"
    | "MICROWAVE"
    | "MOBILE_PHONE"
    | "MOTION_SENSOR"
    | "MUSIC_SYSTEM"
    | "NETWORK_HARDWARE"
    | "OTHER"
    | "OVEN"
    | "PHONE"
    | "PRINTER"
    | "ROUTER"
    | "SCENE_TRIGGER"
    | "SCREEN"
    | "SECURITY_PANEL"
    | "SECURITY_SYSTEM"
    | "SLOW_COOKER"
    | "SMARTLOCK"
    | "SMARTPLUG"
    | "SPEAKER"
    | "STREAMING_DEVICE"
    | "SWITCH"
    | "TABLET"
    | "TEMPERATURE_SENSOR"
    | "THERMOSTAT"
    | "TV"
    | "VACUUM_CLEANER"
    | "VEHICLE"
    | "WASHER"
    | "WATER_HEATER"
    | "WEARABLE";

  /**
   * Name of entity to show in Alexa.
   */
  name?: string;
}

interface GoogleEntity {
  /**
   * Aliases that can also be used to refer to this entity.
   */
  aliases?: string | string[];

  /**
   * Name of entity to show in Google Assistant.
   */
  name?: string;

  /**
   * Hint for Google Assistant in which room this entity is.
   */
  room?: string;
}
