/**
 * Compensation integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/compensation/__init__.py
 */
import { Entity, IncludeNamed, PositiveInteger } from "../../types";

export type Domain = "compensation";

export interface Schema {
  [key: string]: Item | IncludeNamed;
}

interface Item {
  /**
   * The entity to monitor/compensate.
   * https://www.home-assistant.io/integrations/compensation/#source
   */
  source: Entity;

  /**
   * The collection of data point conversions with the format `[uncompensated_value, compensated_value]`. e.g., `[1.0, 2.1]`. 
   * The number of required data points is equal to the polynomial `degree` + 1. 
   * For example, a linear compensation (with `degree: 1`) requires at least 2 data points.
   * https://www.home-assistant.io/integrations/compensation/#data_points
   */
  data_points: [number, number][];

  /**
   * An ID that uniquely identifies this sensor. Set this to a unique value to allow
   * customization through the UI.
   * https://www.home-assistant.io/integrations/compensation/#unique_id
   */
  unique_id?: string;

  /**
   * Attribute from the source to monitor/compensate. When omitted the state value of
   * the source will be used.
   * https://www.home-assistant.io/integrations/compensation/#attribute
   */
  attribute?: string;

  /**
   * The degree of a polynomial. e.g., Linear compensation (y = x + 3) has 1 degree,
   * Quadratic compensation (y = x² + x + 3) has 2 degrees, etc.
   * https://www.home-assistant.io/integrations/compensation/#degree
   */
  degree?: PositiveInteger;

  /**
   * Defines the precision of the calculated values, through the argument of round().
   * https://www.home-assistant.io/integrations/compensation/#precision
   */
  precision?: PositiveInteger;

  /**
   * Defines the units of measurement of the sensor, if any.
   * https://www.home-assistant.io/integrations/compensation/#unit_of_measurement
   */
  unit_of_measurement?: string;

  /**
   * Enables a lower limit for the sensor. The lower limit is defined by the data
   * collections (`data_points`) lowest `uncompensated_value`. For example, if the lowest `uncompensated_value` value is `1.0` and the paired `compensated_value` is `0.0`, any `source` state less than `1.0` will produce a compensated state of `0.0`.
   * https://www.home-assistant.io/integrations/compensation/#lower_limit
   */
  lower_limit?: boolean;

  /**
   * Enables an upper limit for the sensor. The upper limit is defined by the data
   * collections (`data_points`) greatest `uncompensated_value`. For example, if the greatest `uncompensated_value` value is `5.0` and the paired `compensated_value` is `10.0`, any `source` state greater than `5.0` will produce a compensated state of `10.0`.
   * https://www.home-assistant.io/integrations/compensation/#upper_limit
   */
  upper_limit?: boolean;
}
