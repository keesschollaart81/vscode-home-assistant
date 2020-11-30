/**
 * Lovelace Dashboard
 * Source: https://github.com/home-assistant/frontend/blob/dev/src/data/lovelace.ts
 */
import { Deprecated, IncludeList, Include } from "../types";
import { View } from "./view";

type Views = View | Include;

/**
 * @TJS-additionalProperties true
 */
export interface Dashboard {
  /**
   * Sets a background for this Lovelace dashboard.
   * https://www.home-assistant.io/lovelace/dashboards-and-views/
   */
  background?: string;

  /**
   * The title of the dashboard, will be used in the sidebar.
   * https://www.home-assistant.io/lovelace/dashboards-and-views/
   */
  title?: string;

  /**
   * A list of view configurations.
   * https://www.home-assistant.io/lovelace/dashboards-and-views/#views
   */
  views: Views[] | IncludeList;

  /**
   * DEPRECATED.
   * Resources are now configured using the Lovelace integration configuration or use the preferred way of configuring those via the configuration panel.
   */
  resources?: {
    /**
     * DEPRECATED.
     * Resources are now configured using the Lovelace integration configuration or use the preferred way of configuring those via the configuration panel.
     */
    type: Deprecated;

    /**
     * DEPRECATED.
     * Resources are now configured using the Lovelace integration configuration or use the preferred way of configuring those via the configuration panel.
     */
    url: Deprecated;
  }[];
}
