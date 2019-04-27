import { Automations } from "./automation";
import { Sensors } from "./sensors";

/**
 * @TJS-additionalProperties true
 */
export interface HomeAssistantRoot{
    homeassistant?: HomeAssistantComponent | IncludeTags;
    automation?: Automations | IncludeTags;
    group?: GroupComponent | IncludeTags;
    http?: any;
    default_config?: any;
    person?: any;
    system_health?: any;
    panel_iframe?: PanelIframeComponent | IncludeTags;
    panel_custom?: any;
    updater?: any;
    discovery?: any;
    conversation?: any;
    history?: any;
    config?: any;
    logbook?: any;
    sun?: any;
    tts?: any;
    recorder?: any;
    sensor?: null | Array<Sensors> | IncludeTags;
    ifttt?: any;
    ios?: any;
    mqtt?: any;
    remote?: any;
}
 
export interface HomeAssistantComponent{
    name?: string;
    latitude?: string | number;
    longitude?: string | number;
    elevation?: string | number;
    unit_system?: "metric" | "imperial";
    time_zone?: string  ;
    whitelist_external_dirs?: string[];
    customize?: CustomizeComponent | IncludeTags;
    customize_domain?: any;
    customize_glob?: any;
    packages?: Array<HomeAssistantComponent> | IncludeTags;
    auth_providers: AuthProviders[];
}


/**
 * @TJS-type string
 * @TJS-pattern [.]yaml|[.]yml$
 */
export interface IncludeTag { }

/**
 * @TJS-type string
 */
export interface IncludeFolderTag { }

export type IncludeTags = IncludeTag | IncludeFolderTag;

/**
 * @TJS-type string
 * @TJS-pattern [.]yaml|[.]yml$
 */
export interface SecretTag { }


export interface PanelIframeComponent{
    [key: string]: PanelIframeComponentEntry;
}
export interface PanelIframeComponentEntry{
    title:string;
    url: string;
    icon?: string;
    require_admin?: boolean;
}
export interface CustomizeComponent{
    [key: string]: CustomizeComponentEntry;
}
export interface CustomizeComponentEntry{ 
    friendly_name?: string;
    homebridge_name?: string;
    hidden?: boolean;
    homebridge_hidden?: boolean;
    emulated_hue_hidden?: boolean;
    entity_picture?: string;
    icon?: string;
    assumed_state?: boolean;
    device_class?: string;
    unit_of_measurement?: string;
    initial_state?: boolean;
}
export interface GroupComponent{
    [key: string]: GroupComponentEntry | string[];
}
export interface GroupComponentEntry{ 
    name?: string; 
    view?: boolean; 
    icon?: string; 
    control?: string; 
    entities: string | string[]; 
    all?: boolean;  
}

export type AuthProviders = 
    HomeAssistantAuthProvider | 
    TrustedNetworksAuthProvider |
    CommandLineAuthProvider |
    LegacyApiPasswordAuthProvider;

export interface HomeAssistantAuthProvider{
    type: "homeassistant";
}
export interface TrustedNetworksAuthProvider{
    type: "trusted_networks";
    trusted_networks: string | string[] | any[];
    trusted_users: string | string[] | any[];
    allow_bypass_login?: boolean;
}
export interface CommandLineAuthProvider{
    type: "command_line";
    command: string;
    args?: any;
    meta?: boolean;
}
export interface LegacyApiPasswordAuthProvider{
    type: "legacy_api_password";
    api_password: string | SecretTag;
}