/**
 * Group integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/automation/__init__.py
 */
import { Data, IncludeNamed, IncludeList, PositiveInteger } from "../../types";
import { Action } from "../actions";
import { Selector } from "../selectors";

export type Domain = "script";
type Item = ScriptItem | BlueprintItem;
export type File = Schema | ScriptItem | BlueprintItem;
export interface Schema {
  [key: string]: Item | IncludeNamed;
}

type Mode = "single" | "restart" | "queued" | "parallel";

interface BaseItem {
  /**
   * Alias will be used to generate an entity_id from.
   * https://www.home-assistant.io/integrations/script/#alias
   */
  alias?: string;

  /**
   * Description of the automation.
   * This is helpful to know what the automation does.
   * https://www.home-assistant.io/integrations/script/#description
   */
  description?: string;

  /**
   * A list of variables that can be passed into this script when calling it. They become available within the templates in that script.
   * https://www.home-assistant.io/integrations/script/#passing-variables-to-scripts
   */
  fields?: {
    [key: string]: Field;
  };

  /**
   * The icon that shows in the frontend.
   * https://www.home-assistant.io/integrations/script/#icon
   */
  icon?: string;

  /**
   * Controls maximum number of runs executing and/or queued up to run at a time. Only valid with modes queued and parallel.
   * https://www.home-assistant.io/integrations/script/#max
   *
   * @TJS-type integer
   */
  max?: number;

  /**
   * Controls what happens when script is invoked while it is still running from one or more previous invocations.
   * https://www.home-assistant.io/integrations/script/#script-modes
   */
  mode?: Mode;

  /**
   * When `max` is exceeded (which is effectively 1 for `single` mode) a log message will be emitted to indicate this has happened. This controls the severity level of that log message
   * https://www.home-assistant.io/integrations/script/#script-modes
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
   * Controls tracing settings of this script.
   * https://www.home-assistant.io/docs/automation/troubleshooting
   */
  trace?: {
    /**
     * The number of automation traces tha are stored for this script.
     */
    stored_traces?: PositiveInteger;
  };

  /**
   * Variables that will be available inside your templates.
   * https://www.home-assistant.io/integrations/script/#variables
   */
  variables?: Data;
}

interface Field {
  /**
   * Marks if this script parameter is an advanced usage parameter.
   * https://www.home-assistant.io/integrations/script/#advanced
   */
  advanced?: boolean;

  /**
   * The default value of this parameter field.
   * https://www.home-assistant.io/integrations/script/#default
   */
  default?: any;

  /**
   * Description of this script parameter.
   * https://www.home-assistant.io/integrations/script/#description
   */
  description?: string;

  /**
   * An example value for this script paramter.
   * https://www.home-assistant.io/integrations/script/#example
   */
  example?: string;

  /**
   * The name of the script parameter field.
   * https://www.home-assistant.io/integrations/script/#name
   */
  name?: string;

  /**
   * Marks if this script parameter is an advanced usage parameter.
   * https://www.home-assistant.io/integrations/script/#advanced
   */
  required?: boolean;

  /**
   * The UI selector to use for this script parameter field.
   * https://www.home-assistant.io/integrations/script/#selector
   */
  selector?: Selector;
}

export interface ScriptItem extends BaseItem {
  /**
   * The sequence of actions to be performed in the script.
   * https://www.home-assistant.io/integrations/script/#sequence
   */
  sequence: Action | Action[] | IncludeList;
}

interface BlueprintItem extends BaseItem {
  use_blueprint: {
    path: string;
    input?: { [key: string]: any };
  };

  /**
   * The sequence of actions to be performed in the script.
   * https://www.home-assistant.io/integrations/script/#sequence
   */
  sequence?: Action | Action[] | IncludeList;
}
