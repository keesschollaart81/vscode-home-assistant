import { ViewLayout } from "../types";

/**
 * Lovelace Carbon consumed gauge Card
 * Sources:
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/energy/hui-energy-solar-consumed-gauge-card.ts
 */
export interface Schema {
  /**
   * The carbon consumed gauge card represents how much of the energy consumed by your home was generated using non-fossil fuels like solar, wind and nuclear.
   * https://www.home-assistant.io/lovelace/energy/#carbon-consumed-gauge
   */
  type: "energy-carbon-consumed-gauge";

  /**
   * The card title.
   */
  title?: string;

  /**
   * Layout options for the view this card is in
   */
  view_layout?: ViewLayout;
}
