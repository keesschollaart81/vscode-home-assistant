import { ViewLayout } from "../types";

/**
 * Lovelace Grid neutrality gauge Card
 * Sources:
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/energy/hui-energy-grid-neutrality-gauge-card.ts
 */
export interface Schema {
  /**
   * The grid neutrality gauge card represents your energy dependency.
   * https://www.home-assistant.io/lovelace/energy/#grid-neutrality-gauge
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
