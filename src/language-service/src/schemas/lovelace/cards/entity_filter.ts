/**
 * Lovelace Entity Filter Card
 * Sources:
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/hui-entity-filter-card.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/types.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/data/lovelace.ts
 */
import { Entity as EntityString } from "../../types";
import { Card, EntityConfig, ViewLayout } from "../types";

type Entity = EntityString | EntityFilterEntityConfig;
type StateFilter = StateFilterConfig | string;

export interface Schema {
  /**
   * The Entity Filter card allows you to define a list of entities that you want to track only when in a certain state.
   * https://www.home-assistant.io/lovelace/entity-filter/
   */
  type: "entity-filter";

  /**
   * Extra options to pass down to the card rendering the result.
   * https://www.home-assistant.io/lovelace/entity-filter/#card
   */
  card: Card;

  /**
   * A list of entity IDs or entity objects, see below.
   * https://www.home-assistant.io/lovelace/entity-filter/#entities
   */
  entities: Entity[];

  /**
   * Allows hiding of card when no entities returned by filter.
   * https://www.home-assistant.io/lovelace/entity-filter/#show_empty
   */
  show_empty?: boolean;

  /**
   * List of strings representing states or filter objects.
   * https://www.home-assistant.io/lovelace/entity-filter/#state_filter
   */
  state_filter: StateFilter[];

  /**
   * Layout options for the view this card is in
   */
  view_layout?: ViewLayout;
}

interface EntityFilterEntityConfig extends EntityConfig {
  /**
   * List of strings representing states or filter objects.
   * https://www.home-assistant.io/lovelace/entity-filter/#state_filter
   */
  state_filter?: StateFilter[];
}

interface StateFilterConfig {
  /**
   * Attribute of the entity to use instead of the state.
   * https://www.home-assistant.io/lovelace/entity-filter/#attribute
   */
  attribute?: string;

  /**
   * String representing the state.
   * https://www.home-assistant.io/lovelace/entity-filter/#value
   */
  value: string;

  /**
   * Operator to use in the comparison. Can be ==, <=, <, >=, >, !=, in, not in, or regex.
   * https://www.home-assistant.io/lovelace/entity-filter/#operator
   */
  operator?: "!=" | "<" | "<=" | "==" | ">" | ">=" | "in" | "not in" | "regex";
}
