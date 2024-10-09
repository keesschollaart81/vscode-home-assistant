/**
 * Automation and script triggers
 */

import {
  Data,
  Entities,
  InputDatetimeEntities,
  InputNumberEntity,
  Template,
  TimePeriod,
  ZoneEntity,
  Times,
  DeviceTrackerEntities,
  PersonEntities,
  ZoneEntities,
  SensorEntities,
  NumberEntity,
  SensorEntity,
  CalendarEntity,
  LegacySyntax,
} from "../types";

export type Trigger =
  | CalendarTrigger
  | ConversationTrigger
  | DeviceTrigger
  | EventTrigger
  | GeolocationTrigger
  | HomeAssistantTrigger
  | MqttTrigger
  | NumericStateTrigger
  | PersistentNotificationTrigger
  | StateTrigger
  | SunTrigger
  | TagTrigger
  | TemplateTrigger
  | TimeTrigger
  | TimePatternTrigger
  | WebhookTrigger
  | ZoneTrigger;

type EventType =
  | "automation_reloaded"
  | "automation_triggered"
  | "call_service"
  | "component_loaded"
  | "deconz_event"
  | "homeassistant_started"
  | "homeassistant_stop"
  | "logbook_entry"
  | "platform_discovered"
  | "scene_reloaded"
  | "service_executed"
  | "service_registered"
  | "service_removed"
  | "state_changed"
  | "tag_scanned"
  | "themes_updates"
  | "time_changed"
  | "user_added"
  | "user_removed"
  | "zha_event";

type AllowedMethods = "POST" | "PUT" | "GET" | "HEAD";
type PersistentNotificationUpdateType = "added" | "updated" | "removed";

interface CalendarTrigger {
  /**
   * Alias for the calendar trigger.
   */
  alias?: string;

  /**
   * Calendar trigger fires when a Calendar event starts or ends.
   * https://www.home-assistant.io/docs/automation/trigger/#calendar-trigger
   */
  trigger?: "calendar";

  /**
   * Legacy syntax, use "trigger: calendar" instead.
   */
  platform?: LegacySyntax;

  /**
   * Every individual trigger in an automation can be disabled, without removing it.
   * https://www.home-assistant.io/docs/automation/trigger/#disabling-a-trigger
   */
  enabled?: boolean;

  /**
   * Trigger on start or end of the calendar event.
   * https://www.home-assistant.io/docs/automation/trigger/#calendar-trigger
   */
  event?: "start" | "end";

  /**
   * The entity ID to monitor the calendar events for.
   * https://www.home-assistant.io/docs/automation/trigger/#calendar-trigger
   */
  entity_id: CalendarEntity;

  /**
   * Optional time offset to fire a set time before or after event start/end.
   * https://www.home-assistant.io/docs/automation/trigger/#calendar-trigger
   */
  offset?: TimePeriod;

  /**
   * An personal identifier for this trigger, that is passed into the trigger
   * variables when the automation triggers using this trigger.
   * https://www.home-assistant.io/docs/automation/trigger/#calendar-trigger
   */
  id?: string;

  /**
   * This allows you to define variables that will be set when the trigger fires.
   * These can be used in the automation actions or conditions. Templates
   * can be used in these variables.
   * https://www.home-assistant.io/docs/automation/trigger#trigger-variables
   */
  variables?: Data;
}

interface ConversationTrigger {
  /**
   * Alias for the conversation pattern trigger.
   */
  alias?: string;

  /**
   * With the sentence trigger, you can match a sentence from a voice assistant.
   * https://www.home-assistant.io/docs/automation/trigger/#sentence-trigger
   */
  trigger?: "conversation";

  /**
   * Legacy syntax, use "trigger: conversation" instead.
   */
  platform?: LegacySyntax;

  /**
   * Every individual trigger in an automation can be disabled, without removing it.
   * https://www.home-assistant.io/docs/automation/trigger/#disabling-a-trigger
   */
  enabled?: boolean;

