/**
 * Blueprint integration
 * Source:
 * - https://github.com/home-assistant/core/blob/dev/homeassistant/components/blueprint/__init__.py
 * - https://github.com/home-assistant/core/blob/dev/homeassistant/components/blueprint/models.py
 * - https://github.com/home-assistant/core/blob/dev/homeassistant/components/blueprint/schemas.py
 */
import { Data, Deprecated, IncludeList } from "../../types";
import { Selector } from "../selectors";
import { Mode } from "./automation";
import { Action } from "../actions";
import { Condition } from "../conditions";
import { Trigger } from "../triggers";

export type Domain = "blueprint";
export type Schema = null;

export interface AutomationBlueprintFile {
  /**
   * The blueprint schema.
   * https://www.home-assistant.io/docs/blueprint/schema/#the-blueprint-schema
   */
  blueprint: AutomationBlueprint;
}

// export interface AutomationBlueprint extends AutomationItem, Blueprint {}

interface Blueprint {
  /**
   * The description of the blueprint. While optional, this field is highly recommended. The description can include Markdown.
   * https://www.home-assistant.io/docs/blueprint/schema/#description
   */
  description?: string;

  /**
   * The domain name this blueprint provides a blueprint for.
   * https://www.home-assistant.io/docs/blueprint/schema/#domain
   */
  domain: string;

  /**
   * Home Assistant requirements for this Blueprint.
   */
  homeassistant?: {
    /**
     * The minimal version number of Home Assistant Core that is needed for this Blueprint.
     */
    min_version?: string;
  };

  /**
   * These are the input fields that the consumer of your blueprint can provide using YAML definition, or via a configuration form in the UI.
   * https://www.home-assistant.io/docs/blueprint/schema/#input
   */
  input?: {
    [key: string]: BlueprintInputSchema;
  };

  /**
   * The name of the blueprint. Keep this short and descriptive.
   * https://www.home-assistant.io/docs/blueprint/schema/#name
   */
  name: string;

  /**
   * The URL to the online location where this Blueprint was imported from. Generally there is no need to add this, in the future this might be used for updating Blueprints.
   */
  source_url?: string;
}

interface BlueprintInputSchema {
  /**
   * The name of the input field.
   * https://www.home-assistant.io/docs/blueprint/schema/#name
   */
  name?: string;

  /**
   * A short description of the input field. Keep this short and descriptive.
   * https://www.home-assistant.io/docs/blueprint/schema/#description
   */
  description?: string;

  /**
   * The default value of this input, in case the input is not provided by the user of this blueprint.
   * https://www.home-assistant.io/docs/blueprint/schema/#default
   */
  default?: string;

  /**
   * The default value of this input, in case the input is not provided by the user of this blueprint.
   * https://www.home-assistant.io/docs/blueprint/schema/#default
   */
  selector?: Selector;
}

export interface AutomationBlueprint extends Blueprint {
  /**
   * A unique identifier for this automation.
   * Do not use the same twice, ever!
   * https://www.home-assistant.io/docs/automation/
   */
  id?: string;

  /**
   * The domain name this blueprint provides a blueprint for.
   * https://www.home-assistant.io/docs/blueprint/schema/#domain
   */
  domain: "automation";

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
   * DEPRECATED since Home Assistant 0.112.
   * This option has no effect. Please remove it from your configuration.
   */
  hide_entity?: Deprecated;

  /**
   * When you create a new automation, it will be enabled unless you explicitly add initial_state: false to it or turn it off manually via UI/another automation/developer tools.
   * In case automations need to be always enabled or disabled when Home Assistant starts, then you can set the initial_state in your automations. Otherwise, the previous state will be restored.
   * https://www.home-assistant.io/docs/automation/#automation-initial-state
   */
  initial_state?: boolean;

  /**
   * For both queued and parallel modes, configuration option max controls the maximum number of runs that can be executing and/or queued up at a time. The default is 10.
   * https://www.home-assistant.io/docs/automation/#automation-modes
   *
   * @minimum 2
   */
  max?: number;

  /**
   * The automation’s mode configuration option controls what happens when the automation is triggered while the actions are still running from a previous trigger.
   * https://www.home-assistant.io/docs/automation/#automation-modes
   */
  mode?: Mode;

  /**
   * When `max` is exceeded (which is effectively 1 for `single` mode) a log message will be emitted to indicate this has happened. This controls the severity level of that log message
   * https://www.home-assistant.io/docs/automation/#automation-modes
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
   * Variables that will be available inside your templates and conditions.
   * https://www.home-assistant.io/docs/automation/#automation-basics
   */
  variables?: Data;

  /**
   * Conditions are optional tests that can limit an automation rule to only work in your specific use cases. A condition will test against the current state of the system. This includes the current time, devices, people and other things like the sun.
   * https://www.home-assistant.io/docs/automation/#automation-basics
   */
  condition?: Condition | Condition[] | IncludeList;

  /**
   * Triggers describe events that should trigger the automation rule.
   * https://www.home-assistant.io/docs/automation/#automation-basics
   */
  trigger: Trigger | Trigger[] | IncludeList;

  /**
   * The action(s) which will be performed when a rule is triggered and all conditions are met. For example, it can turn a light on, set the temperature on your thermostat or activate a scene.
   * https://www.home-assistant.io/docs/automation/#automation-basics
   */
  action: Action | Action[] | IncludeList;
}
