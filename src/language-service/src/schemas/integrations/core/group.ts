/**
 * Group integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/group/__init__.py
 */
import { 
  DeviceClassesBinarySensor, 
  DeviceClassesCover,
  DeviceClassesMediaPlayer,
  DeviceClassesSensor,
  Entities, 
  IncludeNamed,
  StateClassesSensor,
  Data
} from "../../types";
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
   * https://www.home-assistant.io/integrations/binary_sensor.group/#all
   */
  all?: boolean;

  /**
   * Sets the class of the device, changing the device state and icon that is displayed on the UI.
   * https://www.home-assistant.io/integrations/binary_sensor.group#device_class
   */
  device_class?: DeviceClassesBinarySensor;

  /**
   * A list of entities to be included in the binary sensor group.
   * https://www.home-assistant.io/integrations/binary_sensor.group/#entities
   */
  entities: Entities;

  /**
   * The name of the binary sensor group. Defaults to "Binary Sensor Group".
   * https://www.home-assistant.io/integrations/binary_sensor.group#name
   */
  name?: string;

  /**
   * An ID that uniquely identifies this binary sensor group. If two binary sensors have the same unique ID, Home Assistant will raise an error.
   * https://www.home-assistant.io/integrations/binary_sensor.group#unique_id
   */
  unique_id?: string;
}

export interface ButtonPlatformSchema extends PlatformSchema {
  /**
   * The group button platform lets you combine multiple buttons into one entity.
   * https://www.home-assistant.io/integrations/group#button-groups
   */
  platform: "group";

  /**
   * Sets the class of the device, changing the device state and icon that is displayed on the UI.
   * https://www.home-assistant.io/integrations/group#button-groups
   */
  device_class?: string;

  /**
   * A list of entities to be included in the button group.
   * https://www.home-assistant.io/integrations/group#button-groups
   */
  entities: Entities;

  /**
   * The name of the button group.
   * https://www.home-assistant.io/integrations/group#button-groups
   */
  name?: string;

  /**
   * An ID that uniquely identifies this button group.
   * https://www.home-assistant.io/integrations/group#button-groups
   */
  unique_id?: string;
}

export interface CoverPlatformSchema extends PlatformSchema {
  /**
   * The group cover platform lets you combine multiple covers into one entity.
   * https://www.home-assistant.io/integrations/group#cover-groups
   */
  platform: "group";

  /**
   * Sets the class of the device, changing the device state and icon that is displayed on the UI.
   * https://www.home-assistant.io/integrations/group#cover-groups
   */
  device_class?: DeviceClassesCover;

  /**
   * A list of entities to be included in the cover group.
   * https://www.home-assistant.io/integrations/group#cover-groups
   */
  entities: Entities;

  /**
   * The name of the cover group.
   * https://www.home-assistant.io/integrations/group#cover-groups
   */
  name?: string;

  /**
   * An ID that uniquely identifies this cover group.
   * https://www.home-assistant.io/integrations/group#cover-groups
   */
  unique_id?: string;
}

export interface EventPlatformSchema extends PlatformSchema {
  /**
   * The group event platform lets you combine multiple events into one entity.
   * https://www.home-assistant.io/integrations/group#event-groups
   */
  platform: "group";

  /**
   * A list of entities to be included in the event group.
   * https://www.home-assistant.io/integrations/group#event-groups
   */
  entities: Entities;

  /**
   * The name of the event group.
   * https://www.home-assistant.io/integrations/group#event-groups
   */
  name?: string;

  /**
   * An ID that uniquely identifies this event group.
   * https://www.home-assistant.io/integrations/group#event-groups
   */
  unique_id?: string;
}

export interface FanPlatformSchema extends PlatformSchema {
  /**
   * The group fan platform lets you combine multiple fans into one entity.
   * https://www.home-assistant.io/integrations/group#fan-groups
   */
  platform: "group";

  /**
   * A list of entities to be included in the fan group.
   * https://www.home-assistant.io/integrations/group#fan-groups
   */
  entities: Entities;

  /**
   * The name of the fan group.
   * https://www.home-assistant.io/integrations/group#fan-groups
   */
  name?: string;

  /**
   * An ID that uniquely identifies this fan group.
   * https://www.home-assistant.io/integrations/group#fan-groups
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
   * A list of entities to be included in the light group.
   * https://www.home-assistant.io/integrations/light.group/#entities
   */
  entities: Entities;

  /**
   * The name of the light group. Defaults to "Light Group".
   * https://www.home-assistant.io/integrations/light.group/#name
   */
  name?: string;

  /**
   * An ID that uniquely identifies this light group. If two lights have the same unique ID, Home Assistant will raise an error.
   * https://www.home-assistant.io/integrations/light.group/#unique_id
   */
  unique_id?: string;
}

export interface LockPlatformSchema extends PlatformSchema {
  /**
   * The group lock platform lets you combine multiple locks into one entity.
   * https://www.home-assistant.io/integrations/group#lock-groups
   */
  platform: "group";

