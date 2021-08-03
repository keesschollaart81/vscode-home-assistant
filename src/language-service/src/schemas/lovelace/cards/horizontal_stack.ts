/**
 * Lovelace Horizontal Stack Card
 * Sources:
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/hui-horizontal-stack-card.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/types.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/data/lovelace.ts
 */

import { Card, ViewLayout } from "../types";

export interface Schema {
  /**
   * The Horizontal Stack card allows you to stack together multiple cards, so they always sit next to each other in the space of one column
   * https://www.home-assistant.io/lovelace/horizontal-stack/
   */
  type: "horizontal-stack";

  /**
   * List of cards.
   * https://www.home-assistant.io/lovelace/horizontal-stack/#cards
   */
  cards: Card[];

  /**
   * Title of Stack.
   * https://www.home-assistant.io/lovelace/horizontal-stack/#title
   */
  title?: string;

  /**
   * Layout options for the view this card is in
   */
  view_layout?: ViewLayout;
}
