/**
 * Automation and script triggers
 */

import {
  Data,
  Entities,
  InputDatetimeEntities,
  Template,
  TimePeriod,
  ZoneEntity,
  Times,
  DeviceTrackerEntities,
  PersonEntities,
  ZoneEntities,
} from "./types";

export type Trigger =
  | DeviceTrigger
  | EventTrigger
  | GeolocationTrigger
  | HomeAssistantTrigger
  | MqttTrigger
  | NumericStateTrigger
  | StateTrigger
  | SunTrigger
  | TemplateTrigger
  | TimeTrigger
  | TimePatternTrigger
  | WebhookTrigger
  | ZoneTrigger;

/**
 * @TJS-additionalProperties true
 */
interface DeviceTrigger {
  /**
   * Device triggers encompass a set of events that are defined by an integration.
   * In contrast to state triggers, device triggers are tied to a device and not necessarily an entity. To use a device trigger, set up an automation through the browser frontend.
   * https://www.home-assistant.io/docs/automation/trigger/#device-triggers
   */
  platform: "device";

  /**
   * The internal ID of the device to trigger on
   * https://www.home-assistant.io/docs/automation/trigger/#device-triggers
   */
  device_id: string;

  /**
   * The integration domain this device trigger is provided by.
   * https://www.home-assistant.io/docs/automation/trigger/#device-triggers
   */
  domain: string;
}

interface EventTrigger {
  /**
   * Fires when an event is being received. Events are the raw building blocks of Home Assistant. You can match events on just the event name or also require specific event data to be present.
   * https://www.home-assistant.io/docs/automation/trigger/#event-trigger
   */
  platform: "event";

  /**
   * Additional event data that has to match before triggering.
   * https://www.home-assistant.io/docs/automation/trigger/#event-trigger
   */
  event_data?: Data;

  /**
   * The name of the event to listen for.
   * https://www.home-assistant.io/docs/automation/trigger/#event-trigger
   */
  event_type:
    | "automation_reloaded"
    | "call_service"
    | "component_loaded"
    | "platform_discovered"
    | "scene_reloaded"
    | "service_executed"
    | "service_registered"
    | "state_changed"
    | "time_changed"
    | string;
}

interface GeolocationTrigger {
  /**
   * Geolocation trigger fires when an entity is appearing in or disappearing from a zone.
   * https://www.home-assistant.io/docs/automation/trigger/#geolocation-trigger
   */
  platform: "geo_location";

  /**
   * Trigger when the entity leaves or enters the zone defined.
   * https://www.home-assistant.io/docs/automation/trigger/#geolocation-trigger
   */
  event: "enter" | "leave";

  /**
   * The source is directly linked to one of the Geolocation platforms.
   * https://www.home-assistant.io/docs/automation/trigger/#geolocation-trigger
   */
  source: string;

  /**
   * The zone to trigger on when a entity is appearing in or disappearing from.
   * https://www.home-assistant.io/docs/automation/trigger/#geolocation-trigger
   */
  zone: ZoneEntity;
}

interface HomeAssistantTrigger {
  /**
   * This trigger fires when Home Assistant has started up or going to shut down.
   * https://www.home-assistant.io/docs/automation/trigger/#home-assistant-trigger
   */
  platform: "homeassistant";

  /**
   * Specified the event to listen to: Either the Home Assistant start or shutdown event.
   * https://www.home-assistant.io/docs/automation/trigger/#home-assistant-trigger
   */
  event: "start" | "shutdown";
}

interface MqttTrigger {
  /**
   * Fires when a specific message is received on given MQTT topic
   * https://www.home-assistant.io/docs/automation/trigger/#mqtt-trigger
   */
  platform: "mqtt";

  /**
   * The default payload encoding is ‘utf-8’.
   * For images and other byte payloads use encoding: '' to disable payload decoding completely.
   * https://www.home-assistant.io/docs/automation/trigger/#mqtt-trigger
   */
  encoding?: string;