  /**
   * A sentence or a list of sentences for this trigger.
   * https://www.home-assistant.io/docs/automation/trigger/#sentence-trigger
   */
  command: string | string[];

  /**
   * An personal identifier for this trigger, that is passed into the trigger
   * variables when the automation triggers using this trigger.
   * https://www.home-assistant.io/docs/automation/trigger/#sentence-trigger
   */
  id?: string;

  /**
   * This allows you to define variables that will be set when the trigger fires.
   * These can be used in the automation actions or conditions. Templates
   * can be used in these variables.
   * https://www.home-assistant.io/docs/automation/trigger#trigger-variables
   */
  variables?: Data;
}

/**
 * @TJS-additionalProperties true
 */
interface DeviceTrigger {
  /**
   * Alias for the device trigger.
   */
  alias?: string;

  /**
   * Device triggers encompass a set of events that are defined by an integration.
   * In contrast to state triggers, device triggers are tied to a device and not necessarily an entity. To use a device trigger, set up an automation through the browser frontend.
   * https://www.home-assistant.io/docs/automation/trigger/#device-triggers
   */
  trigger?: "device";

  /**
   * Legacy syntax, use "trigger: device" instead.
   */
  platform?: LegacySyntax;

  /**
   * Every individual trigger in an automation can be disabled, without removing it.
   * https://www.home-assistant.io/docs/automation/trigger/#disabling-a-trigger
   */
  enabled?: boolean;

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

  /**
   * An personal identifier for this trigger, that is passed into the trigger
   * variables when the automation triggers using this trigger.
   * https://www.home-assistant.io/docs/automation/trigger/#device-triggers
   */
  id?: string;

  /**
   * This allows you to define variables that will be set when the trigger fires.
   * These can be used in the automation actions or conditions. Templates
   * can be used in these variables.
   * https://www.home-assistant.io/docs/automation/trigger#trigger-variables
   */
  variables?: Data;
}

interface EventTrigger {
  /**
   * Alias for the event trigger.
   */
  alias?: string;

  /**
   * Fires when an event is being received. Events are the raw building blocks of Home Assistant. You can match events on just the event name or also require specific event data to be present.
   * https://www.home-assistant.io/docs/automation/trigger/#event-trigger
   */
  trigger?: "event";

  /**
   * Legacy syntax, use "trigger: event" instead.
   */
  platform?: LegacySyntax;

  /**
   * Every individual trigger in an automation can be disabled, without removing it.
   * https://www.home-assistant.io/docs/automation/trigger/#disabling-a-trigger
   */
  enabled?: boolean;

  /**
   * Additional event context that has to match before triggering.
   * https://www.home-assistant.io/docs/automation/trigger/#event-trigger
   */
  context?: Data;

  /**
   * Additional event data that has to match before triggering.
   * https://www.home-assistant.io/docs/automation/trigger/#event-trigger
   */
  event_data?: Data;

  /**
   * The name of the event to listen for.
   * https://www.home-assistant.io/docs/automation/trigger/#event-trigger
   */
  event_type: EventType | EventType[] | string | string[];

  /**
   * An personal identifier for this trigger, that is passed into the trigger
   * variables when the automation triggers using this trigger.
   * https://www.home-assistant.io/docs/automation/trigger/#event-trigger
   */
  id?: string;

  /**
   * This allows you to define variables that will be set when the trigger fires.
   * These can be used in the automation actions or conditions. Templates
   * can be used in these variables.
   * https://www.home-assistant.io/docs/automation/trigger#trigger-variables
   */
  variables?: Data;
}

interface GeolocationTrigger {
  /**
   * Alias for the geolocation trigger.
   */
  alias?: string;

  /**
   * Geolocation trigger fires when an entity is appearing in or disappearing from a zone.
   * https://www.home-assistant.io/docs/automation/trigger/#geolocation-trigger
   */
  trigger?: "geo_location";

