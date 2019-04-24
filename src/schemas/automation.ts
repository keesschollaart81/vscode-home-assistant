

export type Automations = Array<Automation>;

export interface Automation {
  id?: string;
  alias?: string;
  initial_state?: boolean;
  hide_entity?: boolean;
  trigger: Trigger;
  condition?: ConditionsConfig;
  action: Action;
}
export interface Trigger {
  platform: string;
  event_type?: string;
  event_data?: any;
  value_template?: string;
}
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
export interface TemplateConditionSchema {
  condition: "template";
  value_template?: string;
} 
export interface AndConditionSchema {
  condition: "and";
  conditions:  ConditionsConfig;
} 
export type ConditionsConfig = 
  AndConditionSchema
  | NumericStateConditionSchema
  | TemplateConditionSchema
  | Array <
    AndConditionSchema
    | NumericStateConditionSchema 
    | TemplateConditionSchema>;