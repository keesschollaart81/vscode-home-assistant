/**
 * Lovelace Conditional Card
 * Sources:
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/hui-calendar-card.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/types.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/data/lovelace.ts
 */
import { Card, Condition, ViewLayout } from "../types";

export interface Schema {
  /**
   * The Conditional card displays another card based on entity states.
   * https://www.home-assistant.io/lovelace/conditional/
   */
  type: "conditional";

  /**
   * Card to display if all conditions match.
   * https://www.home-assistant.io/lovelace/conditional/#card
   */
  card: Card;

  /**
   * List of entity IDs and matching states.
   * https://www.home-assistant.io/lovelace/conditional/#conditions
   */
  conditions: Condition[];

  /**
   * Layout options for the view this card is in
   */
  view_layout?: ViewLayout;
}
