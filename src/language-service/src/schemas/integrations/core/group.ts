/**
 * Group integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/group/__init__.py
 */
import { Entities, IncludeNamed } from "../../types";
import { PlatformSchema } from "../platform";

export type Domain = "group";
export interface Schema {
  [key: string]: Item | IncludeNamed;
}

interface Item {
  /**
   * Set this to true if the group state should only turn on if all grouped entities are on, false otherwise.
   * https://www.home-assistant.io/integrations/group
   */
  all?: boolean;

  /**
   * A list of entities to group.
   * https://www.home-assistant.io/integrations/group#entities
   */
  entities: Entities;

  /**
   * The icon that shows in the frontend.
   * https://www.home-assistant.io/integrations/group#icon
   */
  icon?: string;

  /**
   * Name of the group.
   * https://www.home-assistant.io/integrations/group#name
   */
  name?: string;
}

export interface LightPlatformSchema extends PlatformSchema {
  /**
   * The group light platform lets you combine multiple lights into one entity.
   * https://www.home-assistant.io/integrations/light.group/
   */
  platform: "group";

  /**
   * A list of entities to be included in the light group.
   * https://www.home-assistant.io/integrations/light.group/#entities
   */
  entities: Entities;

  /**
   * The name of the light group. Defaults to “Light Group”.
   * https://www.home-assistant.io/integrations/light.group/#name
   */
  name?: string;
}
