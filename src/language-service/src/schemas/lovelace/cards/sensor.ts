/**
 * Lovelace Sensor Card
 * Sources:
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/hui-sensor-card.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/types.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/data/lovelace.ts
 */

import { PositiveInteger, SensorEntity } from "../../types";
import { ViewLayout } from "../types";

export interface Schema {
  /**
   * The Sensor card gives you a quick overview of your sensors state with an optional graph to visualize change over time.
   * https://www.home-assistant.io/lovelace/sensor/
   */
  type: "sensor";

  /**
   * Detail of the graph 1 or 2, 1 equals one point/hour, 2 equals six points/hour.
   * https://www.home-assistant.io/lovelace/sensor/#detail
   */
  detail?: 1 | 2;

  /**
   * Entity id of sensor domain.
   * https://www.home-assistant.io/lovelace/sensor/#entity
   */
  entity: SensorEntity;

  /**
   * Type of graph none or line.
   * https://www.home-assistant.io/lovelace/sensor/#graph
   */
  graph?: "none" | "line";

  /**
   * Hours to show in graph.
   * https://www.home-assistant.io/lovelace/sensor/#entity
   */
  hours_to_show?: PositiveInteger;

  /**
   * The card icon.
   * https://www.home-assistant.io/lovelace/sensor/#icon
   */
  icon?: string;

  /**
   * Limits of the graph Y-axis.
   * https://www.home-assistant.io/lovelace/sensor/#limits
   */
  limits?: {
    /**
     * Minimum value of the graph Y-axis.
     * https://www.home-assistant.io/lovelace/sensor/#min
     */
    min?: number;

    /**
     * Maximum value of the graph Y-axis.
     * https://www.home-assistant.io/lovelace/sensor/#max
     */
    max?: number;
  };

  /**
   * The card name.
   * https://www.home-assistant.io/lovelace/sensor/#name
   */
  name?: string;

  /**
   * Set to any theme within themes.yaml.
   * https://www.home-assistant.io/lovelace/sensor/#theme
   */
  theme?: string;

  /**
   * The unit of measurement.
   * https://www.home-assistant.io/lovelace/sensor/#unit
   */
  unit?: string;

  /**
   * Layout options for the view this card is in
   */
  view_layout?: ViewLayout;
}
