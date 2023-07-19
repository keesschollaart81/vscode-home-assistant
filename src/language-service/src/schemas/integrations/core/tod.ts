/**
 * Times of the Day integration
 * Source: https://github.com/home-assistant/core/tree/dev/homeassistant/components/tod/
 */
import { Time, TimePeriod } from "../../types";
import { PlatformSchema } from "../platform";

export type Domain = "tod";

export interface BinarySensorPlatformSchema extends PlatformSchema {
  /**
   * The tod platform supports binary sensors which get their values by checking if the current time is within defined time ranges.
   * https://www.home-assistant.io/integrations/tod
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
  before: "sunset" | "sunrise" | Time;

  /**
   * The time offset of the beginning time range.
   * https://www.home-assistant.io/integrations/tod/#before_offset
   */
  before_offset?: TimePeriod;

  /**
   * The absolute local time value or sun event for ending of the time range.
   * https://www.home-assistant.io/integrations/tod/#after
   */
  after: "sunset" | "sunrise" | Time;

  /**
   * The time offset of the ending time range.
   * https://www.home-assistant.io/integrations/tod/#after_offset
   */
  after_offset?: TimePeriod;

  /**
   * The unique ID for this config block. This will be prefixed to all unique IDs of all entities in this block.
   * https://www.home-assistant.io/integrations/tod/#unique_id
   */
  unique_id?: string;
}
