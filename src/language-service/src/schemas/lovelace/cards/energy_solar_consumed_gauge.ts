import { ViewLayout } from "../types";

/**
 * Lovelace Solar consumed gauge Card
 * Sources:
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/energy/hui-energy-solar-consumed-gauge-card.ts
 */
export interface Schema {
  /**
   * The solar consumed gauge represents how much of the solar energy was not used by your home and was returned to the grid.
   * https://www.home-assistant.io/lovelace/energy/#solar-consumed-gauge
   */
  type: "energy-grid-neutrality-gauge";

  /**
   * The card title.
   */
  title?: string;

  /**
   * Layout options for the view this card is in
   */
  view_layout?: ViewLayout;
}
