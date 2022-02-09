/**
 * Input Select integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/input_select/__init__.py
 */
import { IncludeNamed } from "../../types";

export type Domain = "input_number";
export interface Schema {
  [key: string]: Item | IncludeNamed | null;
}
export type File = Schema | Item;

interface Item {
  /**
   * The icon that shows in the frontend.
   * https://www.home-assistant.io/integrations/input_select/#icon
   */
  icon?: string;

  /**
   * Initial value when Home Assistant starts.
   * https://www.home-assistant.io/integrations/input_select/#initial
   */
  initial?: string;

  /**
   * Name of the input select.
   * https://www.home-assistant.io/integrations/input_select/#name
   */
  name?: string;

  /**
   * List of options to choose from.
   * https://www.home-assistant.io/integrations/input_select#options
   */
  options: string[];
}
