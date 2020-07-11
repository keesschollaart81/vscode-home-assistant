/**
 * Automation and script actions
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/helpers/config_validation.py
 */
import { Entity, EntityScene, Template, TimePeriod } from "./types";
import { Condition } from "./conditions";

export type Action =
  | DelayAction
  | DeviceAction
  | EventAction
  | SceneAction
  | ServiceAction
  | WaitTemplateAction
  | Condition; // A condition is a valid action

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
  event_data?: {
    [key: string]: any;
  };

  /**
   * The event data to pass along, using script template.
   * https://www.home-assistant.io/docs/scripts/#fire-an-event
   */
  event_data_template?: {
    [key: string]: Template;
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
  data?: {
    [key: string]: any;
  };

  /**
   * Specify other parameters based on templates.
   * https://www.home-assistant.io/docs/scripts/service-calls/#use-templates-to-determine-the-attributes
   */
  data_template?: {
    [key: string]: Template;
  };

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
