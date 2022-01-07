/**
 * Input Number integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/input_number/__init__.py
 */
import { IncludeNamed } from "../../types";

export type Domain = "input_number";
export interface Schema {
  [key: string]: Item | IncludeNamed | null;
}
export type File = Schema | Item;

interface Item {
  /**
   * Show a "slider" or a input "box" in the UI frontend. Defaults to "slider".
   * https://www.home-assistant.io/integrations/input_number#mode
   */
  mode?: "slider" | "box";

  /**
   * The icon that shows in the frontend.
   * https://www.home-assistant.io/integrations/input_number#icon
   */
  icon?: string;

  /**
   * Initial value when Home Assistant starts.
   * https://www.home-assistant.io/integrations/input_number#initial
   */
  initial?: number;

  /**
   * Maximum value of the number
   * https://www.home-assistant.io/integrations/input_number#max
   */
  max: number;

  /**
   * Minimum value of the number
   * https://www.home-assistant.io/integrations/input_number#min
   */
  min: number;

  /**
   * Name of the input number.
   * https://www.home-assistant.io/integrations/input_number#name
   */
  name?: string;

  /**
   * Step value. Smallest value 0.001.
   * https://www.home-assistant.io/integrations/input_number#step
   */
  step?: number;

  /**
   * Unit of measurement in which the value of the slider is expressed in.
   * https://www.home-assistant.io/integrations/input_number#unit_of_measurement
   */
  unit_of_measurement?: string;
}
