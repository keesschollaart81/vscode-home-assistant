/**
 * Group integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/group/__init__.py
 */
import { DeviceClassesBinarySensor, Entities, IncludeNamed } from "../../types";
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

export interface BinarySensorPlatformSchema extends PlatformSchema {
  /**
   * The group binary_sensor platform lets you combine multiple binary_sensors into one entity.
   * https://www.home-assistant.io/integrations/binary_sensor.group
   */
  platform: "group";

  /**
   * Set this to true if the group state should only turn on if all grouped entities are on, false otherwise.
   * https://www.home-assistant.io/integrations/binary_sensor.group/#entities
   */
  all?: boolean;

  /**
   * Set this to true if the group state should only turn on if all grouped entities are on, false otherwise.
   * https://www.home-assistant.io/integrations/binary_sensor.group#device_class
   */
  device_class?: DeviceClassesBinarySensor;

  /**
   * A list of entities to be included in the binary sensor group.
   * https://www.home-assistant.io/integrations/binary_sensor.group/#entities
   */
  entities: Entities;

  /**
   * The name of the binary sensor group. Defaults to "Binary Sensor Group”.
   * https://www.home-assistant.io/integrations/binary_sensor.group#name
   */
  name?: string;

  /**
   * An ID that uniquely identifies this binary sensor group. If two binary sensors have the same unique ID, Home Assistant will raise an error.
   * https://www.home-assistant.io/integrations/binary_sensor.group#unique_id
   */
  unique_id?: string;
}

export interface LightPlatformSchema extends PlatformSchema {
  /**
   * The group light platform lets you combine multiple lights into one entity.
   * https://www.home-assistant.io/integrations/light.group/
   */
  platform: "group";

  /**
   * Set this to true if the group state should only turn on if all grouped entities are on, false otherwise.
   * https://www.home-assistant.io/integrations/light.group/#all
   */
  all?: boolean;

  /**
   *
   * A list of entities to be included in the light group.
   * https://www.home-assistant.io/integrations/light.group/#entities
   */
  entities: Entities;

  /**
   * The name of the light group. Defaults to “Light Group”.
   * https://www.home-assistant.io/integrations/light.group/#name
   */
  name?: string;

  /**
   * An ID that uniquely identifies this light group. If two lights have the same unique ID, Home Assistant will raise an error.
   * https://www.home-assistant.io/integrations/light.group/#unique_id
   */
  unique_id?: string;
}
