import { ViewLayout } from "../types";

/**
 * Lovelace Energy distribution Card
 * Sources:
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/energy/hui-energy-distribution-card.ts
 */
export interface Schema {
  /**
   * The energy distribution card shows how the energy flowed, from the grid to your house, from your solar panels to your house and/or back to the grid.
   * https://www.home-assistant.io/lovelace/energy/#energy-distribution
   */
  type: "energy-distribution";

  /**
   * The card title.
   */
  title?: string;

  /**
   * Layout options for the view this card is in
   */
  view_layout?: ViewLayout;
}
