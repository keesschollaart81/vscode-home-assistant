/**
 * Lovelace Vertical Stack Card
 * Sources:
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/hui-vertical-stack-card.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/types.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/data/lovelace.ts
 */

import { Card, ViewLayout } from "../types";

export interface Schema {
  /**
   * The Vertical Stack card allows you to group multiple cards so they always sit in the same column.
   * https://www.home-assistant.io/lovelace/vertical-stack/
   */
  type: "vertical-stack";

  /**
   * List of cards.
   * https://www.home-assistant.io/lovelace/vertical-stack/#cards
   */
  cards: Card[];

  /**
   * Title of Stack.
   * https://www.home-assistant.io/lovelace/vertical-stack/#title
   */
  title?: string;

  /**
   * Layout options for the view this card is in
   */
  view_layout?: ViewLayout;
}
