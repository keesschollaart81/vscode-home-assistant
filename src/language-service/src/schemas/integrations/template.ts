/**
 * Template integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/template/
 */
import {
  Deprecated,
  IncludeNamed,
  Template,
  DeviceClassesBinarySensor,
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
