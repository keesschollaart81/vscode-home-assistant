

export type Automations = Array<Automation>;

export interface Automation {
  id?: string;
  alias?: string;
  initial_state?: boolean;
  trigger: Trigger;
  condition?: Condition;
  action: Action;
}
export interface Trigger {
  platform: string;
  event_type?: string;
  event_data?: any;
  value_template?: string;
}
export interface Condition {
  condition: string;
  conditions?: Condition;
  value_template?: string;
  entity_id?: string;
}
export interface Action {
  service: string;
  data?: any;
  
}