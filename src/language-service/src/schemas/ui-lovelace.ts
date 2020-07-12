import { IncludeList } from "./types";

/*

Types are copied from
https://github.com/home-assistant/home-assistant-polymer/blob/master/src/data/lovelace.ts

Types are serialized via 'npm run schema' using the 'typescript-json-schema' package
The generated schema (lovelace-ui.json) is also (committed) in this folder and
 used as a 'yamlValidation' in the package.json
*/

/**
 * @TJS-additionalProperties true
 */
export interface LovelaceConfig {
  title?: string;
  views: Array<LovelaceViewConfig | IncludeList>;
  background?: string;
  resources?:
    | Array<{ type: "css" | "js" | "module" | "html"; url: string }>
    | IncludeList;
}

export type LovelaceViewConfigs =
  | LovelaceViewConfig
  | Array<LovelaceViewConfig>;

/**
 * @TJS-additionalProperties true
 */
export interface LovelaceViewConfig {
  id?: string | number;
  index?: number;
  title?: string;
  badges?: Array<string | LovelaceBadgeConfig>;
  cards?: Array<LoveLaceCard | IncludeList>;
  path?: string;
  icon?: string;
  theme?: string;
  panel?: boolean;
  background?: string;
}

export interface LovelaceBadgeConfig {
  type?: string;
  [key: string]: any;
}

export type LoveLaceCardFile = LoveLaceCard | Array<LoveLaceCard>;

export type LoveLaceCard =
  | AlarmPanelCardConfig
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
  id?: string; // Updated
  index?: number;
  view_index?: number;
  type: string;
  [key: string]: any;

  /**
   * This property allows you to set custom CSS styles to your cards
   * Only available when https://github.com/thomasloven/lovelace-card-mod is installed!
   */
  style?: string;
}

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
  type: "alarm-panel"; // Updated
  entity: string;
  name?: string;
  states?: string[];
}

export interface ConditionalCardConfig extends LovelaceCardConfig {
  type: "conditional"; // Updated
  card: LovelaceCardConfig;
  conditions: Condition[];
}

export interface EmptyStateCardConfig extends LovelaceCardConfig {
  content: string;
  title?: string;
}
export interface EntityFilterEntityConfig extends EntityConfig {
  state_filter?: Array<{ key: string } | string>;
}
export interface EntitiesCardEntityConfig extends EntityConfig {
  type?: string;
  secondary_info?: "entity-id" | "last-changed" | "last-triggered";
  format?: "relative" | "total" | "date" | "time" | "datetime";
  action_name?: string;
  service?: string;
  service_data?: any;
  url?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  state_color?: boolean;
  header?: HeaderFooterPictureWidgetConfig | HeaderFooterButtonWidgetConfig;
  footer?: HeaderFooterPictureWidgetConfig | HeaderFooterButtonWidgetConfig;
}

