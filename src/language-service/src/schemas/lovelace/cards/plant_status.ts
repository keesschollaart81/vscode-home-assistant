/**
 * Lovelace Plant Status Card
 * Sources:
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/hui-plant-status-card.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/types.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/data/lovelace.ts
 */

import { PlantEntity } from "../../types";
import { ViewLayout } from "../types";

export interface Schema {
  /**
   * The Plant Status card is for all the lovely botanists out there.
   * https://www.home-assistant.io/lovelace/plant-status/
   */
  type: "plant-status";

  /**
   * Entity id of plant domain.
   * https://www.home-assistant.io/lovelace/plant-status/#entity
   */
  entity: PlantEntity;

  /**
   * Overwrites Friendly Name.
   * https://www.home-assistant.io/lovelace/plant-status/#name
   */
  name?: string;

  /**
   * Set to any theme within themes.yaml.
   * https://www.home-assistant.io/lovelace/plant-status/#theme
   */
  theme?: string;

  /**
   * Layout options for the view this card is in
   */
  view_layout?: ViewLayout;
}