  /**
   * Legacy syntax, use "trigger: geo_location" instead.
   */
  platform?: LegacySyntax;

  /**
   * Every individual trigger in an automation can be disabled, without removing it.
   * https://www.home-assistant.io/docs/automation/trigger/#disabling-a-trigger
   */
  enabled?: boolean;

  /**
   * Trigger when the entity leaves or enters the zone defined.
   * https://www.home-assistant.io/docs/automation/trigger/#geolocation-trigger
   */
  event: "enter" | "leave";

  /**
   * An personal identifier for this trigger, that is passed into the trigger
   * variables when the automation triggers using this trigger.
   * https://www.home-assistant.io/docs/automation/trigger/#geolocation-trigger
   */
  id?: string;

  /**
   * The source is directly linked to one of the Geolocation platforms.
   * https://www.home-assistant.io/docs/automation/trigger/#geolocation-trigger
   */
  source: string;

  /**
   * This allows you to define variables that will be set when the trigger fires.
   * These can be used in the automation actions or conditions. Templates
   * can be used in these variables.
   * https://www.home-assistant.io/docs/automation/trigger#trigger-variables
   */
  variables?: Data;

  /**
   * The zone to trigger on when a entity is appearing in or disappearing from.
   * https://www.home-assistant.io/docs/automation/trigger/#geolocation-trigger
   */
  zone: ZoneEntity;
}

interface HomeAssistantTrigger {
  /**
   * Alias for the home assistant trigger.
   */
  alias?: string;

  /**
   * This trigger fires when Home Assistant has started up or going to shut down.
   * https://www.home-assistant.io/docs/automation/trigger/#home-assistant-trigger
   */
  trigger?: "homeassistant";

  /**
   * Legacy syntax, use "trigger: homeassistant" instead.
   */
  platform?: LegacySyntax;

  /**
   * Every individual trigger in an automation can be disabled, without removing it.
   * https://www.home-assistant.io/docs/automation/trigger/#disabling-a-trigger
   */
  enabled?: boolean;

  /**
   * Specified the event to listen to: Either the Home Assistant start or shutdown event.
   * https://www.home-assistant.io/docs/automation/trigger/#home-assistant-trigger
   */
  event: "start" | "shutdown";

  /**
   * An personal identifier for this trigger, that is passed into the trigger
   * variables when the automation triggers using this trigger.
   * https://www.home-assistant.io/docs/automation/trigger/#home-assistant-trigger
   */
  id?: string;

  /**
   * This allows you to define variables that will be set when the trigger fires.
   * These can be used in the automation actions or conditions. Templates
   * can be used in these variables.
   * https://www.home-assistant.io/docs/automation/trigger#trigger-variables
   */
  variables?: Data;
}

interface MqttTrigger {
  /**
   * Alias for the mqtt trigger.
   */
  alias?: string;

  /**
   * Fires when a specific message is received on given MQTT topic
   * https://www.home-assistant.io/docs/automation/trigger/#mqtt-trigger
   */
  trigger?: "mqtt";

  /**
   * Legacy syntax, use "trigger: mqtt" instead.
   */
  platform?: LegacySyntax;

  /**
   * Every individual trigger in an automation can be disabled, without removing it.
   * https://www.home-assistant.io/docs/automation/trigger/#disabling-a-trigger
   */
  enabled?: boolean;

  /**
   * The default payload encoding is ‘utf-8’.
   * For images and other byte payloads use encoding: '' to disable payload decoding completely.
   * https://www.home-assistant.io/docs/automation/trigger/#mqtt-trigger
   */
  encoding?: string;

  /**
   * An personal identifier for this trigger, that is passed into the trigger
   * variables when the automation triggers using this trigger.
   * https://www.home-assistant.io/docs/automation/trigger/#mqtt-trigger
   */
  id?: string;

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

