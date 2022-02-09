/**
 * Input Boolean integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/input_boolean/__init__.py
 */
import { IncludeNamed } from "../../types";

export type Domain = "input_boolean";
export interface Schema {
  [key: string]: Item | IncludeNamed | null;
}
export type File = Schema | Item;

interface Item {
  /**
   * The icon that shows in the frontend.
   * https://www.home-assistant.io/integrations/input_boolean#icon
   */
  icon?: string;

  /**
   * Initial value when Home Assistant starts.
   * https://www.home-assistant.io/integrations/input_boolean#initial
   */
  initial?: boolean;

  /**
   * Name of the input boolean.
   * https://www.home-assistant.io/integrations/input_boolean#name
   */
  name?: string;
}
