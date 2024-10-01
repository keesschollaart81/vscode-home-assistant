/**
 * Automation integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/automation/__init__.py
 */
import {
  Data,
  DynamicTemplate,
  IncludeList,
  PositiveInteger,
} from "../../types";
import { Action } from "../actions";
import { Condition } from "../conditions";
import { Trigger } from "../triggers";

export type Domain = "automation";
export type Schema = Item[] | IncludeList;
export type File = Item | Item[];

export type Mode = "single" | "parallel" | "queued" | "restart";
type Item = AutomationItem | BlueprintItem;

interface BaseItem {
  /**
   * A unique identifier for this automation.
   * Do not use the same twice, ever!
   * https://www.home-assistant.io/docs/automation/
   */
  id?: string;

  /**
   * Alias will be used to generate an entity_id from.
   * https://www.home-assistant.io/docs/automation/
   */
  alias?: string;

  /**
   * Description of the automation.
   * This is helpful to know what the automation does.
   * https://www.home-assistant.io/docs/automation/
   */
  description?: string;

  /**
   * When you create a new automation, it will be enabled unless you explicitly add initial_state: false to it or turn it off manually via UI/another automation/developer tools.
   * In case automations need to be always enabled or disabled when Home Assistant starts, then you can set the initial_state in your automations. Otherwise, the previous state will be restored.
   * https://www.home-assistant.io/docs/automation/yaml/#initial_state
   */
  initial_state?: boolean;

  /**
   * For both queued and parallel modes, configuration option max controls the maximum number of runs that can be executing and/or queued up at a time. The default is 10.
   * https://www.home-assistant.io/docs/automation/modes/
   *
   * @minimum 2
   */
  max?: number;

  /**
   * The automation’s mode configuration option controls what happens when the automation is triggered while the actions are still running from a previous trigger.
   * https://www.home-assistant.io/docs/automation/modes/
   */
  mode?: Mode;

  /**
   * When `max` is exceeded (which is effectively 1 for `single` mode) a log message will be emitted to indicate this has happened. This controls the severity level of that log message
   * https://www.home-assistant.io/docs/automation/modes/
   */
  max_exceeded?:
    | "silent"
    | "notset"
    | "debug"
    | "info"
    | "warn"
    | "warning"
    | "error"
    | "fatal"
    | "critical";

  /**
   * Controls tracing settings of this automation.
   * https://www.home-assistant.io/docs/automation/troubleshooting
   */
  trace?: {
    /**
     * The number of automation traces tha are stored for this automation.
     * https://www.home-assistant.io/docs/automation/yaml/#number-of-debug-traces-stored
     */
    stored_traces?: PositiveInteger;
  };

  /**
   * Variables that will be available inside your templates and conditions.
   * https://www.home-assistant.io/docs/automation/basics/
   */
  variables?: Data;

  /**
   * Conditions are optional tests that can limit an automation rule to only work in your specific use cases. A condition will test against the current state of the system. This includes the current time, devices, people and other things like the sun.
   * https://www.home-assistant.io/docs/automation/basics/
   */
  condition?: Condition | Condition[] | DynamicTemplate | IncludeList;

  /**
   * Conditions are optional tests that can limit an automation rule to only work in your specific use cases. A condition will test against the current state of the system. This includes the current time, devices, people and other things like the sun.
   * https://www.home-assistant.io/docs/automation/basics/
   */
  conditions?: Condition | Condition[] | DynamicTemplate | IncludeList;
}

export interface AutomationItem extends BaseItem {
  /**
   * Triggers describe events that should trigger the automation rule.
   * https://www.home-assistant.io/docs/automation/basics/
   */
  trigger?: Trigger | Trigger[] | IncludeList;

  /**
   * Triggers describe events that should trigger the automation rule.
   * https://www.home-assistant.io/docs/automation/basics/
   */
  triggers?: Trigger | Trigger[] | IncludeList;

  /**
   * Available in trigger templates with the difference that only limited templates can be used to pass a value to the trigger variable.
   * https://www.home-assistant.io/docs/automation/trigger#trigger-variables
   */
  trigger_variables?: Data;

  /**
   * The action(s) which will be performed when a rule is triggered and all conditions are met. For example, it can turn a light on, set the temperature on your thermostat or activate a scene.
   * https://www.home-assistant.io/docs/automation/basics/
   */
  action?: Action | Action[] | IncludeList;

  /**
   * The action(s) which will be performed when a rule is triggered and all conditions are met. For example, it can turn a light on, set the temperature on your thermostat or activate a scene.
   * https://www.home-assistant.io/docs/automation/basics/
   */
  actions?: Action | Action[] | IncludeList;
}

interface BlueprintItem extends BaseItem {
  use_blueprint: {
    path: string;
    input?: { [key: string]: any };
  };

  /**
   * Triggers describe events that should trigger the automation rule.
   * https://www.home-assistant.io/docs/automation/basics/
   */
  trigger?: Trigger | Trigger[] | IncludeList;

  /**
   * Triggers describe events that should trigger the automation rule.
   * https://www.home-assistant.io/docs/automation/basics/
   */
  triggers?: Trigger | Trigger[] | IncludeList;

  /**
   * The action(s) which will be performed when a rule is triggered and all conditions are met. For example, it can turn a light on, set the temperature on your thermostat or activate a scene.
   * https://www.home-assistant.io/docs/automation/basics/
   */
  action?: Action | Action[] | IncludeList;

  /**
   * The action(s) which will be performed when a rule is triggered and all conditions are met. For example, it can turn a light on, set the temperature on your thermostat or activate a scene.
   * https://www.home-assistant.io/docs/automation/basics/
   */
  actions?: Action | Action[] | IncludeList;
}
