import { IncludeTag, IncludeFolderTag, IncludeTags } from "./homeassistant";

/*

Types are copied from
https://github.com/home-assistant/home-assistant-polymer/blob/master/src/data/lovelace.ts

Updated properties are marked with '//Updated'

Types are serialized via 'npm run schema' using the 'typescript-json-schema' package
The generated schema (lovelace-ui.json) is also (committed) in this folder and
 used as a 'yamlValidation' in the package.json
 
*/

export interface LovelaceConfig {
  title?: string;
  views: Array<LovelaceViewConfig | IncludeTags>;
  background?: string;
  resources?: Array<{ type: "css" | "js" | "module" | "html"; url: string }> | IncludeTags;
}


export type LovelaceViewConfigs = LovelaceViewConfig | Array<LovelaceViewConfig>;

export interface LovelaceViewConfig {
  id?: string; //Updated
  index?: number;
  title?: string;
  badges?: string[];
  cards?: Array<LoveLaceCard | IncludeTags>; // updated
  path?: string;
  icon?: string;
  theme?: string;
  panel?: boolean;
  background?: string;
}

export type LoveLaceCardFile = LoveLaceCard | Array<LoveLaceCard>;

export type LoveLaceCard = AlarmPanelCardConfig
  | ConditionalCardConfig
  | EmptyStateCardConfig
  | EntitiesCardConfig
  | EntityButtonCardConfig
  | EntityFilterCardConfig
  | ErrorCardConfig
  | GaugeCardConfig
  | GlanceCardConfig
  | HistoryGraphConfig
  | IframeCardConfig
  | LightCardConfig
  | MapCardConfig
  | MarkdownCardConfig
  | MediaControlCardConfig
  | PictureCardConfig
  | PictureElementsCardConfig
  | PictureEntityCardConfig
  | PictureGlanceCardConfig
  | PlantStatusCardConfig
  | SensorCardConfig
  | ShoppingListCardConfig
  | StackCardConfig
  | ThermostatCardConfig
  | WeatherForecastCardConfig
  | CustomCardConfig;

export interface LovelaceCardConfig {
  id?: string; //Updated
  index?: number;
  view_index?: number;
  type: string;
  [key: string]: any;
}

// updated
/**
 * @TJS-additionalProperties true
 */
export interface CustomCardConfig {
  /**
   * @TJS-pattern custom:(.*)$
   */
  type: string;
}

export interface ToggleActionConfig {
  action: "toggle";
}

export interface CallServiceActionConfig {
  action: "call-service";
  service: string;
  service_data?: {
    entity_id?: string | [string];
    [key: string]: any;
  };
}

export interface NavigateActionConfig {
  action: "navigate";
  navigation_path: string;
}

export interface MoreInfoActionConfig {
  action: "more-info";
}

export interface NoActionConfig {
  action: "none";
}

export type ActionConfig =
  | ToggleActionConfig
  | CallServiceActionConfig
  | NavigateActionConfig
  | MoreInfoActionConfig
  | NoActionConfig;

export interface AlarmPanelCardConfig extends LovelaceCardConfig {
  type: "alarm-panel"; //Updated
  entity: string;
  name?: string;
  states?: string[];
}

export interface ConditionalCardConfig extends LovelaceCardConfig {
  type: "conditional"; //Updated
  card: LovelaceCardConfig;
  conditions: Condition[];
}

export interface EmptyStateCardConfig extends LovelaceCardConfig {
  content: string;
  title?: string;
}

export interface EntitiesCardEntityConfig extends EntityConfig {
  type?: string;
  secondary_info?: "entity-id" | "last-changed";
  format?: "relative" | "total" | "date" | "time" | "datetime";
}

export interface EntitiesCardConfig extends LovelaceCardConfig {
  type: "entities"; //Updated
  show_header_toggle?: boolean;
  title?: string;
  entities: Array<EntitiesCardEntityConfig | WebLinkEntityConfig | CallServiceEntityConfig | DividerEntityConfig | SectionEntityConfig | CustomEntityConfig | string>;
  theme?: string;
}

export interface EntityButtonCardConfig extends LovelaceCardConfig {
  type: "entity-button"; //Updated
  entity: string;
  name?: string;
  show_name?: boolean;
  icon?: string;
  show_icon?: boolean;
  theme?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
}

export interface EntityFilterCardConfig extends LovelaceCardConfig {
  type: "entity-filter"; //Updated
  entities: Array<EntityConfig | string>;
  state_filter: string[];
  card: Partial<LovelaceCardConfig>;
  show_empty?: boolean;
}

export interface ErrorCardConfig extends LovelaceCardConfig {
  error: string;
  origConfig: LovelaceCardConfig;
}

export interface SeverityConfig {
  green?: number;
  yellow?: number;
  red?: number;
}

export interface GaugeCardConfig extends LovelaceCardConfig {
  type: "gauge"; //Updated
  entity: string;
  name?: string;
  unit?: string;
  min?: number;
  max?: number;
  severity?: SeverityConfig;
  theme?: string;
}

export interface ConfigEntity extends EntityConfig {
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
}

export interface GlanceCardConfig extends LovelaceCardConfig {
  type: "glance"; //Updated
  show_name?: boolean;
  show_state?: boolean;
  show_icon?: boolean;
  title?: string;
  theme?: string;
  entities: ConfigEntity[];
  columns?: number;
}

