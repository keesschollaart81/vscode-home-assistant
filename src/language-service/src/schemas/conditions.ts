/**
 * Automation and script conditions
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/helpers/config_validation.py
 */
import {
  Deprecated,
  DeviceTrackerEntities,
  DynamicTemplate,
  Entities,
  IncludeList,
  InputNumberEntity,
  State,
  Template,
  Time,
  TimePeriod,
  ZoneEntities,
} from "./types";

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type Condition =
  | AndCondition
  | DeviceCondition
  | DynamicTemplate
  | NotCondition
  | NumericStateCondition
  | OrCondition
  | StateCondition
  | SunCondition
  | TemplateCondition
  | TimeCondition
  | ZoneCondition;

export interface AndCondition {
  /**
   * Test multiple conditions in one condition statement. Passes if all embedded conditions are valid.
   * https://www.home-assistant.io/docs/scripts/conditions/#and-condition
   */
  condition: "and";

  /**
   * Test multiple conditions in one condition statement. Passes if all embedded conditions are valid.
   * https://www.home-assistant.io/docs/scripts/conditions/#and-condition
   */
  conditions: Condition | Condition[] | IncludeList;
}

/**
 * @TJS-additionalProperties true
 */
export interface DeviceCondition {
  /**
   * Device conditions encompass a set of properties that are defined by an integration.
   * In contrast to state conditions, device conditions are tied to a device and not necessarily an entity. To use a device trigger, set up an automation through the browser frontend.
   */
  condition?: "device";

  /**
   * The internal ID of the device to preform a conditional test on.
   */
  device_id: string;

  /**
   * The integration domain this device condition is provided by.
   */
  domain: string;
}

export interface NotCondition {
  /**
   * Test multiple conditions in one condition statement. Passes if all embedded conditions are not valid.
   * https://www.home-assistant.io/docs/scripts/conditions/#not-condition
   */
  condition: "not";

  /**
   * Test multiple conditions in one condition statement. Passes if all embedded conditions are not valid.
   * https://www.home-assistant.io/docs/scripts/conditions/#not-condition
   */
  conditions: Condition | Condition[] | IncludeList;
}

export interface NumericStateCondition {
  /**
   * This type of condition attempts to parse the state of the specified entity as a number, and triggers if the value matches the thresholds.
   * https://www.home-assistant.io/docs/scripts/conditions/#numeric-state-condition
   */
  condition: "numeric_state";

  /**
   * Passes if the numeric state of the given entity (or entities) is above the given threshold.
   * https://www.home-assistant.io/docs/scripts/conditions/#numeric-state-condition
   */
  above?: number | InputNumberEntity;

  /**
   * Passes if the numeric state of the given entity (or entities) is below the given threshold.
   * https://www.home-assistant.io/docs/scripts/conditions/#numeric-state-condition
   */
  below?: number | InputNumberEntity;

  /**
   * The entity ID or list of entity IDs to test the numeric state against.
   * https://www.home-assistant.io/docs/scripts/conditions/#numeric-state-condition
   */
  entity_id: Entities;

  /**
   * An optional value template to use as the numeric state value.
   * https://www.home-assistant.io/docs/scripts/conditions/#numeric-state-condition
   */
  value_template?: Template;

  /**
   * Use the value of a specific entity attribute to test against, instead of the entity state.
   * https://www.home-assistant.io/docs/scripts/conditions/#numeric-state-condition
   */
  attribute?: string;
}

export interface OrCondition {
  /**
   * Test multiple conditions in one condition statement. Passes if any embedded condition is valid.
   * https://www.home-assistant.io/docs/scripts/conditions/#or-condition
   */
  condition: "or";

  /**
   * Test multiple conditions in one condition statement. Passes if any embedded condition is valid.
   * https://www.home-assistant.io/docs/scripts/conditions/#or-condition
   */
  conditions: Condition | Condition[] | IncludeList;
}

export interface StateCondition {
  /**
   * Tests if an entity (or entities) is in a specified state.
   * https://www.home-assistant.io/docs/scripts/conditions/#state-condition
   */
  condition: "state";