  /**
   * The payload to match on before triggering.
   * https://www.home-assistant.io/docs/automation/trigger/#mqtt-trigger
   */
  payload?: string;

  /**
   * The matching QoS level of the state topic. Default is 0.
   * https://www.home-assistant.io/docs/automation/trigger/#mqtt-trigger
   *
   * @TJS-type integer
   * @minimum 0
   * @maximum 2
   */
  qos?: number;

  /**
   * The MQTT topic to subscribe and listen to.
   * https://www.home-assistant.io/docs/automation/trigger/#mqtt-trigger
   */
  topic: string;
}

interface NumericStateTrigger {
  /**
   * Fires when numeric value of an entity’s state crosses a given threshold.
   * https://www.home-assistant.io/docs/automation/trigger/#numeric-state-trigger
   */
  platform: "numeric_state";

  /**
   * The entity ID or list of entity IDs to monitor the numeric state for.
   * https://www.home-assistant.io/docs/automation/trigger/#numeric-state-trigger
   */
  entity_id: Entities;

  /**
   * Fire this trigger if the numeric state of the monitored entity (or entities) is changing from above to below the given threshold.
   * https://www.home-assistant.io/docs/automation/trigger/#numeric-state-trigger
   */
  below?: number;

  /**
   * Fire this trigger if the numeric state of the monitored entity (or entities) is changing from below to above the given threshold.
   * https://www.home-assistant.io/docs/automation/trigger/#numeric-state-trigger
   */
  above?: number;

  /**
   * An optional value template to use as the numeric state value.
   * https://www.home-assistant.io/docs/automation/trigger/#numeric-state-trigger
   */
  value_template?: Template;

  /**
   * The amount of time this threshold must be held until this trigger fires.
   * https://www.home-assistant.io/docs/automation/trigger/#numeric-state-trigger
   */
  for?: TimePeriod | Template;

  /**
   * Use the value of a specific entity attribute to trigger on, instead of the entity state.
   * https://www.home-assistant.io/docs/automation/trigger/#numeric-state-trigger
   */
  attribute?: string;
}

interface StateTrigger {
  /**
   * This trigger fires when the state of any of given entities changes.
   * https://www.home-assistant.io/docs/automation/trigger/#state-trigger
   */
  platform: "state";

  /**
   * The entity ID or list of entity IDs to monitor the state for.
   * https://www.home-assistant.io/docs/automation/trigger/#state-trigger
   */
  entity_id: Entities;

  /**
   * The amount of time the entity or entities state must be held until this trigger fires.
   * https://www.home-assistant.io/docs/automation/trigger/#state-trigger
   */
  for?: TimePeriod | Template;

  /**
   * The state the entity or entities had before changing to its new state.
   * https://www.home-assistant.io/docs/automation/trigger/#state-trigger
   */
  from?: any | any[];

  /**
   * The state the entity or entities have changed to.
   * https://www.home-assistant.io/docs/automation/trigger/#state-trigger
   */
  to?: any | any[];

  /**
   * Use the value of a specific entity attribute to trigger on, instead of the entity state.
   * https://www.home-assistant.io/docs/automation/trigger/#state-trigger
   */
  attribute?: string;
}

interface SunTrigger {
  /**
   * This trigger fires when the sun is setting or rising.
   * https://www.home-assistant.io/docs/automation/trigger/#sun-trigger
   */
  platform: "sun";

  /**
   * The event to fire on, either on sunset or sunrise.
   * https://www.home-assistant.io/docs/automation/trigger/#sun-trigger
   */
  event: "sunset" | "sunrise";

  /**
   * Optional offset from the sunrise or sunset. For example "-00:45:00" will trigger 45 minutes before sunrise or sunset.
   * https://www.home-assistant.io/docs/automation/trigger/#sun-trigger
   */
  offset?: TimePeriod;
}

interface TemplateTrigger {
  /**
   * Template triggers work by evaluating a template on every state change for all of the recognized entities. The trigger will fire if the state change caused the template to render ‘true’.
   * https://www.home-assistant.io/docs/automation/trigger/#template-trigger
   */
  platform: "template";

