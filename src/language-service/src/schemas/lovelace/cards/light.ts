/**
 * Lovelace Light Card
 * Sources:
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/hui-light-card.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/types.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/data/lovelace.ts
 */
import { Action } from "../actions";
import { LightEntity } from "../../types";
import { ViewLayout } from "../types";

export interface Schema {
  /**
   * The Light card allows you to change the brightness of the light.
   * https://www.home-assistant.io/lovelace/light/
   */
  type: "light";

  /**
   * Action taken on card double tap.
   * https://www.home-assistant.io/lovelace/light/#double_tap_action
   */
  double_tap_action?: Action;

  /**
   * Home Assistant Light Domain entity ID.
   * https://www.home-assistant.io/lovelace/light/#entity
   */
  entity: LightEntity;

  /**
   * Action taken on card tap and hold.
   * https://www.home-assistant.io/lovelace/light/#hold_action
   */
  hold_action?: Action;

  /**
   * Overwrites icon.
   * https://www.home-assistant.io/lovelace/light/#icon
   */
  icon?: string;

  /**
   * Overwrites friendly name.
   * https://www.home-assistant.io/lovelace/light/#name
   */
  name?: string;

  /**
   * The action taken on card tap.
   * https://www.home-assistant.io/lovelace/light/#tap_action
   */
  tap_action?: Action;

  /**
   * Set to any theme within themes.yaml.
   * https://www.home-assistant.io/lovelace/light/#theme
   */
  theme?: string;

  /**
   * Layout options for the view this card is in
   */
  view_layout?: ViewLayout;
}
