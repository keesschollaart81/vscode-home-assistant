/**
 * Counter integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/counter/__init__.py
 */
import { Integer, IncludeNamed, PositiveInteger } from "../../types";

export type Domain = "counter";
export interface Schema {
  [key: string]: Item | IncludeNamed;
}

interface Item {
  /**
   * The icon that shows in the frontend.
   * https://www.home-assistant.io/integrations/counter/#icon
   */
  icon?: string;

  /**
   * Initial value when Home Assistant starts or the counter is reset.
   * https://www.home-assistant.io/integrations/counter/#initial
   */
  initial?: PositiveInteger;

  /**
   * Maximum value the counter will have.
   * https://www.home-assistant.io/integrations/counter/#maximum
   */
  maximum?: Integer;

  /**
   * Minimum value the counter will have.
   * https://www.home-assistant.io/integrations/counter/#minimum
   */
  minimum?: Integer;

  /**
   * Name of the counter.
   * https://www.home-assistant.io/integrations/counter/#name
   */
  name?: string;

  /**
   * Try to restore the last known value when Home Assistant starts, defaults to `true`.
   * https://www.home-assistant.io/integrations/counter/#restore
   */
  restore?: boolean;

  /**
   * Incremental/step value for the counter.
   * https://www.home-assistant.io/integrations/counter/#step
   */
  step?: PositiveInteger;
}