export interface HeaderFooterPictureWidgetConfig extends LovelaceCardConfig {
  type: "picture";
  image: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

export interface HeaderFooterButtonWidgetConfig extends LovelaceCardConfig {
  type: "buttons";
  entities: EntityConfig | string;
}

export interface EntitiesCardConfig extends LovelaceCardConfig {
  type: "entities";
  show_header_toggle?: boolean;
  title?: string;
  entities: Array<
    | EntitiesCardEntityConfig
    | WebLinkEntityConfig
    | CallServiceEntityConfig
    | DividerEntityConfig
    | SectionEntityConfig
    | CastEntityConfig
    | CustomEntityConfig
    | string
  >;
  theme?: string;
  icon?: string;
  state_color?: boolean;
}

export interface EntityButtonCardConfig extends LovelaceCardConfig {
  type: "entity-button" | "button";
  entity: string;
  name?: string;
  show_name?: boolean;
  icon?: string;
  show_icon?: boolean;
  theme?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  icon_height?: string;
  double_tap_action?: ActionConfig;
}

export interface EntityFilterCardConfig extends LovelaceCardConfig {
  type: "entity-filter";
  entities: Array<EntityFilterEntityConfig | string>;
  state_filter: Array<{ key: string } | string>;
  card: Partial<LoveLaceCard>;
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
  type: "gauge";
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
  double_tap_action?: ActionConfig;
}

export interface GlanceCardConfig extends LovelaceCardConfig {
  type: "glance";
  show_name?: boolean;
  show_state?: boolean;
  show_icon?: boolean;
  title?: string;
  theme?: string;
  entities: ConfigEntity[];
  columns?: number;
}

export interface IframeCardConfig extends LovelaceCardConfig {
  type: "iframe";
  aspect_ratio?: string;
  title?: string;
  url: string;
}

export interface LightCardConfig extends LovelaceCardConfig {
  type: "light";
  entity: string;
  name?: string;
  theme?: string;
  icon?: string;
}

export interface MapCardConfig extends LovelaceCardConfig {
  type: "map";
  title?: string;
  aspect_ratio?: string;
  default_zoom?: number;
  entities?: Array<EntityConfig | string>;
  geo_location_sources?: string[];
  dark_mode?: boolean;
  hours_to_show?: number;
}

export interface MarkdownCardConfig extends LovelaceCardConfig {
  type: "markdown";
  content: string;
  title?: string;
  card_size?: number;
  entity_ids?: string | string[];
  theme?: string;
}

export interface MediaControlCardConfig extends LovelaceCardConfig {
  type: "media-control";
  entity: string;
}

export interface PictureCardConfig extends LovelaceCardConfig {
  type: "picture";
  image?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  theme?: string;
}

export interface PictureElementsCardConfig extends LovelaceCardConfig {
  type: "picture-elements";
  title?: string;
  image?: string;
  camera_image?: string;
  camera_view?: any;
  state_image?: any;
  state_filter: string[];
  aspect_ratio?: string;
  entity?: string;
  elements: Elements;
  theme?: string;
}

export interface PictureEntityCardConfig extends LovelaceCardConfig {
  type: "picture-entity";
  entity: string;
  name?: string;
  image?: string;
  camera_image?: string;
  camera_view?: any;
  state_image?: any;
  state_filter?: string[];
  aspect_ratio?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  show_name?: boolean;
  show_state?: boolean;
  theme?: string;
}

export interface PictureGlanceCardConfig extends LovelaceCardConfig {
  type: "picture-glance";
  entities: Array<EntityConfig | string>;
  title?: string;
  image?: string;
  camera_image?: string;
  camera_view?: any;
  state_image?: any;
  state_filter?: string[];
  aspect_ratio?: string;
  entity?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  show_state?: boolean;
  theme?: string;
}

export interface PlantStatusCardConfig extends LovelaceCardConfig {
  type: "plant-status";
  name?: string;
  entity: string;
  theme?: string;
}

export interface SensorCardConfig extends LovelaceCardConfig {
  type: "sensor";
  entity: string;
  name?: string;
  icon?: string;
  graph?: string;
  unit?: string;
  detail?: number;
  theme?: string;
  hours_to_show?: number;
}

export interface HistoryGraphConfig extends LovelaceCardConfig {
  type: "history-graph";
  entities: Array<EntityConfig | string>;
  hours_to_show?: number;
  title?: string;
  refresh_interval?: number;
}
export interface ShoppingListCardConfig extends LovelaceCardConfig {
  type: "shopping-list";
  title?: string;
}

export interface StackCardConfig extends LovelaceCardConfig {
  type: "vertical-stack" | "horizontal-stack";
  title?: string;
  cards: Array<LovelaceCardConfig | IncludeList>;
}

export interface ThermostatCardConfig extends LovelaceCardConfig {
  type: "thermostat";
  entity: string;
  theme?: string;
  name?: string;
}

export interface WeatherForecastCardConfig extends LovelaceCardConfig {
  type: "weather-forecast";
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

export interface StateBadgeElement {
  type: "state-badge";
  entity: EntityConfig | string;
  style?: any;
}

export interface StateIconElement {
  type: "state-icon";
  entity: EntityConfig | string;
  double_tap_action?: ActionConfig;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  style?: any;
  icon?: string;
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
  state_filter?: any;
  aspect_ratio?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  style?: any;
  icon?: string;
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
  entity: EntityConfig | string;
  state?: string;
  state_not?: string;
}

export type Elements = Array<
  | StateBadgeElement
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

export interface CastEntityConfig {
  type: "cast";
  name?: string;
  view: string | number;
  hide_if_unavailable?: boolean;
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
