import { Entity, IncludeList } from "../types";
import { Badge, Card } from "./types";

type Badges = Badge | Entity;

export interface View {
  /**
   * Style the background using CSS.
   * https://www.home-assistant.io/lovelace/dashboards-and-views/#background
   */
  background?: string;

  /**
   * List of entities IDs or badge objects to display as badges. Note that badges do not show when view is in panel mode.
   * https://www.home-assistant.io/lovelace/dashboards-and-views/#badges
   */
  badges?: Badges[];

  /**
   * Cards to display in this view.
   * https://www.home-assistant.io/lovelace/dashboards-and-views/#cards
   */
  cards?: Card[] | IncludeList;

  /**
   * Icon-name from Material Design Icons.
   * https://www.home-assistant.io/lovelace/dashboards-and-views/#icon
   */
  icon?: string;

  /**
   * Setting panel true sets the view to panel mode. In this mode the first card is rendered full-width, other cards in the view will not be rendered.
   * https://www.home-assistant.io/lovelace/dashboards-and-views/#panel
   */
  panel?: boolean;

  /**
   * You can link to one view from a card in another view when using cards that support navigation (navigation_path). The string supplied here will be appended to the string /lovelace/ to create the path to the view.
   * https://www.home-assistant.io/lovelace/dashboards-and-views/#path
   */
  path?: string;

  /**
   * Set a separate theme for the view and its cards.
   * https://www.home-assistant.io/lovelace/dashboards-and-views/#theme
   */
  theme?: string;

  /**
   * The title or name.
   * https://www.home-assistant.io/lovelace/dashboards-and-views/#title
   */
  title: string;

  /**
   * You can specify the visibility of views as a whole or per-user. (Note: This is only for the display of the tabs. The URL path is still accessible.)
   * https://www.home-assistant.io/lovelace/dashboards-and-views/#visible
   */
  visible?: boolean | any;
}
