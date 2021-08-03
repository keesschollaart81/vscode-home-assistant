import { ViewLayout } from "../types";

/**
 * Lovelace Solar production graph Card
 * Sources:
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/energy/hui-energy-solar-graph-card.ts
 */
export interface Schema {
  /**
   * The solar production graph card shows the amount of energy your solar panels have produced per source, and if setup and available the forecast of the solar production.
   * https://www.home-assistant.io/lovelace/energy/#solar-production-graph
   */
  type: "energy-solar-graph";

  /**
   * The card title.
   */
  title?: string;

  /**
   * Layout options for the view this card is in
   */
  view_layout?: ViewLayout;
}
