/**
 * Uptime integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/uptime/
 */
import { Deprecated } from "../../types";
import { PlatformSchema } from "../platform";

export type Domain = "uptime";

export interface SensorPlatformSchema extends PlatformSchema {
  /**
   * The uptime sensor platform displays the time since the last Home Assistant restart.
   * https://www.home-assistant.io/integrations/uptime
   */
  platform: "uptime";

  /**
   * Name to use in the frontend.
   * https://www.home-assistant.io/integrations/uptime#name
   */
  name?: string;

  /**
   * DEPRECATED.
   * This configuration option has been deprecated and can be removed from your configuration.
   */
  unit_of_measurement?: Deprecated;
}
