import { Automations } from "./automation";

/**
 * @TJS-additionalProperties true
 */
export interface HomeAssistantRoot{
    homeassistant?: HomeAssistantComponent;
    automation?: Automations;
    group?: any;
    http?: any;
    default_config?: any;
    person?: any;
    system_health?: any;
    panel_iframe?: any;
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
    sensor?: any;
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
    customize?: any;
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