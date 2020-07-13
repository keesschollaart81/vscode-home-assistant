/**
 * Hue integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/hue/__init__.py
 */
import { IncludeList, Deprecated } from "../types";

export type Domain = "hue";
export interface Schema {
  bridges: Item[] | IncludeList;
}

interface Item {
  /**
   * DEPRECATED as of Home Assistant 0.113.0
   *
   * The Philips Hue integration allows you to control and monitor the lights and motion sensors connected to your Hue bridge.
   * https://www.home-assistant.io/integrations/hue
   */
  allow_hue_groups?: Deprecated;

  /**
   * DEPRECATED as of Home Assistant 0.113.0
   *
   * The Philips Hue integration allows you to control and monitor the lights and motion sensors connected to your Hue bridge.
   * https://www.home-assistant.io/integrations/hue
   */
  allow_unreachable?: Deprecated;

  /**
   * DEPRECATED as of Home Assistant 0.113.0
   *
   * The Philips Hue integration allows you to control and monitor the lights and motion sensors connected to your Hue bridge.
   * https://www.home-assistant.io/integrations/hue
   */
  host: Deprecated;
}
