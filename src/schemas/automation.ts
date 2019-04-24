

export type Automations = Array<Automation>;

export interface Automation {
  id?: string;
  alias?: string;
  initial_state?: boolean;
  hide_entity?: boolean;
  trigger: Triggers;
  condition?: ConditionsConfig;
  action: Action | Array<Action>;
}

export interface HaTrigger {
  platform: "homeassistant";
  event: "start" | "shutdown";
}
export interface SunTrigger {
  platform: "sun";
  event: "sunset" | "sunrise";
  offset?: string;
}
export interface TimeTrigger {
  platform: "time";
  at: string;
}
export interface TemplateTrigger {
  platform: "template";
  value_template: string;
}
export interface WebhookTrigger {
  platform: "webhook";
  webhook_id: string;
}
export interface EventTrigger {
  platform: "event";
  event_type: string;
  event_data?: any;
}
export interface TimePatternTrigger {
  platform: "time_pattern";
  hours?: string;
  minutes?: string | number;
  seconds?: string | number;
}
export interface MqttTrigger {
  platform: "mqtt";
  topic: string;
  payload?: string;
  encoding?: string;
}
export interface GeoLocationTrigger {
  platform: "geo_location";
  source: string;
  zone: string;
  event: "enter" | "leave";
}
export interface StateTrigger {
  platform: "state";
  entity_id: string;
  from?: string | boolean;
  to?: string | boolean;
  for?: string | StateTriggerFor;
}
export interface StateTriggerFor {
  days?: string | number;
  hours?: string | number;
  minutes?: string | number;
  seconds?: string | number;
  milliseconds?: string | number;
}
export interface ZoneTrigger {
  platform: "zone";
  entity_id: string;
  zone: string;
  event: "enter" | "leave";
}

export interface NumericStateTrigger {
  platform: "numeric_state";
  entity_id: string;
  below?: string;
  above?: string;
  value_template?: string;
  for?: string;
}

export type Triggers =
  HaTrigger
  | SunTrigger
  | TimeTrigger
  | TemplateTrigger
  | WebhookTrigger
  | EventTrigger
  | TimePatternTrigger
  | MqttTrigger
  | GeoLocationTrigger
  | StateTrigger
  | ZoneTrigger
  | NumericStateTrigger
  | Array<
    HaTrigger
    | SunTrigger
    | TimeTrigger
    | TemplateTrigger
    | WebhookTrigger
    | EventTrigger
    | TimePatternTrigger
    | MqttTrigger
    | GeoLocationTrigger
    | StateTrigger
    | ZoneTrigger
    | NumericStateTrigger
  >;

export interface Action {
  service: string;
  data?: any;

}

export interface NumericStateConditionSchema {
  condition: "numeric_state";
  entity_id: string;
  below: number;
  above: number;
  value_template?: string;
}

export interface StateConditionSchema {
  condition: "state";
  entity_id: string;
  state: string;
  for?: string;
  from?: string;
}

export interface SunConditionSchema {
  condition: "sun";
  before?: string;
  before_offset?: string;
  after?: string;
  after_offset?: string;
}

export interface TemplateConditionSchema {
  condition: "template";
  value_template?: string;
}

export interface TimeConditionSchema {
  condition: "time";
  before?: string;
  after?: string;
  weekday?: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
}

export interface ZoneConditionSchema {
  condition: "zone";
  entity_id: string;
  zone?: string;
}
export interface AndConditionSchema {
  condition: "and";
  conditions: ConditionsConfig;
}

export interface OrConditionSchema {
  condition: "or";
  conditions: ConditionsConfig;
}

export type ConditionsConfig =
  NumericStateConditionSchema
  | StateConditionSchema
  | SunConditionSchema
  | TemplateConditionSchema
  | TimeConditionSchema
  | ZoneConditionSchema
  | AndConditionSchema
  | OrConditionSchema
  | Array<
    NumericStateConditionSchema
    | StateConditionSchema
    | SunConditionSchema
    | TemplateConditionSchema
    | TimeConditionSchema
    | ZoneConditionSchema
    | AndConditionSchema
    | OrConditionSchema
  >;