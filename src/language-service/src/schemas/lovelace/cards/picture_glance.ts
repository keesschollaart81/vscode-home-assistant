/**
 * Lovelace Picture Glance Card
 * Sources:
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/hui-picture-glance-card.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/types.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/data/lovelace.ts
 */

import { Action } from "../actions";
import { EntityConfig, ViewLayout } from "../types";
import { CameraEntity, Entity as EntityString } from "../../types";

type Entity = EntityString | PictureGlanceEntityConfig;

export interface Schema {
  /**
   * The Picture Glance card shows an image and corresponding entity states as an icon. The entities on the right side allow toggle actions, others show the more information dialog.
   * https://www.home-assistant.io/lovelace/picture-glance/
   */
  type: "picture-glance";

  /**
   * Forces the height of the image to be a ratio of the width. You may enter a value such as: 16x9, 16:9, 1.78.
   * https://www.home-assistant.io/lovelace/picture-glance/#aspect_ratio
   */
  aspect_ratio?: string;

  /**
   * Camera entity as Background image.
   * https://www.home-assistant.io/lovelace/picture-glance/#camera_image
   */
  camera_image?: CameraEntity;

  /**
   * “live” will show the live view if stream is enabled.
   * https://www.home-assistant.io/lovelace/picture-glance/#camera_view
   */
  camera_view?: "auto" | "live";

  /**
   * Action taken on card double tap.
   * https://www.home-assistant.io/lovelace/picture-glance/#double_tap_action
   */
  double_tap_action?: Action;

  /**
   * List of entities or entity objects.
   * https://www.home-assistant.io/lovelace/picture-glance/#entities
   */
  entities: Entity[];

  /**
   * Entity to use for state_image and state_filter.
   * https://www.home-assistant.io/lovelace/picture-glance/#entity
   */
  entity?: EntityString;

  /**
   * Action taken on card tap and hold.
   * https://www.home-assistant.io/lovelace/picture-glance/#hold_action
   */
  hold_action?: Action;

  /**
   * Background image URL.
   * https://www.home-assistant.io/lovelace/picture-glance/#image
   */
  image?: string;

  /**
   * Show entity state-text.
   * https://www.home-assistant.io/lovelace/picture-glance/#show_state
   */
  show_state?: boolean;

  /**
   * State-based CSS filters.
   * https://www.home-assistant.io/lovelace/picture-glance/#how-to-use-state_filter
   */
  state_filter?: { [key: string]: string };

  /**
   * Background image based on entity state.
   * https://www.home-assistant.io/lovelace/picture-glance/#state_image
   */
  state_image?: { [key: string]: string };

  /**
   * Action taken on card tap.
   * https://www.home-assistant.io/lovelace/picture-glance/#tap_action
   */
  tap_action?: Action;

  /**
   * Set to any theme within themes.yaml.
   * https://www.home-assistant.io/lovelace/picture-glance/#theme
   */
  theme?: string;

  /**
   * The card title.
   * https://www.home-assistant.io/lovelace/picture-glance/#title
   */
  title?: string;

  /**
   * Layout options for the view this card is in
   */
  view_layout?: ViewLayout;
}

interface PictureGlanceEntityConfig extends EntityConfig {
  /**
   * Attribute of the entity to display instead of the state.
   * https://www.home-assistant.io/lovelace/picture-glance/#attribute
   */
  attribute?: string;

  /**
   * Action taken on card double tap.
   * https://www.home-assistant.io/lovelace/picture-glance/#double_tap_action
   */
  double_tap_action?: Action;

  /**
   * Action taken on card tap and hold.
   * https://www.home-assistant.io/lovelace/picture-glance/#hold_action
   */
  hold_action?: Action;

  /**
   * Prefix to display before the attribute’s value.
   * https://www.home-assistant.io/lovelace/picture-glance/#prefix
   */
  prefix?: string;

  /**
   * Show entity state-text.
   * https://www.home-assistant.io/lovelace/picture-glance/#show_state
   */
  show_state?: boolean;

  /**
   * Suffix to display after the attribute’s value.
   * https://www.home-assistant.io/lovelace/picture-glance/#suffix
   */
  suffix?: string;

  /**
   * Action taken on card tap.
   * https://www.home-assistant.io/lovelace/picture-glance/#tap_action
   */
  tap_action?: Action;
}
