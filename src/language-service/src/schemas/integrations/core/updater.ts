/**
 * Updater integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/updater/__init__.py
 */
import { Deprecated } from "../../types";

export type Domain = "updater";
export interface Schema {
  /**
   * DEPRECATED as of Home Assistant Core 2021.4.0
   *
   * Replaced by the Analytic integration
   * https://www.home-assistant.io/integrations/analytics
   */
  include_used_components?: Deprecated;

  /**
   * DEPRECATED as of Home Assistant Core 2021.4.0
   *
   * Replaced by the Analytic integration
   * https://www.home-assistant.io/integrations/analytics
   */
  reporting?: Deprecated;
}
