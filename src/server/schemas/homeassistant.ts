import { Automations, ConditionsConfig, TimePeriod } from "./automation";
import { Sensors } from "./sensors";

/**
 * @TJS-additionalProperties true
 */
export interface HomeAssistantRoot {
    homeassistant?: HomeAssistantComponent | IncludeTags;
    automation?: Automations | IncludeTags;
    group?: GroupComponent | IncludeTags;
    panel_iframe?: PanelIframeComponent | IncludeTags;
    sensor?: null | Array<Sensors> | IncludeTags;
    scene?: SceneComponentEntry[] | IncludeTags;
    input_boolean?: InputBooleanEntry | IncludeTags;
    script?: Script | IncludeTags;
    http?: any;
    default_config?: any;
    person?: any;
    system_health?: any;
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
    ifttt?: any;
    ios?: any;
    mqtt?: any;
    remote?: any;
}

export interface HomeAssistantComponent {
    name?: string;
    latitude?: string | number;
    longitude?: string | number;
    elevation?: number;
    unit_system?: "metric" | "imperial";
    time_zone?: string;
    whitelist_external_dirs?: string[];
    customize?: CustomizeComponent | IncludeTags;
    customize_domain?: any;
    customize_glob?: any;
    packages?: Array<HomeAssistantComponent> | IncludeTags;
    auth_providers?: AuthProviders[];
    auth_mfa_modules?: Array<any> | IncludeTags;
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


export interface PanelIframeComponent {
    [key: string]: PanelIframeComponentEntry;
}
export interface PanelIframeComponentEntry {
    title: string;
    url: string;
    icon?: string;
    require_admin?: boolean;
}

export type CustomizeFile = CustomizeComponent | CustomizeComponent[];

export interface CustomizeComponent {
    [key: string]: CustomizeComponentEntry;
}
/**
 * @TJS-additionalProperties true
 */
export interface CustomizeComponentEntry {
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
export interface GroupComponent {
    [key: string]: GroupComponentEntry | string[];
}
export interface GroupComponentEntry {
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

export interface HomeAssistantAuthProvider {
    type: "homeassistant";
}
export interface TrustedNetworksAuthProvider {
    type: "trusted_networks";
    trusted_networks: string | string[] | any[];
    trusted_users?: string | string[] | any[];
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
    api_password: string | SecretTag;
}

export type SceneComponentEntries = SceneComponentEntry | Array<SceneComponentEntry>;

export interface SceneComponentEntry {
    name: string;
    entities: { [name: string]: string | boolean | EntitySceneConfig };
}

/**
 * @TJS-additionalProperties true
 */
export interface EntitySceneConfig {
    state?: boolean;
    brightness?: number | string;
    source?: string;
    color_temp?: number | string;
    xy_color?: any;
}

export interface InputBooleanEntry {
    [name: string]: {
        name?: string;
        initial?: boolean;
        icon?: string
    };
}

export type ScriptFile = Script | Script[];

export interface Script {
    [name: string]: SequencedAction | ScriptAction;
}

export interface SequencedAction {
    alias?: string;
    sequence: ScriptAction | Array<ScriptAction | ConditionsConfig>;
}

export type ScriptAction = ServiceAction | DelayAction | WaitAction | EventAction;

export interface ServiceAction {
    service: string;
    service_template?: string;
    data?: any;
    data_template?: any;
    entity_id?: string;
}
export interface DelayAction {
    delay: string | number | TimePeriod;
}
export interface WaitAction {
    wait_template: string;
    timeout?: string;
    continue_on_timeout?: boolean;
}
export interface EventAction {
    event: string;
    event_data: EventActionData;
    event_data_template: any;
}

/**
 * @TJS-additionalProperties true
 */
export interface EventActionData {
    name?: string;
    message?: string;
    entity_id?: string;
    domain?: string;
}