export interface IframeCardConfig extends LovelaceCardConfig {
  type: "iframe"; //Updated
  aspect_ratio?: string;
  title?: string;
  url: string;
}

export interface LightCardConfig extends LovelaceCardConfig {
  type: "light"; //Updated
  entity: string;
  name?: string;
  theme?: string;
}

export interface MapCardConfig extends LovelaceCardConfig {
  type: "map"; //Updated
  title?: string;
  aspect_ratio?: string;
  default_zoom?: number;
  entities?: Array<EntityConfig | string>;
  geo_location_sources?: string[];
}

export interface MarkdownCardConfig extends LovelaceCardConfig {
  type: "markdown"; //Updated
  content: string;
  title?: string;
}

export interface MediaControlCardConfig extends LovelaceCardConfig {
  type: "media-control"; //Updated
  entity: string;
}

export interface PictureCardConfig extends LovelaceCardConfig {
  type: "picture"; //Updated
  image?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
}

export interface PictureElementsCardConfig extends LovelaceCardConfig {
  type: "picture-elements"; //Updated
  title?: string;
  image?: string;
  camera_image?: string;
  state_image?: {};
  aspect_ratio?: string;
  entity?: string;
  elements: Elements;
}

export interface PictureEntityCardConfig extends LovelaceCardConfig {
  type: "picture-entity"; //Updated
  entity: string;
  name?: string;
  image?: string;
  camera_image?: string;
  state_image?: {};
  aspect_ratio?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  show_name?: boolean;
  show_state?: boolean;
}

export interface PictureGlanceCardConfig extends LovelaceCardConfig {
  type: "picture-glance"; //Updated
  entities: Array<EntityConfig | string>; // Updated
  title?: string;
  image?: string;
  camera_image?: string;
  camera_view?: "live" | "auto"; //updated
  state_image?: {};
  aspect_ratio?: string;
  entity?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
}

export interface PlantStatusCardConfig extends LovelaceCardConfig {
  type: "plant-status"; //Updated
  name?: string;
  entity: string;
}

export interface SensorCardConfig extends LovelaceCardConfig {
  type: "sensor"; //Updated
  entity: string;
  name?: string;
  icon?: string;
  graph?: string;
  unit?: string;
  detail?: number;
  theme?: string;
  hours_to_show?: number;
}

//Updated
export interface HistoryGraphConfig extends LovelaceCardConfig {
  type: "history-graph";
  entities: Array<EntityConfig | string>;
  hours_to_show?: number;
  title?: string;
  refresh_interval?: number;
}
export interface ShoppingListCardConfig extends LovelaceCardConfig {
  type: "shopping-list"; //Updated
  title?: string;
}

export interface StackCardConfig extends LovelaceCardConfig {
  type: "vertical-stack" | "horizontal-stack"; //Updated
  cards: LovelaceCardConfig[];
}

export interface ThermostatCardConfig extends LovelaceCardConfig {
  type: "thermostat"; //Updated
  entity: string;
  theme?: string;
  name?: string;
}

export interface WeatherForecastCardConfig extends LovelaceCardConfig {
  type: "weather-forecast"; //Updated
  entity: string;
  name?: string;
}

export interface Condition {
  entity: string;
  state?: string;
  state_not?: string;
}

export interface EntityConfig {
  entity: string;
  type?: string;
  name?: string;
  icon?: string;
}

// export interface LovelaceElementConfig {
//   type: string;
//   style: object;
// }

export interface StateBadgeElement {
  type: "state-badge";
  entity: EntityConfig | string;
  style?: any;
}

export interface StateIconElement {
  type: "state-icon";
  entity: EntityConfig | string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  style?: any;
}
export interface StateLabelElement {
  type: "state-label";
  entity: EntityConfig | string;
  prefix?: string;
  suffix?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  style?: any;
}
export interface IconElement {
  type: "icon";
  icon: string;
  entity?: EntityConfig | string;
  title?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  style?: any;
}
export interface ImageElement {
  type: "image";
  entity?: EntityConfig | string;
  image?: string;
  camera_image?: string;
  camera_view?: string;
  state_image?: any;
  filter?: string;
  state_filter?: object;
  aspect_ratio?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  style?: any;
}
export interface ConditionalElement {
  type: "conditional";
  conditions: Array<ElementCondition>;
  elements: Elements;
}

/**
 * @TJS-additionalProperties true
 */
export interface CustomElement {

  /**
   * @TJS-pattern custom:(.*)$
   */
  type: string;
  style: any;
}
export interface ElementCondition {
  entity: EntityConfig;
  state?: string;
  state_not?: string;
}

export type Elements = Array<
  StateBadgeElement
  | StateIconElement
  | StateLabelElement
  | IconElement
  | ImageElement
  | ConditionalElement
  | CustomElement
>;

export interface WebLinkEntityConfig {
  type: "weblink";
  url: string;
  name?: string;
  icon?: string;
}
export interface CallServiceEntityConfig {
  type: "call-service";
  name: string;
  service: string;
  icon?: string;
  action_name?: string;
  service_data?: {
    entity_id?: string | [string];
    [key: string]: any;
  };
}
export interface DividerEntityConfig {
  type: "divider";
  style?: any;
}
export interface SectionEntityConfig {
  type: "section";
  label?: string;
}
/**
 * @TJS-additionalProperties true
 */
export interface CustomEntityConfig {
  /**
   * @TJS-pattern custom:(.*)$
   */
  type: string;
  label?: string;
}
