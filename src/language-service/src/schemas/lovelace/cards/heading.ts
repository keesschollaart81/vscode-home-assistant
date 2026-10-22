/**
 * Lovelace Heading Card
 * Sources:
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/hui-heading-card.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/types.ts
 */
import { Action } from "../actions";
import { ViewLayout } from "../types";

export interface Schema {
  /**
   * The Heading card allows you to add headings to your dashboard, typically at the top of a section.
   * https://www.home-assistant.io/dashboards/heading/
   */
  type: "heading";

  /**
   * The text of the heading.
   * https://www.home-assistant.io/dashboards/heading/#heading
   */
  heading?: string;

  /**
   * The style of the heading.
   * https://www.home-assistant.io/dashboards/heading/#heading_style
   */
  heading_style?: "title" | "subtitle";

  /**
   * The icon displayed next to the heading.
   * https://www.home-assistant.io/dashboards/heading/#icon
   */
  icon?: string;

  /**
   * The action taken when the heading is tapped.
   * https://www.home-assistant.io/dashboards/heading/#tap_action
   */
  tap_action?: Action;

  /**
   * Layout options for the view this card is in
   */
  view_layout?: ViewLayout;
}
