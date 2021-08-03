/**
 * Lovelace Markdown Card
 * Sources:
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/hui-markdown-card.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/types.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/data/lovelace.ts
 */
import { Entity, PositiveInteger } from "../../types";
import { ViewLayout } from "../types";

export interface Schema {
  /**
   * The Media Control card is used to display Media Player entities on an interface with easy to use controls.
   * https://www.home-assistant.io/lovelace/media-control/
   */
  type: "markdown";

  /**
   * Content to render as Markdown. May contain templates.
   * https://www.home-assistant.io/lovelace/markdown/#content
   */
  content: string;

  /**
   * The card title.
   * https://www.home-assistant.io/lovelace/markdown/#title
   */
  title?: string;

  /**
   * The algorithm for placing cards aesthetically in Lovelace may have problems with the Markdown card if it contains templates. You can use this value to help it estimate the height of the card in units of 50 pixels (approximately 3 lines of text in default size). (e.g., 4).
   * https://www.home-assistant.io/lovelace/markdown/#card_size
   */
  card_size?: PositiveInteger;

  /**
   * A list of entity IDs so a template in content: only reacts to the state changes of these entities. This can be used if the automatic analysis fails to find all relevant entities.
   * https://www.home-assistant.io/lovelace/markdown/#entity_id
   */
  entity_id?: Entity | Entity[];

  /**
   * Set to any theme within themes.yaml.
   */
  theme?: string;

  /**
   * Layout options for the view this card is in
   */
  view_layout?: ViewLayout;
}
