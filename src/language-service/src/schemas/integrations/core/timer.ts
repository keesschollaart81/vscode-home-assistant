/**
 * Timer integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/timer/__init__.py
 */
import { IncludeNamed } from "../../types";

export type Domain = "timer";

export interface Schema {
  [key: string]: Item | IncludeNamed;
}

interface Item {
  /**
   * Friendly name of the timer.
   * https://www.home-assistant.io/integrations/timer/#name
   */
  name?: string;

  /**
   * Initial duration in seconds or `00:00:00` when Home Assistant starts.
   * https://www.home-assistant.io/integrations/timer/#duration
   */
  duration?: string | number;

  /**
   * Set a custom icon for the state card.
   * https://www.home-assistant.io/integrations/timer/#icon
   */
  icon?: string;

  /**
   * When true, active and paused timers will be restored to the correct state and
   * time on Home Assistant startup and restarts.
   * https://www.home-assistant.io/integrations/timer/#restore
   */
  restore?: boolean;
}