  /**
   * Value template allows, for example, picking out a JSON key from the incoming MQTT message.
   * https://www.home-assistant.io/docs/automation/trigger/#mqtt-trigger
   */
  value_template?: Template;

  /**
   * This allows you to define variables that will be set when the trigger fires.
   * These can be used in the automation actions or conditions. Templates
   * can be used in these variables.
   * https://www.home-assistant.io/docs/automation/trigger#trigger-variables
   */
  variables?: Data;
}

interface NumericStateTrigger {
  /**
   * Alias for the numeric state trigger.
   */
  alias?: string;

  /**
   * Fires when numeric value of an entity’s state crosses a given threshold.
   * https://www.home-assistant.io/docs/automation/trigger/#numeric-state-trigger
   */
  trigger?: "numeric_state";

  /**
   * Legacy syntax, use "trigger: numeric_state" instead.
   */
  platform?: LegacySyntax;

  /**
   * Every individual trigger in an automation can be disabled, without removing it.
   * https://www.home-assistant.io/docs/automation/trigger/#disabling-a-trigger
   */
  enabled?: boolean;

  /**
   * The entity ID or list of entity IDs to monitor the numeric state for.
   * https://www.home-assistant.io/docs/automation/trigger/#numeric-state-trigger
   */
  entity_id: Entities;

  /**
   * Fire this trigger if the numeric state of the monitored entity (or entities) is changing from above to below the given threshold.
   * https://www.home-assistant.io/docs/automation/trigger/#numeric-state-trigger
   */
  below?: number | InputNumberEntity | NumberEntity | SensorEntity;

  /**
   * Fire this trigger if the numeric state of the monitored entity (or entities) is changing from below to above the given threshold.
   * https://www.home-assistant.io/docs/automation/trigger/#numeric-state-trigger
   */
  above?: number | InputNumberEntity | NumberEntity | SensorEntity;

  /**
   * An personal identifier for this trigger, that is passed into the trigger
   * variables when the automation triggers using this trigger.
   * https://www.home-assistant.io/docs/automation/trigger/#numeric-state-trigger
   */
  id?: string;

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

  /**
   * This allows you to define variables that will be set when the trigger fires.
   * These can be used in the automation actions or conditions. Templates
   * can be used in these variables.
   * https://www.home-assistant.io/docs/automation/trigger#trigger-variables
   */
  variables?: Data;
}

interface PersistentNotificationTrigger {
  /**
   * Alias for the persistent notification trigger.
   */
  alias?: string;

  /**
   * Persistent notification triggers are fired when a persistent_notification is added or removed that matches the configuration options.
   * https://www.home-assistant.io/docs/automation/trigger/#persistent-notification-trigger
   */
  trigger?: "persistent_notification";

  /**
   * Legacy syntax, use "trigger: persistent_notification" instead.
   */
  platform?: LegacySyntax;

  /**
   * Every individual trigger in an automation can be disabled, without removing it.
   * https://www.home-assistant.io/docs/automation/trigger/#disabling-a-trigger
   */
  enabled?: boolean;

  /**
   * An personal identifier for this trigger, that is passed into the trigger
   * variables when the automation triggers using this trigger.
   * https://www.home-assistant.io/docs/automation/trigger/#persistent-notification-trigger
   */
  id?: string;

  /**
   * Define the type of persistent notification to trigger on.
   * https://www.home-assistant.io/docs/automation/trigger/#persistent-notification-trigger
   */
  update_type?: PersistentNotificationUpdateType[];

  /**
   * The notification ID to trigger on.
   * https://www.home-assistant.io/docs/automation/trigger/#persistent-notification-trigger
   */
  notification_id?: string;
}

interface StateTrigger {
  /**
   * Alias for the state trigger.
   */
  alias?: string;

