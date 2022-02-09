/**
 * Lovelace Entity Card
 * Sources:
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/hui-entity-card.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/types.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/data/lovelace.ts
 */
import { Entity } from "../../types";
import { HeaderFooter } from "../headers_footers";
import { ViewLayout } from "../types";

export interface Schema {
  /**
   * The Entity card gives you a quick overview of your entity’s state.
   * https://www.home-assistant.io/lovelace/entity
   */
  type: "entity";

  /**
   * An attribute associated with the entity.
   * https://www.home-assistant.io/lovelace/entity/#attribute
   */
  attribute?: string;

  /**
   * Name of Entity
   * https://www.home-assistant.io/lovelace/entity/#entity
   */
  entity: Entity;

  /**
   * Footer widget to render.
   * https://www.home-assistant.io/lovelace/entity/#footer
   */
  footer?: HeaderFooter;

  /**
   * Overwrites icon.
   * https://www.home-assistant.io/lovelace/entity/#icon
   */
  icon?: string;

  /**
   * Name of Entity.
   * https://www.home-assistant.io/lovelace/entity/#name
   */
  name?: string;

  /**
   * Set to true to have icon colored when entity is active.
   * https://www.home-assistant.io/lovelace/entity/#state_color
   */
  state_color?: boolean;

  /**
   * Set to any theme within themes.yaml.
   * https://www.home-assistant.io/lovelace/entity/#theme
   */
  theme?: string;

  /**
   * Unit of Measurement given to the data displayed.
   * https://www.home-assistant.io/lovelace/entity/#unit
   */
  unit?: string;

  /**
   * Layout options for the view this card is in
   */
  view_layout?: ViewLayout;
}
