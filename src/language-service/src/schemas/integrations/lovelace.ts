/**
 * Lovelace integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/lovelace/__init__.py
 */

export type Domain = "lovelace";
export interface Schema {
  /**
   * Additional Lovelace YAML dashboards. The key is used for the URL and should contain a hyphen (-)
   * https://www.home-assistant.io/lovelace/dashboards-and-views/#dashboards
   */
  dashboards?: { [key: string]: DashboardItem };

  /**
   * In what mode should the main Lovelace panel be, yaml or storage (UI managed).
   * https://www.home-assistant.io/lovelace/dashboards-and-views/#mode
   */
  mode?: "yaml" | "storage";

  /**
   * List of resources that should be loaded when you use Lovelace.
   * https://www.home-assistant.io/lovelace/dashboards-and-views/#resources
   */
  resources?: ResourceItem[];
}

interface DashboardItem {
  /**
   * The file in your config directory where the Lovelace configuration for this panel is.
   * https://www.home-assistant.io/lovelace/dashboards-and-views/#filename
   */
  filename: string;

  /**
   * The icon to show in the sidebar.
   * https://www.home-assistant.io/lovelace/dashboards-and-views/#icon
   */
  icon?: string;

  /**
   * The mode of the dashboard, this should always be yaml. Dashboards in storage mode can be created in the Lovelace configuration panel.
   * https://www.home-assistant.io/lovelace/dashboards-and-views/#mode
   */
  mode: "yaml";

  /**
   * Should this dashboard be only accessible for admin users.
   * https://www.home-assistant.io/lovelace/dashboards-and-views/#require_admin
   */
  require_admin?: boolean;

  /**
   * Should this dashboard be shown in the sidebar.
   * https://www.home-assistant.io/lovelace/dashboards-and-views/#show_in_sidebar
   */
  show_in_sidebar?: boolean;

  /**
   * The title of the dashboard, will be used in the sidebar.
   * https://www.home-assistant.io/lovelace/dashboards-and-views/#title
   */
  title: string;
}

interface ResourceItem {
  /**
   * The type of resource, this should be either module for a JavaScript module or css for a StyleSheet.
   */
  type: "css" | "module";

  /**
   * The URL of the resource to load.
   * https://www.home-assistant.io/lovelace/dashboards-and-views/#url
   */
  url: string;
}