  /**
   * This trigger fires when the state of any of given entities changes.
   * https://www.home-assistant.io/docs/automation/trigger/#state-trigger
   */
  trigger?: "state";

  /**
   * Legacy syntax, use "trigger: state" instead.
   */
  platform?: LegacySyntax;

  /**
   * Every individual trigger in an automation can be disabled, without removing it.
   * https://www.home-assistant.io/docs/automation/trigger/#disabling-a-trigger
   */
  enabled?: boolean;

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
   * The state the entity or entities NOT had before changing to its new state.
   * https://www.home-assistant.io/docs/automation/trigger/#state-trigger
   */
  not_from?: any | any[];

  /**
   * The state the entity or entities have changed to.
   * https://www.home-assistant.io/docs/automation/trigger/#state-trigger
   */
  to?: any | any[];

  /**
   * The state the entity or entities did NOT changed to.
   * https://www.home-assistant.io/docs/automation/trigger/#state-trigger
   */
  not_to?: any | any[];

  /**
   * Use the value of a specific entity attribute to trigger on, instead of the entity state.
   * https://www.home-assistant.io/docs/automation/trigger/#state-trigger
   */
  attribute?: string;

  /**
   * An personal identifier for this trigger, that is passed into the trigger
   * variables when the automation triggers using this trigger.
   * https://www.home-assistant.io/docs/automation/trigger/#state-trigger
   */
  id?: string;

  /**
   * This allows you to define variables that will be set when the trigger fires.
   * These can be used in the automation actions or conditions. Templates
   * can be used in these variables.
   * https://www.home-assistant.io/docs/automation/trigger#trigger-variables
   */
  variables?: Data;
}

interface SunTrigger {
  /**
   * Alias for the sun trigger.
   */
  alias?: string;

  /**
   * This trigger fires when the sun is setting or rising.
   * https://www.home-assistant.io/docs/automation/trigger/#sun-trigger
   */
  trigger?: "sun";

  /**
   * Legacy syntax, use "trigger: device" instead.
   */
  platform?: LegacySyntax;

  /**
   * Every individual trigger in an automation can be disabled, without removing it.
   * https://www.home-assistant.io/docs/automation/trigger/#disabling-a-trigger
   */
  enabled?: boolean;

  /**
   * The event to fire on, either on sunset or sunrise.
   * https://www.home-assistant.io/docs/automation/trigger/#sun-trigger
   */
  event: "sunset" | "sunrise";

  /**
   * An personal identifier for this trigger, that is passed into the trigger
   * variables when the automation triggers using this trigger.
   * https://www.home-assistant.io/docs/automation/trigger/#sun-trigger
   */
  id?: string;

  /**
   * Optional offset from the sunrise or sunset. For example "-00:45:00" will trigger 45 minutes before sunrise or sunset.
   * https://www.home-assistant.io/docs/automation/trigger/#sun-trigger
   */
  offset?: TimePeriod;

  /**
   * This allows you to define variables that will be set when the trigger fires.
   * These can be used in the automation actions or conditions. Templates
   * can be used in these variables.
   * https://www.home-assistant.io/docs/automation/trigger#trigger-variables
   */
  variables?: Data;
}

interface TemplateTrigger {
  /**
   * Alias for the template trigger.
   */
  alias?: string;

  /**
   * Template triggers work by evaluating a template on every state change for all of the recognized entities. The trigger will fire if the state change caused the template to render ‘true’.
   * https://www.home-assistant.io/docs/automation/trigger/#template-trigger
   */
  trigger?: "template";

  /**
   * Legacy syntax, use "trigger: template" instead.
   */
  platform?: LegacySyntax;

  /**
   * Every individual trigger in an automation can be disabled, without removing it.
   * https://www.home-assistant.io/docs/automation/trigger/#disabling-a-trigger
   */
  enabled?: boolean;

  /**
   * An personal identifier for this trigger, that is passed into the trigger
   * variables when the automation triggers using this trigger.
   * https://www.home-assistant.io/docs/automation/trigger/#template-trigger
   */
  id?: string;

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

