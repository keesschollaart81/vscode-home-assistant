/**
 * Template integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/template/
 */
import {
  Deprecated,
  IncludeNamed,
  Template,
  DeviceClassesBinarySensor,
  DeviceClassesSensor,
  TimePeriod,
} from "../types";
import { PlatformSchema } from "../platform";

export type Domain = "template";

export interface BinarySensorPlatformSchema extends PlatformSchema {
  /**
   * The template platform supports binary sensors which get their values from other entities. The state of a Template Binary Sensor can only be on or off.
   * https://www.home-assistant.io/integrations/binary_sensor.template
   */
  platform: "template";

  /**
   * List of sensors.
   * https://www.home-assistant.io/integrations/binary_sensor.template#sensors
   */
  sensors: {
    [key: string]: BinarySensorItem | IncludeNamed;
  };
}

export interface SensorPlatformSchema extends PlatformSchema {
  /**
   * The template platform supports sensors which get their values from other entities.
   * https://www.home-assistant.io/integrations/template
   */
  platform: "template";

  /**
   * List of sensors.
   * https://www.home-assistant.io/integrations/template#sensors
   */
  sensors: {
    [key: string]: SensorItem | IncludeNamed;
  };
}

interface BinarySensorItem {
  /**
   * Defines templates for attributes of the sensor.
   * https://www.home-assistant.io/integrations/binary_sensor.template#attribute_templates
   */
  attribute_templates?: { [key: string]: Template };

  /**
   * Defines a template to get the available state of the sensor. Return true if the device is available, false otherwise.
   * https://www.home-assistant.io/integrations/binary_sensor.template#availability_template
   */
  availability_template?: Template;

  /**
   * The amount of time the template state must be not met before this sensor will switch to off.
   * https://www.home-assistant.io/integrations/binary_sensor.template#delay_off
   */
  delay_off?: TimePeriod;

  /**
   * The amount of time the template state must be met before this sensor will switch to on.
   * https://www.home-assistant.io/integrations/binary_sensor.template#delay_on
   */
  delay_on?: TimePeriod;

  /**
   * Sets the class of the device, changing the device state and icon that is displayed on the frontend.
   * https://www.home-assistant.io/integrations/binary_sensor.template#device_class
   */
  device_class?: DeviceClassesBinarySensor;

  /**
   * DEPRECATED as of Home Assistant 0.115.0
   */
  entity_id?: Deprecated;

  /**
   * Defines a template for the entity picture of the sensor.
   * https://www.home-assistant.io/integrations/binary_sensor.template#entity_picture_template
   */
  entity_picture_template?: Template;

  /**
   * Name to use in the frontend.
   * https://www.home-assistant.io/integrations/binary_sensor.template#friendly_name
   */
  friendly_name?: string;

  /**
   * Defines a template for the icon of the sensor.
   * https://www.home-assistant.io/integrations/binary_sensor.template#icon_template
   */
  icon_template?: Template;

  /**
   * An ID that uniquely identifies this binary sensor. Set this to an unique value to allow customization through the UI.
   * https://www.home-assistant.io/integrations/binary_sensor.template#unique_id
   */
  unique_id?: string;

  /**
   * The sensor is on if the template evaluates as True and off otherwise.
   * https://www.home-assistant.io/integrations/binary_sensor.template#value_template
   */
  value_template: Template;
}

interface SensorItem {
  /**
   * Defines templates for attributes of the sensor.
   * https://www.home-assistant.io/integrations/template#attribute_templates
   */
  attribute_templates?: { [key: string]: Template };

  /**
   * Defines a template to get the available state of the sensor. Return true if the device is available, false otherwise.
   * https://www.home-assistant.io/integrations/template#availability_template
   */
  availability_template?: Template;

  /**
   * Sets the class of the device, changing the device state and icon that is displayed on the frontend.
   * https://www.home-assistant.io/integrations/template#device_class
   */
  device_class?: DeviceClassesSensor;

  /**
   * DEPRECATED as of Home Assistant 0.115.0
   */
  entity_id?: Deprecated;

  /**
   * Defines a template for the entity picture of the sensor.
   * https://www.home-assistant.io/integrations/binary_sensor.template#entity_picture_template
   */
  entity_picture_template?: Template;

  /**
   * Name to use in the frontend.
   * https://www.home-assistant.io/integrations/binary_sensor.template#friendly_name
   */
  friendly_name?: string;

  /**
   * Defines a template for the name to be used in the frontend (this overrides friendly_name).
   * https://www.home-assistant.io/integrations/binary_sensor.template#friendly_name
   */
  friendly_name_template?: Template;

  /**
   * Defines a template for the icon of the sensor.
   * https://www.home-assistant.io/integrations/binary_sensor.template#icon_template
   */
  icon_template?: Template;

  /**
   * Defines the units of measurement of the sensor, if any. This will also influence the graphical presentation in the history visualization as a continuous value.
   * https://www.home-assistant.io/integrations/binary_sensor.template#unique_id
   */
  unit_of_measurement?: string;

  /**
   * An ID that uniquely identifies this binary sensor. Set this to an unique value to allow customization through the UI.
   * https://www.home-assistant.io/integrations/template#unique_id
   */
  unique_id?: string;

  /**
   * Defines a template to get the state of the sensor.
   * https://www.home-assistant.io/integrations/template#value_template
   */
  value_template: Template;
}
