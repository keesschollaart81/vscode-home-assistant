/**
 * Group integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/automation/__init__.py
 */
import { IncludeNamed, IncludeList } from "../types";
import { Action } from "../actions";

export type Domain = "script";
export interface Schema {
  [key: string]: Item | IncludeNamed;
}

type Mode = "single" | "restart" | "queued" | "parallel";

interface Item {
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
   * The sequence of actions to be performed in the script.
   * https://www.home-assistant.io/integrations/script/#sequence
   */
  sequence: Action | Action[] | IncludeList;
}

interface Field {
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
}
