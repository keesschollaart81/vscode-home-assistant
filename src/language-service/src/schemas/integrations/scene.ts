/**
 * Scene integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/scene/__init__.py
 */
import { IncludeNamed, IncludeList, Deprecated } from "../types";

export type Domain = "scene";
export type Schema = Item[] | IncludeList;

interface Item {
  /**
   * Entities to control and their desired state.
   * https://www.home-assistant.io/integrations/scene#entities
   */
  entities:
    | {
        [entity: string]: ItemEntity;
      }
    | IncludeNamed;

  /**
   * The icon that shows in the frontend.
   * https://www.home-assistant.io/integrations/scene#icon
   */
  icon?: string;

  /**
   * A unique identifier for this automation.
   * Do not use the same twice, ever!
   * https://www.home-assistant.io/integrations/scene
   */
  id?: string;

  /**
   * Friendly name of scene.
   * https://www.home-assistant.io/integrations/scene#name
   */
  name: string;
}

/**
 * @TJS-additionalProperties true
 */
export interface ItemEntity {
  state?: string;
  /**
   * @TSJ-type integer
   * @minimum 0
   * @maximum 255
   */
  brightness?: number | string;
  source?: string;
  /**
   * @minimum 1
   */
  color_temp?: number | string;
  xy_color?: any;

  /**
   * DEPRECATED.
   *
   * Using transitions on scene using this property is no longer supported.
   * Alternative: https://www.home-assistant.io/docs/scene/#using-scene-transitions
   */
  transition?: Deprecated;
}
