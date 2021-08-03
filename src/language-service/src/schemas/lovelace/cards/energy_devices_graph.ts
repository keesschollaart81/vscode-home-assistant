import { ViewLayout } from "../types";

/**
 * Lovelace Devices energy graph Card
 * Sources:
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/energy/hui-energy-devices-graph-card.ts
 */
export interface Schema {
  /**
   * The devices energy graph show the energy usage per device, it is sorted by usage.
   * https://www.home-assistant.io/lovelace/energy/#devices-energy-graph
   */
  type: "energy-devices-graph";

  /**
   * The card title.
   */
  title?: string;

  /**
   * Layout options for the view this card is in
   */
  view_layout?: ViewLayout;
}
