/**
 * Lovelace Entities Card
 * Sources:
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/hui-entities-card.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/types.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/data/lovelace.ts
 */
import { Entity as EntityString } from "../../types";
import { HeaderFooter } from "../headers_footers";
import { Row } from "../rows";
import { ViewLayout } from "../types";

type Entity = EntityString | Row;

export interface Schema {
  /**
   * The Entities card is the most common type of card. It groups items together into lists.
   * https://www.home-assistant.io/lovelace/entities/
   */
  type: "entities";

  /**
   * A list of entity IDs or entity (row) objects.
   * https://www.home-assistant.io/lovelace/entities/#entities
   */
  entities?: Entity[];

  /**
   * Header widget to render.
   * https://www.home-assistant.io/lovelace/header-footer/
   */
  footer?: HeaderFooter;

  /**
   * Footer widget to render.
   * https://www.home-assistant.io/lovelace/header-footer/
   */
  header?: HeaderFooter;

  /**
   * An icon to display to the left of the title.
   * https://www.home-assistant.io/lovelace/entities/#icon
   */
  icon?: string;

  /**
   * Button to turn on/off all entities.
   * https://www.home-assistant.io/lovelace/entities/#show_header_toggle
   */
  show_header_toggle?: boolean;

  /**
   * Set to true to have icons colored when entity is active.
   * https://www.home-assistant.io/lovelace/entities/#state_color
   */
  state_color?: boolean;

  /**
   * Set to any theme within themes.yaml.
   * https://www.home-assistant.io/lovelace/entities/#theme
   */
  theme?: string;

  /**
   * The card title.
   * https://www.home-assistant.io/lovelace/entities/#title
   */
  title?: string;

  /**
   * Layout options for the view this card is in
   */
  view_layout?: ViewLayout;
}
