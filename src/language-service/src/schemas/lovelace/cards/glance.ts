/**
 * Lovelace Glance Card
 * Sources:
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/hui-glance-card.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/types.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/data/lovelace.ts
 */

import { Action } from "../actions";
import { EntityConfig, ViewLayout } from "../types";
import { Entity as EntityString, PositiveInteger } from "../../types";

type Entity = EntityString | GlanceEntityConfig;

export interface Schema {
  /**
   * The Glance card is useful to group multiple sensors in a compact overview.
   * https://www.home-assistant.io/lovelace/glance/
   */
  type: "glance";

  /**
   * Number of columns to show. If not specified the number will be set automatically.
   * https://www.home-assistant.io/lovelace/glance/#columns
   */
  columns?: PositiveInteger;

  /**
   * A list of entity IDs or entity objects.
   * https://www.home-assistant.io/lovelace/glance/#entities
   */
  entities?: Entity[];

  /**
   * Show entity icon.
   * https://www.home-assistant.io/lovelace/glance/#show_icon
   */
  show_icon?: boolean;

  /**
   * Show entity name.
   * https://www.home-assistant.io/lovelace/glance/#show_name
   */
  show_name?: boolean;

  /**
   * Show entity state-text.
   * https://www.home-assistant.io/lovelace/glance/#show_state
   */
  show_state?: boolean;

  /**
   * Set to true to have icons colored when entity is active.
   * https://www.home-assistant.io/lovelace/glance/#state_color
   */
  state_color?: boolean;

  /**
   * Set to any theme within themes.yaml.
   * https://www.home-assistant.io/lovelace/glance/#theme
   */
  theme?: string;

  /**
   * Card title.
   * https://www.home-assistant.io/lovelace/glance/#theme
   */
  title?: string;

  /**
   * Layout options for the view this card is in
   */
  view_layout?: ViewLayout;
}

interface GlanceEntityConfig extends EntityConfig {
  /**
   * Action taken on card double tap.
   * https://www.home-assistant.io/lovelace/glance/#double_tap_action
   */
  double_tap_action?: Action;

  /**
   * Action taken on card tap and hold.
   * https://www.home-assistant.io/lovelace/glance/#hold_action
   */
  hold_action?: Action;

  /**
   * Overwrites entity picture.
   * https://www.home-assistant.io/lovelace/glance/#image
   */
  image?: string;

  /**
   * Overwrites the state display with the relative time since last changed.
   * https://www.home-assistant.io/lovelace/glance/#show_last_changed
   */
  show_last_changed?: boolean;

  /**
   * Show entity state-text.
   * https://www.home-assistant.io/lovelace/glance/#show_state
   */
  show_state?: boolean;

  /**
   * Set to true to have icons colored when entity is active.
   * https://www.home-assistant.io/lovelace/glance/#state_color
   */
  state_color?: boolean;

  /**
   * Action taken on card tap.
   * https://www.home-assistant.io/lovelace/glance/#tap_action
   */
  tap_action?: Action;
}
