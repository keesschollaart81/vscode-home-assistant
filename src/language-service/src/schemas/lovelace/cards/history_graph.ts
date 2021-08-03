/**
 * Lovelace History Graph Card
 * Sources:
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/hui-history-graph-card.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/types.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/data/lovelace.ts
 */

import { Entity as EntityString, PositiveInteger } from "../../types";
import { EntityConfig, ViewLayout } from "../types";

type Entity = EntityString | EntityConfig;

export interface Schema {
  /**
   * The History Graph card allows you to display a graph for each of the entities listed.
   * https://www.home-assistant.io/lovelace/history-graph/
   */
  type: "history-graph";

  /**
   * A list of entity IDs or entity objects.
   * https://www.home-assistant.io/lovelace/history-graph/#entities
   */
  entities?: Entity[];

  /**
   * Hours to show. Minimum is 1 hour, maximum of 80 hours.
   * https://www.home-assistant.io/lovelace/history-graph/#hours_to_show
   *
   * @min 1
   * @max 80
   */
  hours_to_show?: PositiveInteger;

  /**
   * Refresh interval in seconds.
   * https://www.home-assistant.io/lovelace/history-graph/#refresh_interval
   */
  refresh_interval?: PositiveInteger;

  /**
   * The card title.
   * https://www.home-assistant.io/lovelace/history-graph/#title
   */
  title?: string;

  /**
   * Layout options for the view this card is in
   */
  view_layout?: ViewLayout;
}
