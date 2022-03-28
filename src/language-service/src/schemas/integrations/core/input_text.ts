/**
 * Input Text integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/input_text/__init__.py
 */
import { IncludeNamed, Integer } from "../../types";

export type Domain = "input_number";
export interface Schema {
  [key: string]: Item | IncludeNamed | null;
}
export type File = Schema | Item;

interface Item {
  /**
   * The icon that shows in the frontend.
   * https://www.home-assistant.io/integrations/input_text/#icon
   */
  icon?: string;

  /**
   * Initial value when Home Assistant starts.
   * https://www.home-assistant.io/integrations/input_text#initial
   */
  initial?: string;

  /**
   * Maximum length for the text value. 255 is the maximum number of characters allowed in an entity state.
   * https://www.home-assistant.io/integrations/input_text#max
   *
   * @TJS-type integer
   * @minimum 1
   * @maximum 255
   */
  max?: Integer;

  /**
   * Minimum length for the text value.
   * https://www.home-assistant.io/integrations/input_text#min
   *
   * @TJS-type integer
   * @minimum 0
   * @maximum 255
   */
  min?: Integer;

  /**
   * Can specify text or password. Elements of type “password” provide a way for the user to securely enter a value.
   * https://www.home-assistant.io/integrations/input_text#mode
   */
  mode?: "text" | "password";

  /**
   * Name of the input text.
   * https://www.home-assistant.io/integrations/input_text/#name
   */
  name?: string;

  /**
   * Regex pattern for client-side validation.
   * https://www.home-assistant.io/integrations/input_text#pattern
   */
  pattern?: string;
}
