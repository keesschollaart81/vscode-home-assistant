/**
 * Lovelace Headers & Footers
 * Source: https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/header-footer/types.ts
 */
import {
  Entity as EntityString,
  PositiveInteger,
  SensorEntity,
} from "../types";
import { EntityConfig } from "./types";
import { Action } from "./actions";

export type HeaderFooter =
  | ButtonsHeaderFooter
  | GraphHeaderFooter
  | PictureHeaderFooter;

type Entity = EntityString | EntityConfig;

interface ButtonsHeaderFooter {
  /**
   * Widget to show entities as buttons in the header or footer.
   * https://www.home-assistant.io/lovelace/header-footer/#buttons-header--footer
   */
  type: "buttons";

  /**
   * A list of entities to show. Each entry is either an entity ID or a entity configuration.
   * https://www.home-assistant.io/lovelace/header-footer/#entities
   */
  entities: Entity[];
}

interface GraphHeaderFooter {
  /**
   * Widget to show an entity in the sensor domain as a graph in the header or footer.
   * https://www.home-assistant.io/lovelace/header-footer/#graph-header--footer
   */
  type: "graph";

  /**
   * Entity id of sensor domain
   * https://www.home-assistant.io/lovelace/header-footer/#entity
   */
  entity: SensorEntity;

  /**
   * Detail of the graph 1 or 2, 1 equals one point/hour, 2 equals six points/hour.
   * https://www.home-assistant.io/lovelace/header-footer/#detail
   */
  detail?: 1 | 2;

  /**
   * Hours to show in graph.
   * https://www.home-assistant.io/lovelace/header-footer/#hours_to_show
   */
  hours_to_show: PositiveInteger;
}

interface PictureHeaderFooter {
  /**
   * Widget to show a picture as a header or a footer. A picture can have touch actions associated with it.
   * https://www.home-assistant.io/lovelace/header-footer/#picture-header--footer
   */
  type: "picture";

  /**
   * Action to take on double tap.
   * https://www.home-assistant.io/lovelace/header-footer/#double_tap_action
   */
  double_tap_action?: Action;

  /**
   * Action to take on tap-and-hold.
   * https://www.home-assistant.io/lovelace/header-footer/#hold_action
   */
  hold_action?: Action;

  /**
   * The URL of an image.
   * https://www.home-assistant.io/lovelace/header-footer/#image
   */
  image: string;

  /**
   * Action take on card tap.
   * https://www.home-assistant.io/lovelace/header-footer/#tap_action
   */
  tap_action?: Action;
}
