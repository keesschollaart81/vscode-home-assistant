/**
 * Group integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/group/__init__.py
 */
import { Entity, Entities, IncludeNamed } from "../types";

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
  entities: Entities | Entity[];

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
