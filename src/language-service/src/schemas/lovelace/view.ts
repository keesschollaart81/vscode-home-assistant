import { Entity, IncludeList, PositiveInteger } from "../types";
import { Badge, Card } from "./types";

type Badges = Badge | Entity;

export type View =
  | MasonryView
  | PanelView
  | SectionsView
  | SidebarView
  | CustomView;

interface BaseView {
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

export interface MasonryView extends BaseView {
  /**
   * The masonry view is the default view type. It sorts cards in columns based on their size.
   * https://www.home-assistant.io/lovelace/masonry/
   */
  type?: "masonry";

  /**
   * List of entities IDs or badge objects to display as badges. Note that badges do not show when view is in panel mode.
   * https://www.home-assistant.io/lovelace/dashboards-and-views/#badges
   */
  badges?: Badges[];
}

export interface PanelView extends BaseView {
  /**
   * In this view the first card is rendered full-width, other cards in the view will not be rendered.
   * https://www.home-assistant.io/lovelace/panel/
   */
  type: "panel";
}

export interface SectionsView extends BaseView {
  /**
   * The sections view arranges cards in a grid of sections, which can be grouped and rearranged in the dashboard editor.
   * https://www.home-assistant.io/dashboards/sections/
   */
  type: "sections";

  /**
   * The sections of the view, each holding a list of cards.
   * https://www.home-assistant.io/dashboards/sections/#sections
   */
  sections?: Section[];

  /**
   * The maximum number of section columns to display.
   * https://www.home-assistant.io/dashboards/sections/#max_columns
   */
  max_columns?: PositiveInteger;

  /**
   * Fill gaps in the layout by moving sections up, even if this changes their order.
   * https://www.home-assistant.io/dashboards/sections/#dense_section_placement
   */
  dense_section_placement?: boolean;
}

export interface SectionBackground {
  /**
   * The background color of the section.
   */
  color?: string;

  /**
   * The opacity of the background color, as a percentage.
   */
  opacity?: PositiveInteger;
}

export interface Section {
  /**
   * The type of the section. Defaults to a grid of cards.
   */
  type?: string;

  /**
   * Cards to display in this section.
   */
  cards?: Card[];

  /**
   * The number of columns this section spans.
   */
  column_span?: PositiveInteger;

  /**
   * The number of rows this section spans.
   */
  row_span?: PositiveInteger;

  /**
   * Show a background behind the section, either default or with a custom color and opacity.
   */
  background?: boolean | SectionBackground;

  /**
   * @deprecated Use a heading card instead.
   */
  title?: string;
}

export interface SidebarView extends BaseView {
  /**
   * The sidebar view has 2 columns, a wide one and a smaller one on the right.
   * https://rc.home-assistant.io/lovelace/sidebar/
   */
  type: "sidebar";
}

/**
 * @TJS-additionalProperties true
 */
export interface CustomView extends BaseView {
  /**
   * @TJS-pattern custom:(.*)$
   */
  type: string;
}
