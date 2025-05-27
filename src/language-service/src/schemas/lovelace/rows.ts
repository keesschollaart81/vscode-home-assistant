import { Data } from "../types";
import { EntityConfig, Condition } from "./types";
import { Action } from "./actions";

export type Row =
  | AttributeRow
  | ButtonRow
  | ButtonsRow
  | CallServiceRow
  | CastRow
  | ConditionalRow
  | CustomRow
  | DividerRow
  | EntityRow
  | SectionRow
  | TextRow
  | WeblinkRow;

export interface AttributeRow extends EntityConfig {
  /**
   * A row that shows the attribute value of an entity.
   * https://www.home-assistant.io/lovelace/entities/#attribute
   */
  type: "attribute";

  /**
   * Attribute to display from the entity.
   * https://www.home-assistant.io/lovelace/entities/#attribute
   */
  attribute: string;

  /**
   * Icon to display for the row. Defaults to the icon of the entity.
   * https://www.home-assistant.io/lovelace/entities/#icon
   */
  icon?: string;

  /**
   * Text before entity state.
   * https://www.home-assistant.io/lovelace/entities/#prefix
   */
  prefix?: string;

  /**
   * Text after entity state.
   * https://www.home-assistant.io/lovelace/entities/#suffix
   */
  suffix?: string;
}

export interface ButtonRow extends EntityConfig {
  /**
   * Row that shows a button.
   * https://www.home-assistant.io/lovelace/entities/#button
   */
  type: "button";

  /**
   * Button label.
   * https://www.home-assistant.io/lovelace/entities/#action_name
   */
  action_name?: string;

  /**
   * Action taken on card double tap.
   * https://www.home-assistant.io/lovelace/entities/#double_tap_action
   */
  double_tap_action?: Action;

  /**
   * Action taken on card tap and hold.
   * https://www.home-assistant.io/lovelace/entities/#hold_action
   */
  hold_action?: Action;

  /**
   * Action taken on card tap.
   * https://www.home-assistant.io/lovelace/entities/#tap_action
   */
  tap_action?: Action;
}

export interface ButtonsRow {
  /**
   * Row that shows multiple buttons
   * https://www.home-assistant.io/lovelace/entities/#buttons
   */
  type: "buttons";

  /**
   * A list of entities to show. Each entry is either an entity ID or a map.
   * https://www.home-assistant.io/lovelace/entities/#entities
   */
  entities: ButtonEntityRow[];
}

export interface CallServiceRow extends EntityConfig {
  /**
   * Row that can do a service call.
   * https://www.home-assistant.io/lovelace/entities/#action_name
   */
  type: "call-service";

  /**
   * Home Assistant service to call.
   * https://www.home-assistant.io/lovelace/entities/#action_name
   */
  service: string;

  /**
   * Service data to include. Note: Has been replaced by "data".
   * https://www.home-assistant.io/lovelace/entities/#data
   */
  service_data?: Data;

  /**
   * Data to pass into the service call.
   * https://www.home-assistant.io/lovelace/entities/#data
   */
  data?: Data;

  /**
   * Button label.
   * https://www.home-assistant.io/lovelace/entities/#action_name
   */
  action_name?: string;
}

export interface CastRow {
  /**
   * Special row to start Home Assistant Cast.
   * https://www.home-assistant.io/lovelace/entities/#cast
   */
  type: "cast";

  /**
   * Path to the dashboard of the view that needs to be shown.
   * https://www.home-assistant.io/lovelace/entities/#dashboard
   */
  dashboard?: string;

  /**
   * Hide this row if casting is not available in the browser.
   * https://www.home-assistant.io/lovelace/entities/#hide_if_unavailable
   */
  hide_if_unavailable?: boolean;

  /**
   * Icon to use.
   * https://www.home-assistant.io/lovelace/entities/#icon
   */
  icon?: string;

  /**
   * Name to show in the row.
   * https://www.home-assistant.io/lovelace/entities/#name
   */
  name?: string;

  /**
   * Path to the view that needs to be shown.
   * https://www.home-assistant.io/lovelace/entities/#view
   */
  view: string | number;
}

export interface ConditionalRow {
  /**
   * Special row that displays based on entity states.
   * https://www.home-assistant.io/lovelace/entities/#conditional
   */
  type: "conditional";

