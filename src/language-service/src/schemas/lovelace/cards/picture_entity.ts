/**
 * Lovelace Picture Entity Card
 * Sources:
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/hui-picture-entity-card.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/types.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/data/lovelace.ts
 */

import { Action } from "../actions";
import { CameraEntity, Entity } from "../../types";
import { ViewLayout } from "../types";

export interface Schema {
  /**
   * The Picture Entity card displays an entity in the form of an image. Instead of images from URL, it can also show the picture of camera entities.
   * https://www.home-assistant.io/lovelace/picture-entity/
   */
  type: "picture-entity";

  /**
   * Forces the height of the image to be a ratio of the width. You may enter a value such as: 16x9, 16:9, 1.78.
   * https://www.home-assistant.io/lovelace/picture-entity/#aspect_ratio
   */
  aspect_ratio?: string;

  /**
   * Camera entity_id to use. (not required if entity is already a camera-entity).
   * https://www.home-assistant.io/lovelace/picture-entity/#camera_image
   */
  camera_image?: CameraEntity;

  /**
   * “live” will show the live view if stream is enabled.
   * https://www.home-assistant.io/lovelace/picture-entity/#camera_view
   */
  camera_view?: "live" | "auto";

  /**
   * Action taken on card double tap.
   * https://www.home-assistant.io/lovelace/picture-entity/#double_tap_action
   */
  double_tap_action?: Action;

  /**
   * An entity_id used for the picture.
   * https://www.home-assistant.io/lovelace/picture-entity/#entity
   */
  entity: Entity;

  /**
   * Action taken on card tap and hold.
   * https://www.home-assistant.io/lovelace/picture-entity/#hold_action
   */
  hold_action?: Action;

  /**
   * URL of an image.
   * https://www.home-assistant.io/lovelace/picture-entity/#image
   */
  image?: string;

  /**
   * Overwrite entity name.
   * https://www.home-assistant.io/lovelace/picture-entity/#name
   */
  name?: string;

  /**
   * Shows name in footer.
   * https://www.home-assistant.io/lovelace/picture-entity/#show_name
   */
  show_name?: boolean;

  /**
   * Shows state in footer.
   * https://www.home-assistant.io/lovelace/picture-entity/#show_state
   */
  show_state?: boolean;

  /**
   * State-based CSS filters.
   * https://www.home-assistant.io/lovelace/picture-entity/#how-to-use-state_filter
   */
  state_filter?: { [key: string]: string };

  /**
   * Map entity states to images (state: image URL)
   * https://www.home-assistant.io/lovelace/picture-entity/#state_image
   */
  state_image?: { [key: string]: string };

  /**
   * Action taken on card tap.
   * https://www.home-assistant.io/lovelace/picture-entity/#tap_action
   */
  tap_action?: Action;

  /**
   * Set to any theme within themes.yaml.
   * https://www.home-assistant.io/lovelace/picture-entity/#theme
   */
  theme?: string;

  /**
   * Layout options for the view this card is in
   */
  view_layout?: ViewLayout;
}
