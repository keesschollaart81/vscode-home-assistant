/**
 * Times of the Day integration
 * Source: https://github.com/home-assistant/core/tree/dev/homeassistant/components/tod/
 */
import { TimePeriod } from "../../types";
import { PlatformSchema } from "../platform";

export type Domain = "tod";

export interface BinarySensorPlatformSchema extends PlatformSchema {
  /**
   * The uptime sensor platform displays the time since the last Home Assistant restart.
   * https://www.home-assistant.io/integrations/uptime
   */
  platform: "tod";

  /**
   * Name of the sensor
   * https://www.home-assistant.io/integrations/tod/#name
   */
  name: string;

  /**
   * The absolute local time value or sun event for beginning of the time range.
   * https://www.home-assistant.io/integrations/tod/#before
   */
  before: string | TimePeriod;

  /**
   * The time offset of the beginning time range.
   * https://www.home-assistant.io/integrations/tod/#before_offset
   */
  before_offset?: TimePeriod;

  /**
   * The absolute local time value or sun event for ending of the time range.
   * https://www.home-assistant.io/integrations/tod/#after
   */
  after: string | TimePeriod;

  /**
   * The time offset of the ending time range.
   * https://www.home-assistant.io/integrations/tod/#after_offset
   */
  after_offset?: TimePeriod;
}
