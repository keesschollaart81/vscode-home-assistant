/**
 * Automation and script actions
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/helpers/config_validation.py
 */
import {
  Area,
  Data,
  Entities,
  Floor,
  IncludeList,
  Integer,
  Label,
  LegacySyntax,
  SceneEntity,
  Template,
  TimePeriod,
} from "../types";
import { Condition } from "./conditions";
import { Trigger } from "./triggers";

export type Action =
  | ChooseAction
  | DelayAction
  | DeviceAction
  | EventAction
  | IfAction
  | ParallelAction
  | RepeatAction
  | SceneAction
  | ServiceAction
  | SequenceAction
  | StopAction
  | WaitForTriggerAction
  | WaitTemplateAction
  | VariablesAction
  | Condition; // A condition is a valid action

export interface ChooseAction {
  /**
   * Alias for the choose action.
   */
  alias?: string;

  /**
   * Every individual action can be disabled, without removing it.
   * https://www.home-assistant.io/docs/scripts/#disabling-an-action
   */
  enabled?: boolean;

  /**
   * Set it to true if you’d like to continue the action sequence, regardless of whether that action encounters an error.
   * https://www.home-assistant.io/docs/scripts/#continuing-on-error
   */
  continue_on_error?: boolean;

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
   * Alias for this choose item.
   */
  alias?: string;

  /**
   * Every individual action can be disabled, without removing it.
   * https://www.home-assistant.io/docs/scripts/#disabling-an-action
   */
  enabled?: boolean;
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
   * Every individual action can be disabled, without removing it.
   * https://www.home-assistant.io/docs/scripts/#disabling-an-action
   */
  enabled?: boolean;

  /**
   * Set it to true if you’d like to continue the action sequence, regardless of whether that action encounters an error.
   * https://www.home-assistant.io/docs/scripts/#continuing-on-error
   */
  continue_on_error?: boolean;

  /**
   * Delays are useful for temporarily suspending your script and start it at a later moment.
   * The time period to delay the executing of the current action sequence for.
   * https://www.home-assistant.io/docs/scripts/#delay
   */
  delay: TimePeriod | Template;
}

/**
 * @TJS-additionalProperties true
 */
export interface DeviceAction {
  /**
   * Alias for the device action.
   */
  alias?: string;

  /**
   * Every individual action can be disabled, without removing it.
   * https://www.home-assistant.io/docs/scripts/#disabling-an-action
   */
  enabled?: boolean;

  /**
   * Set it to true if you’d like to continue the action sequence, regardless of whether that action encounters an error.
   * https://www.home-assistant.io/docs/scripts/#continuing-on-error
   */
  continue_on_error?: boolean;

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
   * Every individual action can be disabled, without removing it.
   * https://www.home-assistant.io/docs/scripts/#disabling-an-action
   */
  enabled?: boolean;

  /**
   * Set it to true if you’d like to continue the action sequence, regardless of whether that action encounters an error.
   * https://www.home-assistant.io/docs/scripts/#continuing-on-error
   */
  continue_on_error?: boolean;

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
   * You can use templates directly in the event_data parameter, replace "event_data_template" with just "event_data".
   * https://www.home-assistant.io/docs/scripts/#fire-an-event
   */
  event_data_template?: LegacySyntax;
}

export interface IfAction {
  /**
   * Alias for the if action.
   */
  alias?: string;

  /**
   * Every individual action can be disabled, without removing it.
   * https://www.home-assistant.io/docs/scripts/#disabling-an-action
   */
  enabled?: boolean;

  /**
   * Set it to true if you’d like to continue the action sequence, regardless of whether that action encounters an error.
   * https://www.home-assistant.io/docs/scripts/#continuing-on-error
   */
  continue_on_error?: boolean;

  /**
   * This action allows you to select a sequence of other actions from a list of sequences.
   * https://www.home-assistant.io/docs/scripts/#if-then
   */
  if: Condition | Condition[] | IncludeList;

  /**
   * An optional default sequence can be included which will be run if none of the sequences from the list are run.
   * https://www.home-assistant.io/docs/scripts/#if-then
   */
  then: Action | Action[] | IncludeList;

  /**
   * An optional default sequence can be included which will be run if none of the sequences from the list are run.
   * https://www.home-assistant.io/docs/scripts/#if-then
   */
  else?: Action | Action[] | IncludeList;
}

export interface ParallelAction {
  /**
   * Alias for the parallel action.
   */
  alias?: string;

