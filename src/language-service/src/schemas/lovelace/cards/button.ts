/**
 * Lovelace Button Card
 * Sources:
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/hui-button-card.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/types.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/data/lovelace.ts
 */
import { Entity } from "../../types";
import { Action } from "../actions";
import { ViewLayout } from "../types";

export interface Schema {
  /**
   * The Alarm Panel card allows you to Arm and Disarm your alarm control panel integrations.
   * https://www.home-assistant.io/lovelace/button/
   */
  type: "button";

  /**
   * The action taken on card double-tap.
   * https://www.home-assistant.io/lovelace/button/#double_tap_action
   */
  double_tap_action?: Action;

  /**
   * The entity ID the card interacts with, for example, light.living_room.
   * https://www.home-assistant.io/lovelace/button/#entity
   */
  entity?: Entity;

  /**
   * The action taken on card tap and hold.
   * https://www.home-assistant.io/lovelace/button/#hold_action
   */
  hold_action?: Action;

  /**
   * The height of the icon. Any CSS value may be used.
   * https://www.home-assistant.io/lovelace/button/#icon_height
   */
  icon_height?: string;

  /**
   * The icon that is displayed on the card. It defaults to the entity domain icon only if the card interacts with an entity. Otherwise, if not configured, no icon is displayed.
   * https://www.home-assistant.io/lovelace/button/#icon
   */
  icon?: string;

  /**
   * The button name that is displayed on the card. It defaults to the entity name only if the card interacts with an entity. Otherwise, if not configured, no name is displayed.
   * https://www.home-assistant.io/lovelace/button/#name
   */
  name?: string;

  /**
   * If false, the icon is not shown on the card.
   * https://www.home-assistant.io/lovelace/button/#show_icon
   */
  show_icon?: boolean;

  /**
   * If false, the button name is not shown on the card.
   * https://www.home-assistant.io/lovelace/button/#show_name
   */
  show_name?: boolean;

  /**
   * If false, the button state is not shown on the card.
   * https://www.home-assistant.io/lovelace/button/#show_state
   */
  show_state?: boolean;

  /**
   * If false, the icon does not change color when the entity is active.
   * https://www.home-assistant.io/lovelace/button/#state_color
   */
  state_color?: boolean;

  /**
   * The action taken on card tap.
   * https://www.home-assistant.io/lovelace/button/#tap_action
   */
  tap_action?: Action;

  /**
   * The card theme, which may be set to any theme from the themes.yaml file.
   * https://www.home-assistant.io/lovelace/button/#theme
   */
  theme?: string;

  /**
   * Layout options for the view this card is in
   */
  view_layout?: ViewLayout;
}
