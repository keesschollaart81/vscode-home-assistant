/**
 * Lovelace Logbook Card
 * Sources:
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/hui-logbook-card.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/types.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/data/lovelace.ts
 */
import { Entity, PositiveInteger } from "../../types";
import { ViewLayout } from "../types";

export interface Schema {
  /**
   * The Logbook card displays entries from the logbook for specific entities.
   * https://www.home-assistant.io/lovelace/logbook/
   */
  type: "logbook";

  /**
   * The entities that will show in the card.
   * https://www.home-assistant.io/lovelace/logbook/#entities
   */
  entities?: Entity[];

  /**
   * Number of hours in the past to track.
   * https://www.home-assistant.io/lovelace/logbook/#hours_to_show
   */
  hours_to_show?: PositiveInteger;

  /**
   * Set to any theme within themes.yaml.
   * https://www.home-assistant.io/lovelace/logbook/#theme
   */
  theme?: string;

  /**
   * Title of the card.
   * https://www.home-assistant.io/lovelace/logbook/#title
   */
  title?: string;

  /**
   * Layout options for the view this card is in
   */
  view_layout?: ViewLayout;
}