  /**
   * This allows you to define variables that will be set when the trigger fires.
   * These can be used in the automation actions or conditions. Templates
   * can be used in these variables.
   * https://www.home-assistant.io/docs/automation/trigger#trigger-variables
   */
  variables?: Data;
}

interface TimeTrigger {
  /**
   * Alias for the time trigger.
   */
  alias?: string;

  /**
   * The time trigger is configured to fire once at a specific point in time each day.
   * https://www.home-assistant.io/docs/automation/trigger/#time-trigger
   */
  trigger?: "time";

  /**
   * Legacy syntax, use "trigger: time" instead.
   */
  platform?: LegacySyntax;

  /**
   * Every individual trigger in an automation can be disabled, without removing it.
   * https://www.home-assistant.io/docs/automation/trigger/#disabling-a-trigger
   */
  enabled?: boolean;

  /**
   * Time of day to trigger on, in HH:MM:SS, 24 hours clock format. For example: "13:30:00"
   * Also accepts input_datetime entities (e.g., input_datetime.start_of_day)
   *
   * @TJS-pattern ^((input_datetime|sensor)\.(?!_)[\da-z_]+(?<!_)\s?(?:,\s?(input_datetime|sensor)\.(?!_)[\da-z_]+(?<!_))*|(?:[01]\d|2[0123]):(?:[012345]\d)(:(?:[012345]\d))?)$
   * @items.pattern ^((input_datetime|sensor)\.(?!_)[\da-z_]+(?<!_)|(?:[01]\d|2[0123]):(?:[012345]\d)(:(?:[012345]\d))?)$
   */
  at: Times | InputDatetimeEntities | SensorEntities;

  /**
   * An personal identifier for this trigger, that is passed into the trigger
   * variables when the automation triggers using this trigger.
   * https://www.home-assistant.io/docs/automation/trigger/#time-trigger
   */
  id?: string;

  /**
   * This allows you to define variables that will be set when the trigger fires.
   * These can be used in the automation actions or conditions. Templates
   * can be used in these variables.
   * https://www.home-assistant.io/docs/automation/trigger#trigger-variables
   */
  variables?: Data;
}

interface TimePatternTrigger {
  /**
   * Alias for the time pattern trigger.
   */
  alias?: string;

  /**
   * With the time pattern trigger, you can match if the hour, minute or second of the current time matches a specific value.
   * https://www.home-assistant.io/docs/automation/trigger/#time-pattern-trigger
   */
  trigger?: "time_pattern";

  /**
   * Legacy syntax, use "trigger: time_pattern" instead.
   */
  platform?: LegacySyntax;

  /**
   * Every individual trigger in an automation can be disabled, without removing it.
   * https://www.home-assistant.io/docs/automation/trigger/#disabling-a-trigger
   */
  enabled?: boolean;

  /**
   * An personal identifier for this trigger, that is passed into the trigger
   * variables when the automation triggers using this trigger.
   * https://www.home-assistant.io/docs/automation/trigger/#time-pattern-trigger
   */
  id?: string;

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

  /**
   * This allows you to define variables that will be set when the trigger fires.
   * These can be used in the automation actions or conditions. Templates
   * can be used in these variables.
   * https://www.home-assistant.io/docs/automation/trigger#trigger-variables
   */
  variables?: Data;
}

interface WebhookTrigger {
  /**
   * Alias for the webhook trigger.
   */
  alias?: string;

  /**
   * Webhook trigger fires when a web request is made to the webhook endpoint.
   * https://www.home-assistant.io/docs/automation/trigger/#webhook-trigger
   */
  trigger?: "webhook";

  /**
   * Legacy syntax, use "trigger: webhook" instead.
   */
  platform?: LegacySyntax;