  /**
   * The template to render for this trigger. The event will fire is the result is true.
   * https://www.home-assistant.io/docs/automation/trigger/#template-trigger
   */
  value_template: Template;

  /**
   * The amount of time the template must be resulting in true until this trigger fires.
   * https://www.home-assistant.io/docs/automation/trigger/#template-trigger
   */
  for?: TimePeriod | Template;
}

interface TimeTrigger {
  /**
   * The time trigger is configured to fire once at a specific point in time each day.
   * https://www.home-assistant.io/docs/automation/trigger/#time-trigger
   */
  platform: "time";

  /**
   * Time of day to trigger on, in HH:MM:SS, 24 hours clock format. For example: "13:30:00"
   * Also accepts input_datetime entities (e.g., input_datetime.start_of_day)
   *
   * @TJS-pattern ^(input_datetime\.(?!_)[\da-z_]+(?<!_)\s?(?:,\s?input_datetime\.(?!_)[\da-z_]+(?<!_))*|(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d))$
   * @items.pattern ^(input_datetime\.(?!_)[\da-z_]+(?<!_)|(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d))$
   */
  at: Times | InputDatetimeEntities;
}

interface TimePatternTrigger {
  /**
   * With the time pattern trigger, you can match if the hour, minute or second of the current time matches a specific value.
   * https://www.home-assistant.io/docs/automation/trigger/#time-pattern-trigger
   */
  platform: "time_pattern";

  /**
   * The hour or hours to trigger on.
   * You can prefix the value with a / to match whenever the value is divisible by that number. You can specify * to match any value.
   * https://www.home-assistant.io/docs/automation/trigger/#time-pattern-trigger
   */
  hours?: string;

  /**
   * The minute or minutes to trigger on.
   * You can prefix the value with a / to match whenever the value is divisible by that number. You can specify * to match any value.
   * https://www.home-assistant.io/docs/automation/trigger/#time-pattern-trigger
   */
  minutes?: string | number;

  /**
   * The second or seconds to trigger on.
   * You can prefix the value with a / to match whenever the value is divisible by that number. You can specify * to match any value.
   * https://www.home-assistant.io/docs/automation/trigger/#time-pattern-trigger
   */
  seconds?: string | number;
}

interface WebhookTrigger {
  /**
   * Webhook trigger fires when a web request is made to the webhook endpoint.
   * https://www.home-assistant.io/docs/automation/trigger/#webhook-trigger
   */
  platform: "webhook";

  /**
   * The webhook ID to use, defines the endpoint: /api/webhook/<webhook_id>
   * https://www.home-assistant.io/docs/automation/trigger/#webhook-trigger
   */
  webhook_id: string;
}

interface ZoneTrigger {
  /**
   * Zone trigger fires when an entity is entering or leaving the zone. For zone automation to work, you need to have setup a device tracker platform that supports reporting GPS coordinates.
   * https://www.home-assistant.io/docs/automation/trigger/#zone-trigger
   */
  platform: "zone";

  /**
   * The entity ID(s) of the device tracker(s) to monitor on a given zone.
   * https://www.home-assistant.io/docs/automation/trigger/#zone-trigger
   *
   * @TJS-pattern ^(device_tracker|person)\.(?!_)[\da-z_]+(?<!_)\s?(?:,\s?(device_tracker|person)\.(?!_)[\da-z_]+(?<!_))*$
   * @items.pattern ^(device_tracker|person)\.(?!_)[\da-z_]+(?<!_)$
   */
  entity_id: DeviceTrackerEntities | PersonEntities;

  /**
   * The zone(s) to monitor for the given device tracker(s).
   * https://www.home-assistant.io/docs/automation/trigger/#zone-trigger
   */
  zone: ZoneEntities;

  /**
   * Trigger when the entity leaves or enters the zone(s) defined.
   * https://www.home-assistant.io/docs/automation/trigger/#zone-trigger
   */
  event: "enter" | "leave";
}
