/**
 * Lovelace Humidifier Card
 * Sources:
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/hui-humidifier-card.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/types.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/data/lovelace.ts
 */
import { HumidifierEntity } from "../../types";
import { ViewLayout } from "../types";

export interface Schema {
  /**
   * The Humidifier card lets you control and monitor humidifiers, dehumidifiers, and hygrostat devices.
   * https://www.home-assistant.io/lovelace/humidifier/
   */
  type: "humidifier";

  /**
   * Entity id of humidifier domain.
   * https://www.home-assistant.io/lovelace/humidifier/#entity
   */
  entity: HumidifierEntity;

  /**
   * Name of Entity.
   * https://www.home-assistant.io/lovelace/humidifier/#name
   */
  name?: string;

  /**
   * Set to any theme within themes.yaml.
   * https://www.home-assistant.io/lovelace/humidifier/#theme
   */
  theme?: string;

  /**
   * Layout options for the view this card is in
   */
  view_layout?: ViewLayout;
}
