/**
 * Lovelace Gauge Card
 * Sources:
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/hui-gauge-card.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/types.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/data/lovelace.ts
 */

import { Entity } from "../../types";
import { ViewLayout } from "../types";

export interface Schema {
  /**
   * The Gauge card is a basic card that allows visually seeing sensor data.
   * https://www.home-assistant.io/lovelace/gauge/
   */
  type: "gauge";

  /**
   * Entity id to show.
   * https://www.home-assistant.io/lovelace/gauge/#entity
   */
  entity: Entity;

  /**
   * Maximum value for graph.
   * https://www.home-assistant.io/lovelace/gauge/#max
   */
  max?: number;

  /**
   * Minimum value for graph.
   * https://www.home-assistant.io/lovelace/gauge/#min
   */
  min?: number;

  /**
   * Name of Gauge Entity.
   * https://www.home-assistant.io/lovelace/gauge/#name
   */
  name?: string;

  /**
   * Show the gauge as a needle gauge.
   * https://www.home-assistant.io/lovelace/gauge/#needle
   */
  needle?: boolean;

  /**
   * List of colors and their corresponding start values. Segments will override the severity settings.
   * https://www.home-assistant.io/dashboards/gauge/#segments
   */
  segments?: Segment[];

  /**
   * Allows setting of colors for different numbers.
   * https://www.home-assistant.io/lovelace/gauge/#severity
   */
  severity?: Severity;

  /**
   * Set to any theme within themes.yaml.
   * https://www.home-assistant.io/lovelace/gauge/#theme
   */
  theme?: string;

  /**
   * Unit of Measurement given to data.
   * https://www.home-assistant.io/lovelace/gauge/#unit
   */
  unit?: string;

  /**
   * Layout options for the view this card is in
   */
  view_layout?: ViewLayout;
}

interface Severity {
  /**
   * Value from which to start green color.
   * https://www.home-assistant.io/lovelace/gauge/#green
   */
  green?: number;

  /**
   * Value from which to start red color.
   * https://www.home-assistant.io/lovelace/gauge/#red
   */
  red?: number;

  /**
   * Value from which to start yellow color.
   * https://www.home-assistant.io/lovelace/gauge/#yellow
   */
  yellow?: number;
}

interface Segment {
  /**
   * Value from which to start the color.
   * https://www.home-assistant.io/dashboards/gauge/#from
   */
  from: number;

  /**
   * Value from which to start red color.
   * https://www.home-assistant.io/dashboards/gauge/#red
   */
  color: string;
}
