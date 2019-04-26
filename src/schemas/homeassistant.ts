import { Automations } from "./automation";
import { Sensors } from "./sensors";

/**
 * @TJS-additionalProperties true
 */
export interface HomeAssistantRoot{
    homeassistant?: HomeAssistantComponent;
    automation?: Automations;
    group?: GroupComponent;
    http?: any;
    default_config?: any;
    person?: any;
    system_health?: any;
    panel_iframe?: PanelIframeComponent;
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
    sensor?: null | Array<Sensors>;
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
    customize?: CustomizeComponent;
    customize_domain?: any;
    customize_glob?: any;
    packages?: Array<HomeAssistantComponent> | IncludeTag | IncludeFolderTag;
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