  /**
   * List of entity IDs and matching states.
   * https://www.home-assistant.io/lovelace/entities/#conditions
   */
  conditions: Condition[];

  /**
   * Row to display if all conditions match.
   * https://www.home-assistant.io/lovelace/entities/#row
   */
  row: Row;
}

/**
 * @TJS-additionalProperties true
 */
export interface CustomRow {
  /**
   * This is a custom row.
   * @TJS-pattern custom:(.*)$
   */
  type: string;
}

export interface DividerRow {
  /**
   * Shows a divider row on the card.
   * https://www.home-assistant.io/lovelace/entities/#divider
   */
  type: "divider";

  /**
   * Style the element using CSS.
   * https://www.home-assistant.io/lovelace/entities/#style
   */
  style?: { [key: string]: any };
}

interface EntityRow extends EntityConfig {
  /**
   * Button label. (Only applies to script and scene rows)
   * https://www.home-assistant.io/lovelace/entities/#action_name
   */
  action_name?: string;

  /**
   * Action taken on card double tap.
   * https://www.home-assistant.io/lovelace/entities/#double_tap_action
   */
  double_tap_action?: Action;

  /**
   * How the state should be formatted. Currently only used for timestamp sensors. Valid values are: relative, total, date, time and datetime.
   * https://www.home-assistant.io/lovelace/entities/#format
   */
  format?: "date" | "datetime" | "relative" | "time" | "total";

  /**
   * Action taken on card tap and hold.
   * https://www.home-assistant.io/lovelace/entities/#hold_action
   */
  hold_action?: Action;

  /**
   * Show additional info. Values: entity-id, last-changed, last-updated, last-triggered (only for automations and scripts), position or tilt-position (only for supported covers), brightness (only for lights).
   * https://www.home-assistant.io/lovelace/entities/#secondary_info
   */
  secondary_info?:
    | "entity-id"
    | "last-changed"
    | "last-triggered"
    | "last-updated"
    | "position"
    | "tilt-position"
    | "brightness";

  /**
   * Set to true to have icons colored when entity is active.
   * https://www.home-assistant.io/lovelace/entities/#state_color
   */
  state_color?: boolean;

  /**
   * Action taken on card tap.
   * https://www.home-assistant.io/lovelace/entities/#tap_action
   */
  tap_action?: Action;
}

interface ButtonEntityRow extends EntityRow {
  /**
   * If false, the icon is not shown.
   * https://www.home-assistant.io/lovelace/entities/#show_icon
   */
  show_icon?: boolean;

  /**
   * If false, the button name is not shown.
   * https://www.home-assistant.io/lovelace/entities/#show_name
   */
  show_name?: boolean;
}

export interface SectionRow {
  /**
   * Devides a card by a new section.
   * https://www.home-assistant.io/lovelace/entities/#section
   */
  type: "section";

  /**
   * Section label.
   * https://www.home-assistant.io/lovelace/entities/#label
   */
  label?: string;
}

export interface TextRow {
  /**
   * Shows a row with a label and a text.
   * https://www.home-assistant.io/lovelace/entities/#text
   */
  type: "text";

  /**
   * Name to show on the row.
   * https://www.home-assistant.io/lovelace/entities/#name
   */
  name: string;

  /**
   * Row icon in front of the text.
   * https://www.home-assistant.io/lovelace/entities/#icon
   */
  icon?: string;

  /**
   * Text to show on the row.
   * https://www.home-assistant.io/lovelace/entities/#text
   */
  text: string;
}

export interface WeblinkRow {
  /**
   * A row that shows a clickable link to anywhere on the net.
   * https://www.home-assistant.io/lovelace/entities/#weblink
   */
  type: "weblink";

  /**
   * Link label.
   * https://www.home-assistant.io/lovelace/entities/#name
   */
  name?: string;

  /**
   * Icon to display (e.g., mdi:home).
   * https://www.home-assistant.io/lovelace/entities/#icon
   */
  icon?: string;

  /**
   * Website URL (or internal URL e.g., /hassio/dashboard or /panel_custom_name)
   * https://www.home-assistant.io/lovelace/entities/#url
   */
  url: string;
}
