/**
 * Tile Card
 * Sources:
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/hui-tile-card.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/types.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/data/lovelace.ts
 */

import { Action } from "../actions";
import { Entity as EntityString } from "../../types";

export interface Schema {
  /**
   * The tile card gives you a quick overview of your entity. The card allows you to toggle the entity and show the more info dialog.
   * https://www.home-assistant.io/dashboards/tile/
   */
  type: "tile";

  /**
   * Set the color when the entity is active. By default, the color is based on state, domain, and device_class of your entity. It accepts color token or hex color code.
   * https://www.home-assistant.io/dashboards/tile/#color
   */
  color?: string;

  /**
   * Entity to show in the tile card
   * https://www.home-assistant.io/dashboards/tile/#entity
   */
  entity: EntityString;

  /**
   *
   */
  features?: TileFeatures[];

  /**
   * Overwrites icon.
   * https://www.home-assistant.io/dashboards/tile/#icon
   */
  icon?: string;

  /**
   * Action taken on icon card tap. By default, it will toggle the entity (if possible), otherwise, show the “more-info” dialog.
   * https://www.home-assistant.io/dashboards/tile/#icon_tap_action
   */
  icon_tap_action?: Action;

  /**
   * Overwrites friendly name.
   * https://www.home-assistant.io/dashboards/tile/#name
   */
  name?: string;

  /**
   * If your entity has a picture, it will replace the icon.
   * ttps://www.home-assistant.io/dashboards/tile/#show_entity_picture
   */
  show_entity_picture?: boolean;

  /**
   * Action taken on card tap. By default, it will show the “more-info” dialog.
   * https://www.home-assistant.io/dashboards/tile/#tap_action
   */
  tap_action?: Action;
}

type TileFeatures =
  | CoverOpenCloseFeature
  | CoverTiltFeature
  | LightBrightnessFeature
  | VacuumCommandsFeature;

interface CoverOpenCloseFeature {
  /**
   * Widget that display buttons to open, close or stop a cover.
   * https://www.home-assistant.io/dashboards/tile/#cover-openclose
   */
  type: "cover-open-close";
}

interface CoverTiltFeature {
  /**
   * Widget that display buttons to open, close or stop a cover.
   * https://www.home-assistant.io/dashboards/tile/#cover-tilt
   */
  type: "cover-tilt";
}

interface LightBrightnessFeature {
  /**
   * Widget that display a slider to select the brightness for a light.
   * https://www.home-assistant.io/dashboards/tile/#light-brightness
   */
  type: "light-brightness";
}

type VacuumCommands =
  | "start_pause"
  | "stop"
  | "clean_spot"
  | "locate"
  | "return_home";
interface VacuumCommandsFeature {
  /**
   * Widget that display buttons to control a vacuum.
   * https://www.home-assistant.io/dashboards/tile/#vacuum-commands
   */
  type: "vacuum-commands";

  /**
   * List of commands to show on the card.
   * https://www.home-assistant.io/dashboards/tile/#commands
   */
  commands: VacuumCommands[];
}
