/**
 * Shared platform entity models
 */

import { TimePeriod } from "../types";

export interface PlatformSchema {
  /**
   * Platform domain
   */
  platform: string;

  /**
   * By setting an entity namespace, all entities will be prefixed with that namespace.
   * https://www.home-assistant.io/docs/configuration/platform_options/#entity-namespace
   */
  entity_namespace?: string;

  /**
   * Allow to change the polling interval if the platform uses a polling mechanism.
   * https://www.home-assistant.io/docs/configuration/platform_options/#scan-interval
   */
  scan_interval?: TimePeriod;
}
