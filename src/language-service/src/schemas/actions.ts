/**
 * Automation and script actions
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/helpers/config_validation.py
 */
import {
  Data,
  DataTemplate,
  Entity,
  EntityScene,
  IncludeList,
  Integer,
  Template,
  TimePeriod,
} from "./types";
import { Condition } from "./conditions";

export type Action =
  | ChooseAction
  | DelayAction
  | DeviceAction
  | EventAction
  | RepeatAction
  | SceneAction
  | ServiceAction
  | WaitTemplateAction
  | Condition; // A condition is a valid action

export interface ChooseAction {
  /**
   * Alias for the choose action.
   */
  alias?: string;

  /**
   * This action allows you to select a sequence of other actions from a list of sequences.
   * https://www.home-assistant.io/docs/scripts/#choose-a-group-of-actions
   */
  choose: ChooseActionItem | ChooseActionItem[] | IncludeList;

  /**
   * An optional default sequence can be included which will be run if none of the sequences from the list are run.
   * https://www.home-assistant.io/docs/scripts/#choose-a-group-of-actions
   */
  default?: Action | Action[] | IncludeList;
}

export interface ChooseActionItem {
  /**
   * Only preform the sequence of actions if this condition/these conditions match.
   * https://www.home-assistant.io/docs/scripts/#choose-a-group-of-actions
   */
  conditions: Condition | Condition[] | IncludeList;

  /**
   * The sequence of actions to be performed if the condition(s) match.
   * https://www.home-assistant.io/docs/scripts/#choose-a-group-of-actions
   */
  sequence: Action | Action[] | IncludeList;
}

export interface DelayAction {
  /**
   * Alias for the delay action.
   */
  alias?: string;

  /**
   * Delays are useful for temporarily suspending your script and start it at a later moment.
   * The time period to delay the executing of the current action sequence for.
   * https://www.home-assistant.io/docs/scripts/#delay
   */
  delay: TimePeriod | Template;
}

export interface DeviceAction {
  /**
   * The internal ID of the device to execute an action on.
   * Device actions encompass a set of events that are defined by an integration.
   * In contrast to service calls, device actions are tied to a device and not necessarily an entity. To use a device action, set up an automation through the browser frontend.
   */
  device_id: string;

  /**
   * The integration domain this device trigger is provided by.
   */
  domain: string;
}

export interface EventAction {
  /**
   * Alias for the Event action.
   */
  alias?: string;

  /**
   * The event name to fire.
   * This action allows you to fire an event. Events can be used for many things. It could trigger an automation or indicate to another integration that something is happening.
   * https://www.home-assistant.io/docs/scripts/#fire-an-event
   */
  event: string;

  /**
   * The event data to pass along.
   * https://www.home-assistant.io/docs/scripts/#fire-an-event
   */
  event_data?: Data;

  /**
   * The event data to pass along, using script template.
   * https://www.home-assistant.io/docs/scripts/#fire-an-event
   */
  event_data_template?: DataTemplate;
}

export interface RepeatAction {
  /**
   * Alias for the repeat action.
   */
  alias?: string;

  /**
   * This action allows you to repeat a sequence of other actions.
   * https://www.home-assistant.io/docs/scripts/#repeat-a-group-of-actions
   */
  repeat: {
    /**
     * This form accepts a count value. The value may be specified by a template, in which case the template is rendered when the repeat step is reached.
     * https://www.home-assistant.io/docs/scripts/#counted-repeat
     */
    count?: Integer | Template;

    /**
     * The sequence of actions to be repeatedly performed in the script.
     * https://www.home-assistant.io/integrations/script/#sequence
     */
    sequence: Action | Action[] | IncludeList;

    /**
     * This form accepts a list of conditions that are evaluated after each time the sequence is run. Therefore the sequence will always run at least once. The sequence will be executed until the condition(s) evaluate to true.
     * https://www.home-assistant.io/docs/scripts/#repeat-until
     */
    until?: Condition | Condition[] | IncludeList;

    /**
     * This form accepts a list of conditions that are evaluated before each time the sequence is run. The sequence will be repeated as long as the condition(s) evaluate to true.
     * https://www.home-assistant.io/docs/scripts/#while-loop
     */
    while?: Condition | Condition[] | IncludeList;
  };
}

export interface SceneAction {
  /**
   * Activate a scene.
   * https://www.home-assistant.io/docs/scripts/#activate-a-scene
   */
  scene: EntityScene;
}

export interface ServiceAction {
  /**
   * Service call alias.
   * https://www.home-assistant.io/docs/scripts/service-calls/
   */
  alias?: string;

  /**
   * The most important action is the action to call a service.
   * https://www.home-assistant.io/docs/scripts/service-calls/
   */
  service?: string;

  /**
   * Allow the service to call to be generated from a template.
   * https://www.home-assistant.io/docs/scripts/service-calls/#use-templates-to-decide-which-service-to-call
   */
  service_template?: Template;

  /**
   * Specify other parameters beside the entity to target. For example, the light turn on service allows specifying the brightness.
   * https://www.home-assistant.io/docs/scripts/service-calls/#passing-data-to-the-service-call
   */
  data?: Data;

  /**
   * Specify other parameters based on templates.
   * https://www.home-assistant.io/docs/scripts/service-calls/#use-templates-to-determine-the-attributes
   */
  data_template?: DataTemplate;

  /**
   * The entity (or entities) to execute this service call on.
   * https://www.home-assistant.io/docs/scripts/service-calls
   */
  entity_id?: Entity | Entity[] | "all" | "none" | null;
}

export interface WaitTemplateAction {
  /**
   * Alias for the wait action.
   */
  alias?: string;

  /**
   * Wait until some things are complete.
   * https://www.home-assistant.io/docs/scripts/#wait
   */
  wait_template: Template;

  /**
   * Set a timeout after which the script will continue its execution if the condition is not satisfied.
   * https://www.home-assistant.io/docs/scripts/#wait
   */
  timeout?: TimePeriod;

  /**
   * Continue the execute of the action sequence on time out or not.
   * https://www.home-assistant.io/docs/scripts/#wait
   */
  continue_on_timeout?: boolean;
}
