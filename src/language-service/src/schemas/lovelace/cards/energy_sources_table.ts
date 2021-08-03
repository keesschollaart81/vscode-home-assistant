import { ViewLayout } from "../types";

/**
 * Lovelace Energy sources table Card
 * Sources:
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/energy/hui-energy-sources-table-card.ts
 */
export interface Schema {
  /**
   * The energy sources table card shows all your energy sources, and the corresponding amount of energy.
   * https://www.home-assistant.io/lovelace/energy/#energy-sources-table
   */
  type: "energy-sources-table";

  /**
   * The card title.
   */
  title?: string;

  /**
   * Layout options for the view this card is in
   */
  view_layout?: ViewLayout;
}
