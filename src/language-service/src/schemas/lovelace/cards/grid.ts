/**
 * Lovelace Grid Card
 * Sources:
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/hui-grid-card.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/types.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/data/lovelace.ts
 */

import { PositiveInteger } from "../../types";
import { Card, ViewLayout } from "../types";

export interface Schema {
  /**
   * The Grid card allows you to show multiple cards in a grid. It will first fill the columns, automatically adding new rows as needed.
   * https://www.home-assistant.io/lovelace/grid/
   */
  type: "grid";

  // : Reference to card type
  /**
   * List of cards.
   * https://www.home-assistant.io/lovelace/grid/#cards
   */
  cards: Card[];

  /**
   * Number of columns in the grid.
   * https://www.home-assistant.io/lovelace/grid/#columns
   */
  columns?: PositiveInteger;

  /**
   * Should the cards be shown square.
   * https://www.home-assistant.io/lovelace/grid/#square
   */
  square?: boolean;

  /**
   * Title of Grid.
   * https://www.home-assistant.io/lovelace/grid/#title
   */
  title?: string;

  /**
   * Layout options for the view this card is in
   */
  view_layout?: ViewLayout;
}
