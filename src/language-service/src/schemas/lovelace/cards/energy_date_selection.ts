import { ViewLayout } from "../types";

/**
 * Lovelace Energy Date Picker Card
 * Sources:
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/energy/hui-energy-date-selection-card.ts
 */
export interface Schema {
  /**
   * This card will allow you to pick what date to show.
   * https://www.home-assistant.io/lovelace/energy/#energy-date-picker
   */
  type: "energy-date-selection";

  /**
   * Layout options for the view this card is in
   */
  view_layout?: ViewLayout;
}
