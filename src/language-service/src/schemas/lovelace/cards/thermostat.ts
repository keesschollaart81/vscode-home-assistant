/**
 * Lovelace Thermostat Card
 * Sources:
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/hui-thermostat-card.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/types.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/data/lovelace.ts
 */

import { ClimateEntity } from "../../types";

export interface Schema {
  /**
   * The Thermostat card gives control of your climate entity, allowing you to change the temperature and mode of the entity.
   * https://www.home-assistant.io/lovelace/thermostat/
   */
  type: "thermostat";

  /**
   * Entity id of climate domain.
   * https://www.home-assistant.io/lovelace/thermostat/#entity
   */
  entity: ClimateEntity;

  /**
   * Overwrites friendly name.
   * https://www.home-assistant.io/lovelace/thermostat/#name
   */
  name?: string;

  /**
   * Set to any theme within themes.yaml.
   * https://www.home-assistant.io/lovelace/thermostat/#theme
   */
  theme?: string;
}
