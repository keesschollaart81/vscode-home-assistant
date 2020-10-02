import { Core } from "./core";
import { Sensors } from "./sensors";
// eslint-disable-next-line import/extensions
import * as integrations from "./integrations";
import { IncludeList, IncludeNamed } from "./types";

/**
 * @TJS-additionalProperties true
 */
export interface HomeAssistantRoot
  extends InternalIntegrations,
    CoreIntegrations,
    CustomIntegrations {
  /**
   * Home Assistant Core configuration
   * https://www.home-assistant.io/docs/configuration/basic
   */
  homeassistant?: Core | IncludeList;
}

/**
 * This interface contains all integrations that are marked as "internal" to
 * Home Assistant. Core things like light, switch, sensor, automations.
 * These integrations generally do not connect with a device or service.
 */
export interface InternalIntegrations {
  /**
   * Automations offer the capability to call a service based on a simple or complex trigger. Automation allows a condition such as a sunset to cause an event, such as a light turning on.
   * https://www.home-assistant.io/docs/automation/
   */
  automation?: integrations.Automation.Schema | IncludeList;

  /**
   * Groups allows you to combine multiple entities into a single group entity.
   * https://www.home-assistant.io/integrations/group
   */
  group?: integrations.Group.Schema | IncludeNamed | null;

  /**
   * The http integration serves all files and data required for the Home Assistant frontend. You only need to add this to your configuration file if you want to change any of the default settings.
   * https://www.home-assistant.io/integrations/http
   */
  http?: integrations.HTTP.Schema | IncludeNamed | null;

  /**
   * The input_boolean integration allows the user to define boolean values that can be controlled via the frontend and can be used within conditions of automation. This can for example be used to disable or enable certain automations.
   * https://www.home-assistant.io/integrations/input_boolean
   */
  input_boolean?: integrations.InputBoolean.Schema | IncludeNamed | null;

  /**
   * The input_number integration allows the user to define values that can be controlled via the frontend and can be used within conditions of automation. The frontend can display a slider, or a numeric input box.
   * https://www.home-assistant.io/integrations/input_number
   */
  input_number?: integrations.InputNumber.Schema | IncludeNamed | null;

  /**
   * The panel_iframe support allows you to add additional panels to your Home Assistant frontend. The panels are listed in the sidebar and can contain external resources like the web frontend of your router, your monitoring system, or your media server.
   * https://www.home-assistant.io/integrations/panel_iframe
   */
  panel_iframe?: integrations.PanelIframe.Schema | IncludeNamed;

  /**
   * The script integration allows users to specify a sequence of actions to be executed by Home Assistant. These are run when you turn the script on. The script integration will create an entity for each script and allow them to be controlled via services.
   * https://www.home-assistant.io/integrations/script
   */
  script?: integrations.Script.Schema | IncludeNamed;

  /**
   * You can create scenes that capture the states you want certain entities to be. For example, a scene can specify that light A should be turned on and light B should be bright red.
   * https://www.home-assistant.io/integrations/scene
   */
  scene?: integrations.Scene.Schema | IncludeList;

  sensor?: null | Array<Sensors> | IncludeList; // TODO: Migrate to new structure
}

/**
 * This interface contains all integrations that are not marked internal
 * but are shipped with Home Assistant by default.
 */
export interface CoreIntegrations {
  /**
   * DEPRECATED as of Home Assistant 0.113.0
   *
   * The Philips Hue integration allows you to control and monitor the lights and motion sensors connected to your Hue bridge.
   * https://www.home-assistant.io/integrations/hue
   */
  hue?: integrations.Hue.Schema | IncludeNamed;
}

/**
 * This interface contains definitions for custom integrations, also known as:
 * custom_components.
 */
export interface CustomIntegrations {
  /**
   * Home Assistant Community Store
   * https://hacs.xyz/
   */
  hacs?: integrations.HACS.Schema | IncludeNamed;
}
