/**
 * Lovelace Shopping List Card
 * Sources:
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/hui-shopping-list-card.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/types.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/data/lovelace.ts
 */

import { ViewLayout } from "../types";

export interface Schema {
  /**
   * The Shopping List card allows you to add, edit, check-off, and clear items from your shopping list.
   * https://www.home-assistant.io/lovelace/shopping-list/
   */
  type: "shopping-list";

  /**
   * Set to any theme within themes.yaml.
   * https://www.home-assistant.io/lovelace/shopping-list/#theme
   */
  theme?: string;

  /**
   * Title of Shopping List.
   * https://www.home-assistant.io/lovelace/shopping-list/#title
   */
  title?: string;

  /**
   * Layout options for the view this card is in
   */
  view_layout?: ViewLayout;
}