  /**
   * Every individual action can be disabled, without removing it.
   * https://www.home-assistant.io/docs/scripts/#disabling-an-action
   */
  enabled?: boolean;

  /**
   * Set it to true if you’d like to continue the action sequence, regardless of whether that action encounters an error.
   * https://www.home-assistant.io/docs/scripts/#continuing-on-error
   */
  continue_on_error?: boolean;

  /**
   * The sequence of actions to run in parallel.
   * https://www.home-assistant.io/docs/scripts/#parallelizing-actions
   */
  parallel: (Action | Action[] | IncludeList)[] | IncludeList;
}

export interface RepeatAction {
  /**
   * Alias for the repeat action.
   */
  alias?: string;

  /**
   * Every individual action can be disabled, without removing it.
   * https://www.home-assistant.io/docs/scripts/#disabling-an-action
   */
  enabled?: boolean;

  /**
   * Set it to true if you’d like to continue the action sequence, regardless of whether that action encounters an error.
   * https://www.home-assistant.io/docs/scripts/#continuing-on-error
   */
  continue_on_error?: boolean;

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
     * This repeat form accepts a list of items to iterate over. The list of items can be a pre-defined list, or a list created by a template.
     * https://www.home-assistant.io/docs/scripts/#for-each
     */
    for_each?: Data | Template | Template[];

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
   * Alias for the scene action.
   */
  alias?: string;

  /**
   * Every individual action can be disabled, without removing it.
   * https://www.home-assistant.io/docs/scripts/#disabling-an-action
   */
  enabled?: boolean;

  /**
   * Set it to true if you’d like to continue the action sequence, regardless of whether that action encounters an error.
   * https://www.home-assistant.io/docs/scripts/#continuing-on-error
   */
  continue_on_error?: boolean;

  /**
   * Activate a scene.
   * https://www.home-assistant.io/docs/scripts/#activate-a-scene
   */
  scene: SceneEntity;

  /**
   * Additional data for merely for use with the frontend. Has no functional effect.
   */
  metadata?: any;
}

export interface SequenceAction {
  /**
   * Alias for the sequence action.
   */
  alias?: string;

  /**
   * Every individual action can be disabled, without removing it.
   * https://www.home-assistant.io/docs/scripts/#disabling-an-action
   */
  enabled?: boolean;

  /**
   * Set it to true if you’d like to continue the action sequence, regardless of whether that action encounters an error.
   * https://www.home-assistant.io/docs/scripts/#continuing-on-error
   */
  continue_on_error?: boolean;

  /**
   * The sequence of actions to run in serial
   * https://www.home-assistant.io/docs/scripts/#grouping-actions
   */
  sequence: Action | Action[] | IncludeList;
}

export interface ServiceAction {
  /**
   * Service call alias.
   * https://www.home-assistant.io/docs/scripts/service-calls/
   */
  alias?: string;

  /**
   * Every individual action can be disabled, without removing it.
   * https://www.home-assistant.io/docs/scripts/#disabling-an-action
   */
  enabled?: boolean;

  /**
   * Set it to true if you’d like to continue the action sequence, regardless of whether that action encounters an error.
   * https://www.home-assistant.io/docs/scripts/#continuing-on-error
   */
  continue_on_error?: boolean;

  /**
   * Legacy syntax, use "action" instead.
   */
  service?: LegacySyntax;

  /**
   * The most important action is to call an action.
   * https://www.home-assistant.io/docs/scripts/service-calls/
   */
  action?: string;

  /**
   * You can use templates directly in the service parameter, replace "service_template" with just "service".
   * https://www.home-assistant.io/docs/scripts/service-calls/#use-templates-to-decide-which-service-to-call
   */
  service_template?: LegacySyntax;

  /**
   * Specify other parameters beside the entity to target. For example, the light turn on service allows specifying the brightness.
   * https://www.home-assistant.io/docs/scripts/service-calls/#passing-data-to-the-service-call
   */
  data?: Data | Template;

  /**
   * You can use templates directly in the data parameter, replace "data_template" with just "data".
   * https://www.home-assistant.io/docs/scripts/service-calls/#use-templates-to-determine-the-attributes
   */
  data_template?: LegacySyntax;

  /**
   * The entity (or entities) to execute this service call on.
   * https://www.home-assistant.io/docs/scripts/service-calls
   */
  entity_id?: Entities | "all" | "none" | null | Template;

