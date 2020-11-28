/**
 * iframe Panel integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/panel_iframe/__init__.py
 */
import { IncludeNamed } from "../../types";

export type Domain = "panel_iframe";
export interface Schema {
  [key: string]: Item | IncludeNamed;
}

interface Item {
  /**
   * The icon that shows in the sidebar/menu.
   * https://www.home-assistant.io/integrations/panel_iframe/#icon
   */
  icon?: string;

  /**
   * If admin access is required to see this iframe.
   * https://www.home-assistant.io/integrations/panel_iframe/#require_admin
   */
  require_admin?: boolean;

  /**
   * Friendly title for the panel. Will be used in the sidebar/menu.
   * https://www.home-assistant.io/integrations/panel_iframe/#title
   */
  title: string;

  /**
   * The absolute URL or relative URL with an absolute path to open.
   * https://www.home-assistant.io/integrations/panel_iframe/#url
   *
   * @TJS-format uri
   */
  url: string;
}
