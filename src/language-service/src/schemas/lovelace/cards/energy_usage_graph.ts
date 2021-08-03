import { ViewLayout } from "../types";

/**
 * Lovelace Energy usage graph Card
 * Sources:
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/energy/hui-energy-usage-graph-card.ts
 */
export interface Schema {
  /**
   * The energy usage graph card shows the amount of energy your house has consumed, and from what source this energy came.
   * https://www.home-assistant.io/lovelace/energy/#energy-usage-graph
   */
  type: "energy-usage-graph";

  /**
   * The card title.
   */
  title?: string;

  /**
   * Layout options for the view this card is in
   */
  view_layout?: ViewLayout;
}