  /**
   * The entity ID or list of entity IDs to test the state against.
   * https://www.home-assistant.io/docs/scripts/conditions/#state-condition
   */
  entity_id: Entities;

  /**
   * The state the entity (or entities) must have for this condition to pass.
   * https://www.home-assistant.io/docs/scripts/conditions/#state-condition
   */
  state: State | State[];

  /**
   * The amount of time the entity (or entities) state must be held until this condition passes.
   * https://www.home-assistant.io/docs/scripts/conditions/#state-condition
   */
  for?: TimePeriod | Template;

  /**
   * DEPRECATED
   * This option has no effect, please remove it.
   */
  from?: Deprecated;

  /**
   * Use the value of a specific entity attribute to test against, instead of the entity state.
   * https://www.home-assistant.io/docs/scripts/conditions/#state-condition
   */
  attribute?: string;
}

export interface SunCondition {
  /**
   * The sun state can be used to test if the sun has set or risen.
   * https://www.home-assistant.io/docs/scripts/conditions/#sun-condition
   */
  condition: "sun";

  /**
   * Conditionally test if is currently is before sunrise or sunset.
   * Note that if only before key is used, the condition will be true from midnight until sunrise/sunset.
   * https://www.home-assistant.io/docs/scripts/conditions/#sun-condition
   */
  before?: "sunset" | "sunrise";

  /**
   * Optional offset from the sunrise or sunset. For example "-00:45:00" will conditionally test 45 minutes before sunrise or sunset.
   * https://www.home-assistant.io/docs/scripts/conditions/#sun-condition
   */
  before_offset?: TimePeriod;

  /**
   * Conditionally test if is currently is after sunrise or sunset.
   * Note that if only after key is used, the condition will be true from sunset/sunrise until midnight.
   * https://www.home-assistant.io/docs/scripts/conditions/#sun-condition
   */
  after?: "sunset" | "sunrise";

  /**
   * Optional offset from the sunrise or sunset. For example "-00:45:00" will conditionally test 45 minutes before sunrise or sunset.
   * https://www.home-assistant.io/docs/scripts/conditions/#sun-condition
   */
  after_offset?: TimePeriod;
}

export interface TemplateCondition {
  /**
   * The template condition tests if the given template renders a value equal to true. This is achieved by having the template result in a true boolean expression or by having the template render ‘true’.
   * https://www.home-assistant.io/docs/scripts/conditions/#template-condition
   */
  condition: "template";

  /**
   * The template to render for this condition. The condition will pass if the result is true.
   * https://www.home-assistant.io/docs/scripts/conditions/#template-condition
   */
  value_template?: Template;
}

export interface TimeCondition {
  /**
   * The time condition can test if it is after a specified time, before a specified time or if it is a certain day of the week.
   * https://www.home-assistant.io/docs/scripts/conditions/#time-condition
   */
  condition: "time";

  /**
   * Conditionally check if it is currently before a certain time of day.
   * Note that if only before key is used, the condition will be true from midnight until the specified time.
   * https://www.home-assistant.io/docs/scripts/conditions/#time-condition
   */
  before?: Time | InputDatetimeEntities;

  /**
   * Conditionally check if it is currently after a certain time of day.
   * Note that if only after key is used, the condition will be true from the specified time until midnight.
   * https://www.home-assistant.io/docs/scripts/conditions/#time-condition
   */
  after?: Time | InputDatetimeEntities;

  /**
   * Days of the week this condition can be valid.
   * https://www.home-assistant.io/docs/scripts/conditions/#time-condition
   */
  weekday?: Weekday | Array<Weekday>;
}

export interface ZoneCondition {
  condition: "zone";

  /**
   * The entity ID(s) of the device tracker(s).
   * https://www.home-assistant.io/docs/scripts/conditions/#zone-condition
   */
  entity_id: DeviceTrackerEntities;

  /**
   * DEPRECATED.
   *
   * This option has been deprecated, please remove it from your configuration.
   */
  event?: Deprecated;

  /**
   * The zone(s) conditionally check against for the given device tracker(s).
   * https://www.home-assistant.io/docs/scripts/conditions/#zone-condition
   */
  zone: ZoneEntities;
}