  /**
   * Defines the target (area(s), device(s) and entitie(s)) to execute this service call on.
   * https://www.home-assistant.io/docs/scripts/service-calls
   */
  target?:
    | {
        /**
         * The entity (or entities) to execute this service call on.
         * https://www.home-assistant.io/docs/scripts/service-calls
         */
        entity_id?: Entities | "all" | "none" | null | Template;

        /**
         * The device (or devices) to execute this service call on.
         * https://www.home-assistant.io/docs/scripts/service-calls
         */
        device_id?: string | string[] | "none" | Template;

        /**
         * The area (or areas) to execute this service call on.
         * https://www.home-assistant.io/docs/scripts/service-calls
         */
        area_id?: Area | Area[] | "none";

        /**
         * The floor (or floors) to execute this service call on.
         * https://www.home-assistant.io/docs/scripts/service-calls
         */
        floor_id?: Floor | Floor[] | "none";

        /**
         * The labels (or labels) to execute this service call on.
         * https://www.home-assistant.io/docs/scripts/service-calls
         */
        label_id?: Label | Label[] | "none";
      }
    | Template;

  /**
   * Additional data for merely for use with the frontend. Has no functional effect.
   */
  metadata?: any;

  /**
   * Add a response_variable to pass a variable of key/value pairs back to an automation or script.
   * https://www.home-assistant.io/docs/scripts/service-calls/#use-templates-to-handle-response-data
   */
  response_variable?: string;
}

export interface StopAction {
  /**
   * Stop call alias.
   * https://www.home-assistant.io/docs/scripts/#stopping-a-script-sequence
   */
  alias?: string;

  /**
   * Every individual action can be disabled, without removing it.
   * https://www.home-assistant.io/docs/scripts/#disabling-an-action
   */
  enabled?: boolean;

  /**
   * Stop a automation or script sequence. Provide a text with a reason for stopping.
   * https://www.home-assistant.io/docs/scripts/#stopping-a-script-sequence
   */
  stop: string | null;

  /**
   * Set to true, if we are stopping with an error / because of unexpected behavior
   * https://www.home-assistant.io/docs/scripts/#stopping-a-script-sequence
   */
  error?: boolean;

  /**
   * Add a response_variable to pass a variable of key/value pairs back to an automation or script
   * https://www.home-assistant.io/docs/scripts/#stopping-a-script-sequence
   */
  response_variable?: string;
}

export interface WaitForTriggerAction {
  /**
   * Alias for the wait for trigger action.
   */
  alias?: string;

  /**
   * Every individual action can be disabled, without removing it.
   * https://www.home-assistant.io/docs/scripts/#disabling-an-action
   */
  enabled?: boolean;

  /**
   * Set it to true if you’d like to continue the action sequence, regardless of whether that action encounters an error.
   * https://www.home-assistant.io/docs/scripts/#continuing-on-error
   */
  continue_on_error?: boolean;

  /**
   * The trigger to wait for, before continuing execution of the script.
   * https://www.home-assistant.io/docs/scripts/#wait-for-trigger
   */
  wait_for_trigger?: Trigger | Trigger[] | IncludeList;

  /**
   * Set a timeout after which the script will continue its execution if the trigger has not occurred.
   * https://www.home-assistant.io/docs/scripts/#wait-for-trigger
   */
  timeout?: TimePeriod;

  /**
   * Continue the execute of the action sequence on time out or not.
   * https://www.home-assistant.io/docs/scripts/#wait-for-trigger
   */
  continue_on_timeout?: boolean;
}

export interface WaitTemplateAction {
  /**
   * Alias for the wait action.
   */
  alias?: string;

  /**
   * Every individual action can be disabled, without removing it.
   * https://www.home-assistant.io/docs/scripts/#disabling-an-action
   */
  enabled?: boolean;

  /**
   * Set it to true if you’d like to continue the action sequence, regardless of whether that action encounters an error.
   * https://www.home-assistant.io/docs/scripts/#continuing-on-error
   */
  continue_on_error?: boolean;

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

export interface VariablesAction {
  /**
   * Alias for the variables action.
   */
  alias?: string;

  /**
   * Every individual action can be disabled, without removing it.
   * https://www.home-assistant.io/docs/scripts/#disabling-an-action
   */
  enabled?: boolean;

  /**
   * Set it to true if you’d like to continue the action sequence, regardless of whether that action encounters an error.
   * https://www.home-assistant.io/docs/scripts/#continuing-on-error
   */
  continue_on_error?: boolean;

  /**
   * The variable command allows you to set/override variables that will be accessible by templates in actions after it.
   * https://www.home-assistant.io/docs/scripts/#variables
   */
  variables: Data;
}
