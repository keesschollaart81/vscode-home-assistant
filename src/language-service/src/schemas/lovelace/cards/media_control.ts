/**
 * Lovelace Media Control Card
 * Sources:
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/hui-media-control-card.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/types.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/data/lovelace.ts
 */
import { MediaPlayerEntity } from "../../types";
import { ViewLayout } from "../types";

export interface Schema {
  /**
   * The Media Control card is used to display Media Player entities on an interface with easy to use controls.
   * https://www.home-assistant.io/lovelace/media-control/
   */
  type: "media-control";

  /**
   * A media player entity_id.
   * https://www.home-assistant.io/lovelace/media-control/#entity
   */
  entity: MediaPlayerEntity;

  /**
   * Overwrite friendly name.
   * https://www.home-assistant.io/lovelace/media-control/#name
   */
  name?: string;

  /**
   * Layout options for the view this card is in
   */
  view_layout?: ViewLayout;
}