  /**
   * Every individual trigger in an automation can be disabled, without removing it.
   * https://www.home-assistant.io/docs/automation/trigger/#disabling-a-trigger
   */
  enabled?: boolean;

  /**
   * An personal identifier for this trigger, that is passed into the trigger
   * variables when the automation triggers using this trigger.
   * https://www.home-assistant.io/docs/automation/trigger/#webhook-trigger
   */
  id?: string;

  /**
   * The webhook ID to use, defines the endpoint: /api/webhook/<webhook_id>
   * https://www.home-assistant.io/docs/automation/trigger/#webhook-trigger
   */
  webhook_id: string;

  /**
   * This allows you to define variables that will be set when the trigger fires.
   * These can be used in the automation actions or conditions. Templates
   * can be used in these variables.
   * https://www.home-assistant.io/docs/automation/trigger#trigger-variables
   */
  variables?: Data;

  /**
   * Controls to only allow local requests to trigger the webhook.
   * https://www.home-assistant.io/docs/automation/trigger/#webhook-trigger
   */
  local_only?: boolean;

  /**
   * Controls to only allow requests with a valid API password to trigger the webhook.
   * https://www.home-assistant.io/docs/automation/trigger/#webhook-trigger
   */
  allowed_methods: AllowedMethods[];
}

interface ZoneTrigger {
  /**
   * Alias for the zone trigger.
   */
  alias?: string;

  /**
   * Zone trigger fires when an entity is entering or leaving the zone. For zone automation to work, you need to have setup a device tracker platform that supports reporting GPS coordinates.
   * https://www.home-assistant.io/docs/automation/trigger/#zone-trigger
   */
  trigger?: "zone";

  /**
   * Legacy syntax, use "trigger: zone" instead.
   */
  platform?: LegacySyntax;

  /**
   * Every individual trigger in an automation can be disabled, without removing it.
   * https://www.home-assistant.io/docs/automation/trigger/#disabling-a-trigger
   */
  enabled?: boolean;

  /**
   * An personal identifier for this trigger, that is passed into the trigger
   * variables when the automation triggers using this trigger.
   * https://www.home-assistant.io/docs/automation/trigger/#zone-trigger
   */
  id?: string;

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

  /**
   * This allows you to define variables that will be set when the trigger fires.
   * These can be used in the automation actions or conditions. Templates
   * can be used in these variables.
   * https://www.home-assistant.io/docs/automation/trigger#trigger-variables
   */
  variables?: Data;
}

interface TagTrigger {
  /**
   * Alias for the tag trigger.
   */
  alias?: string;

  /**
   * This trigger fired when a tag is scanned.
   * https://www.home-assistant.io/docs/automation/trigger#tag-trigger
   */
  trigger?: "tag";

  /**
   * Legacy syntax, use "trigger: tag" instead.
   */
  platform?: LegacySyntax;

  /**
   * Every individual trigger in an automation can be disabled, without removing it.
   * https://www.home-assistant.io/docs/automation/trigger/#disabling-a-trigger
   */
  enabled?: boolean;

  /**
   * An personal identifier for this trigger, that is passed into the trigger
   * variables when the automation triggers using this trigger.
   * https://www.home-assistant.io/docs/automation/trigger#tag-trigger
   */
  id?: string;

  /**
   * Identifier of the tag. Use this to decide what to do.
   * https://www.home-assistant.io/docs/automation/trigger#tag-trigger
   */
  tag_id: string | string[];

  /**
   * Device registry identifier of the device that scanned the tag. Use this to decide where to do it.
   * https://www.home-assistant.io/docs/automation/trigger#tag-trigger
   */
  device_id?: string | string[];

  /**
   * This allows you to define variables that will be set when the trigger fires.
   * These can be used in the automation actions or conditions. Templates
   * can be used in these variables.
   * https://www.home-assistant.io/docs/automation/trigger#trigger-variables
   */
  variables?: Data;
}
