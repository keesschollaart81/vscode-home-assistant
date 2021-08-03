/**
 * Lovelace Picture Card
 * Sources:
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/hui-picture-card.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/types.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/data/lovelace.ts
 */

import { Action } from "../actions";
import { ViewLayout } from "../types";

export interface Schema {
  /**
   * The Picture card allows you to set an image to use for navigation to various paths in your interface or to call a service.
   * https://www.home-assistant.io/lovelace/picture/
   */
  type: "picture";

  /**
   * Action taken on card double tap.
   * https://www.home-assistant.io/lovelace/picture/#double_tap_action
   */
  double_tap_action?: Action;

  /**
   * Action taken on card tap and hold.
   * https://www.home-assistant.io/lovelace/picture/#hold_action
   */
  hold_action?: Action;

  /**
   * The URL of an image.
   * https://www.home-assistant.io/lovelace/picture/#image
   */
  image: string;

  /**
   * The URL of an image.
   * https://www.home-assistant.io/lovelace/picture/#tap_action
   */
  tap_action?: Action;

  /**
   * Set to any theme within themes.yaml.
   * https://www.home-assistant.io/lovelace/picture/#theme
   */
  theme?: string;

  /**
   * Layout options for the view this card is in
   */
  view_layout?: ViewLayout;
}