  /**
   * A list of entities to be included in the lock group.
   * https://www.home-assistant.io/integrations/group#lock-groups
   */
  entities: Entities;

  /**
   * The name of the lock group.
   * https://www.home-assistant.io/integrations/group#lock-groups
   */
  name?: string;

  /**
   * An ID that uniquely identifies this lock group.
   * https://www.home-assistant.io/integrations/group#lock-groups
   */
  unique_id?: string;
}

export interface MediaPlayerPlatformSchema extends PlatformSchema {
  /**
   * The group media_player platform lets you combine multiple media players into one entity.
   * https://www.home-assistant.io/integrations/group#media-player-groups
   */
  platform: "group";

  /**
   * Sets the class of the device, changing the device state and icon that is displayed on the UI.
   * https://www.home-assistant.io/integrations/group#media-player-groups
   */
  device_class?: DeviceClassesMediaPlayer;

  /**
   * A list of entities to be included in the media player group.
   * https://www.home-assistant.io/integrations/group#media-player-groups
   */
  entities: Entities;

  /**
   * The name of the media player group.
   * https://www.home-assistant.io/integrations/group#media-player-groups
   */
  name?: string;

  /**
   * An ID that uniquely identifies this media player group.
   * https://www.home-assistant.io/integrations/group#media-player-groups
   */
  unique_id?: string;
}

export interface SensorPlatformSchema extends PlatformSchema {
  /**
   * The group sensor platform lets you combine multiple sensors into one entity.
   * https://www.home-assistant.io/integrations/group#sensor-number-and-input_number-groups
   */
  platform: "group";

  /**
   * Sets the class of the device, changing the device state and icon that is displayed on the UI.
   * https://www.home-assistant.io/integrations/group#device_class
   */
  device_class?: DeviceClassesSensor;

  /**
   * A list of entities to be included in the sensor group.
   * https://www.home-assistant.io/integrations/group#sensor-number-and-input_number-groups
   */
  entities: Entities;

  /**
   * Set this to true if the group state should ignore sensors with non numeric values.
   * https://www.home-assistant.io/integrations/group#ignore_non_numeric
   */
  ignore_non_numeric?: boolean;

  /**
   * The name of the sensor group.
   * https://www.home-assistant.io/integrations/group#sensor-number-and-input_number-groups
   */
  name?: string;

  /**
   * Sets the state class for the sensor.
   * https://www.home-assistant.io/integrations/group#state_class
   */
  state_class?: StateClassesSensor;

  /**
   * The type of sensor: min, max, last, mean, median, range, product, stdev, or sum.
   * https://www.home-assistant.io/integrations/group#type
   */
  type: "min" | "max" | "last" | "mean" | "median" | "range" | "product" | "stdev" | "sum";

  /**
   * An ID that uniquely identifies this sensor group.
   * https://www.home-assistant.io/integrations/group#sensor-number-and-input_number-groups
   */
  unique_id?: string;

  /**
   * Set the unit of measurement for the sensor.
   * https://www.home-assistant.io/integrations/group#unit_of_measurement
   */
  unit_of_measurement?: string;
}

export interface SwitchPlatformSchema extends PlatformSchema {
  /**
   * The group switch platform lets you combine multiple switches into one entity.
   * https://www.home-assistant.io/integrations/group#binary-sensor-light-and-switch-groups
   */
  platform: "group";

  /**
   * Set this to true if the group state should only turn on if all grouped entities are on, false otherwise.
   * https://www.home-assistant.io/integrations/group#binary-sensor-light-and-switch-groups
   */
  all?: boolean;

  /**
   * A list of entities to be included in the switch group.
   * https://www.home-assistant.io/integrations/group#binary-sensor-light-and-switch-groups
   */
  entities: Entities;

  /**
   * The name of the switch group.
   * https://www.home-assistant.io/integrations/group#binary-sensor-light-and-switch-groups
   */
  name?: string;

  /**
   * An ID that uniquely identifies this switch group.
   * https://www.home-assistant.io/integrations/group#binary-sensor-light-and-switch-groups
   */
  unique_id?: string;
}

export interface NotifyPlatformSchema extends PlatformSchema {
  /**
   * The group notify platform lets you combine multiple notification services into one.
   * https://www.home-assistant.io/integrations/group#notify-groups
   */
  platform: "group";

  /**
   * Setting the parameter name sets the name of the group.
   * https://www.home-assistant.io/integrations/group#notify-groups
   */
  name: string;

  /**
   * A list of all the notification services to be included in the group.
   * https://www.home-assistant.io/integrations/group#notify-groups
   */
  services: NotifyService[];
}

interface NotifyService {
  /**
   * The name part of an entity ID, e.g., if you use notify.html5 normally, just put html5.
   * https://www.home-assistant.io/integrations/group#action
   */
  action: string;

  /**
   * A dictionary containing parameters to add to all notify payloads.
   * https://www.home-assistant.io/integrations/group#data
   */
  data?: Data;
}
