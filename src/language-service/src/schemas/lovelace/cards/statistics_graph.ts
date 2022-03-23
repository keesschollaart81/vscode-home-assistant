/**
 * Lovelace Statistics Graph Card
 * Sources:
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/hui-statistics-graph-card.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/types.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/data/lovelace.ts
 */

import { Entity as EntityString, PositiveInteger } from "../../types";
import { EntityConfig, ViewLayout } from "../types";

type Entity = EntityString | EntityConfig;
type StatType = "max" | "mean" | "min" | "sum";

export interface Schema {
  /**
   * The Statistics Graph card allows you to display a graph of statistics data for each of the entities listed.
   * https://www.home-assistant.io/lovelace/statistics-graph/
   */
  type: "statistics-graph";

  /**
   * A list of entity IDs or entity objects.
   * https://www.home-assistant.io/lovelace/statistics-graph/#entities
   */
  entities: Entity[];

  /**
   * If the chart should be rendered as a bar or a line chart.
   * https://www.home-assistant.io/lovelace/statistics-graph/#chart_type
   */
  chart_type?: "bar" | "line";

  /**
   * Days to show in graph. Minimum is 1 day.
   * https://www.home-assistant.io/lovelace/statistics-graph/#days_to_show
   *
   * @min 1
   */
  days_to_show?: PositiveInteger;

  /**
   * The period of the rendered graph.
   * https://www.home-assistant.io/lovelace/statistics-graph/#period
   */
  period?: "5minute" | "hour" | "day" | "month";

  /**
   * The stat types to render. min, max, mean, sum.
   * https://www.home-assistant.io/lovelace/statistics-graph/#stat_types
   */
  stat_types?: StatType | StatType[];

  /**
   * The card title.
   * https://www.home-assistant.io/lovelace/statistics-graph/#title
   */
  title?: string;

  /**
   * Layout options for the view this card is in
   */
  view_layout?: ViewLayout;
}
