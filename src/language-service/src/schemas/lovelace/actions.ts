/**
 * Lovelace Actions
 * Source: https://github.com/home-assistant/frontend/blob/dev/src/data/lovelace.ts
 */
import { Entity, Include } from "../types";

export type Action =
  | CallServiceAction
  | CustomAction
  | MoreInfoAction
  | NavigateAction
  | NoneAction
  | ToggleAction
  | URLAction
  | Include;

interface CallServiceAction {
  /**
   * Action to call a Home Assistant service
   * https://www.home-assistant.io/lovelace/actions/
   */
  action: "call-service";

  /**
   * Service to call (e.g., media_player.media_play_pause)
   * https://www.home-assistant.io/lovelace/actions/#service
   */
  service: string;

  /**
   * Service data to include. Note: Has been replaced by "data".
   * https://www.home-assistant.io/lovelace/actions/#data
   */
  service_data?: ServiceData;

  /**
   * Service data to include (e.g., entity_id: media_player.bedroom).
   * https://www.home-assistant.io/lovelace/actions/#data
   */
  data?: ServiceData;

  /**
   * Present a confirmation dialog to confirm the action. See confirmation object below
   * https://www.home-assistant.io/lovelace/actions/#confirmation
   */
  confirmation?: Confirmation | boolean;
}

interface ServiceData {
  /**
   * Entity ID to target this service call at.
   * https://www.home-assistant.io/lovelace/actions/#service_data
   */
  entity_id?: Entity | Entity[];
  [key: string]: any;
}

/**
 * @TJS-additionalProperties true
 */
interface CustomAction {
  action: "fire-dom-event";

  /**
   * Present a confirmation dialog to confirm the action. See confirmation object below
   * https://www.home-assistant.io/lovelace/actions/#confirmation
   */
  confirmation?: Confirmation;
}

interface MoreInfoAction {
  /**
   * Action to trigger the more info dialog of this entity.
   * https://www.home-assistant.io/lovelace/actions/
   */
  action: "more-info";

  /**
   * Present a confirmation dialog to confirm the action. See confirmation object below
   * https://www.home-assistant.io/lovelace/actions/#confirmation
   */
  confirmation?: Confirmation;
}

interface NavigateAction {
  /**
   * Action to navigate to an another view.
   * https://www.home-assistant.io/lovelace/actions/
   */
  action: "navigate";

  /**
   * Path to navigate to (e.g., /lovelace/0/) when action defined as navigate
   * https://www.home-assistant.io/lovelace/actions/#navigation_path
   */
  navigation_path: string;

  /**
   * Present a confirmation dialog to confirm the action. See confirmation object below
   * https://www.home-assistant.io/lovelace/actions/#confirmation
   */
  confirmation?: Confirmation;
}

interface NoneAction {
  /**
   * Action to do nothing.
   * https://www.home-assistant.io/lovelace/actions/
   */
  action: "none";

  /**
   * Present a confirmation dialog to confirm the action. See confirmation object below
   * https://www.home-assistant.io/lovelace/actions/#confirmation
   */
  confirmation?: Confirmation;
}

interface ToggleAction {
  /**
   * Action to toggle the entity state.
   * https://www.home-assistant.io/lovelace/actions/
   */
  action: "toggle";

  /**
   * Present a confirmation dialog to confirm the action. See confirmation object below
   * https://www.home-assistant.io/lovelace/actions/#confirmation
   */
  confirmation?: Confirmation;
}

interface URLAction {
  /**
   * Action to navigate to an another URL.
   * https://www.home-assistant.io/lovelace/actions/
   */
  action: "url";

  /**
   * Path to navigate to (e.g., /lovelace/0/) when action defined as navigate
   * https://www.home-assistant.io/lovelace/actions/#url_path
   */
  url_path: string;

  /**
   * Present a confirmation dialog to confirm the action. See confirmation object below
   * https://www.home-assistant.io/lovelace/actions/#confirmation
   */
  confirmation?: Confirmation;
}

interface Confirmation {
  /**
   * List of exemption objects.
   * https://www.home-assistant.io/lovelace/actions/#exemptions
   */
  exemptions?: Exemption[];

  /**
   * Text to present in the confirmation dialog.
   * https://www.home-assistant.io/lovelace/actions/#text
   */
  text?: string;
}

type Exemption = UserExemption;

interface UserExemption {
  /**
   * User id that can see the view tab. For each user´s id listed, the confirmation dialog will NOT be shown.
   * https://www.home-assistant.io/lovelace/actions/#user
   */
  user: string;
}
