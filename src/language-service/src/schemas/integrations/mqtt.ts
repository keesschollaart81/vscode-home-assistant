/**
 * MQTT integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/mqtt/
 */
import { DeviceClassesSensor, PositiveInteger, Template } from "../types";
import { PlatformSchema } from "../platform";

export type Domain = "mqtt";

export interface SensorPlatformSchema extends PlatformSchema {
  /**
   * This mqtt sensor platform uses the MQTT message payload as the sensor value.
   * https://www.home-assistant.io/integrations/sensor.mqtt
   */
  platform: "mqtt";

  /**
   * Set multiple availability topics for this sensor.
   */
  availability?: {
    /**
     * The MQTT topic subscribed to receive availability (online/offline) updates.
     * https://www.home-assistant.io/integrations/sensor.mqtt#availability_topic
     */
    topic?: string;

    /**
     * The payload that represents the available state.
     * https://www.home-assistant.io/integrations/sensor.mqtt#payload_available
     */
    payload_available?: string;

    /**
     * The payload that represents the unavailable state.
     * https://www.home-assistant.io/integrations/sensor.mqtt#payload_not_available
     */
    payload_not_available?: string;
  }[];

  /**
   * The MQTT topic subscribed to receive availability (online/offline) updates.
   * https://www.home-assistant.io/integrations/sensor.mqtt#availability_topic
   */
  availability_topic?: string;

  /**
   * The type/class of the sensor to set the icon in the frontend.
   * https://www.home-assistant.io/integrations/sensor.mqtt#device_class
   */
  device_class?: DeviceClassesSensor;

  /**
   * Information about the device this sensor is a part of to tie it into the device registry. Only works through MQTT discovery and when unique_id is set.
   * https://www.home-assistant.io/integrations/sensor.mqtt#device
   */
  device?: {
    /**
     * A list of connections of the device to the outside world as a list of tuples.
     * https://www.home-assistant.io/integrations/sensor.mqtt#connections
     */
    connections?: { [key: string]: string };

    /**
     * A list of IDs that uniquely identify the device. For example a serial number.
     * https://www.home-assistant.io/integrations/sensor.mqtt#identifiers
     */
    identifier?: string;

    /**
     * The manufacturer of the device.
     * https://www.home-assistant.io/integrations/sensor.mqtt#manufacturer
     */
    manufacturer?: string;

    /**
     * The model of the device.
     * https://www.home-assistant.io/integrations/sensor.mqtt#model
     */
    model?: string;

    /**
     * The name of the device.
     * https://www.home-assistant.io/integrations/sensor.mqtt#name
     */
    name?: string;

    /**
     * The firmware version of the device.
     * https://www.home-assistant.io/integrations/sensor.mqtt#sw_version
     */
    sw_version?: string;

    /**
     * Identifier of a device that routes messages between this device and Home Assistant. Examples of such devices are hubs, or parent devices of a sub-device.
     * https://www.home-assistant.io/integrations/sensor.mqtt#via_device
     */
    via_device?: string;
  };

  /**
   * Defines the number of seconds after the sensor’s state expires, if it’s not updated. After expiry, the sensor’s state becomes unavailable.
   * https://www.home-assistant.io/integrations/sensor.mqtt#expire_after
   */
  expire_after?: PositiveInteger;

  /**
   * Sends update events even if the value hasn’t changed. Useful if you want to have meaningful value graphs in history.
   * https://www.home-assistant.io/integrations/sensor.mqtt#expire_after
   */
  force_update?: boolean;

  /**
   * The icon for the sensor.
   * https://www.home-assistant.io/integrations/sensor.mqtt#icon
   */
  icon?: string;

  /**
   * Defines a template to extract the JSON dictionary from messages received on the json_attributes_topic.
   * https://www.home-assistant.io/integrations/sensor.mqtt#json_attributes_template
   */
  json_attributes_template?: Template;

  /**
   * The MQTT topic subscribed to receive a JSON dictionary payload and then set as sensor attributes. Implies force_update of the current sensor state when a message is received on this topic.
   * https://www.home-assistant.io/integrations/sensor.mqtt#json_attributes_topic
   */
  json_attributes_topic?: string;

  /**
   * The name of the MQTT sensor.
   * https://www.home-assistant.io/integrations/sensor.mqtt#name
   */
  name?: string;

  /**
   * The payload that represents the available state.
   * https://www.home-assistant.io/integrations/sensor.mqtt#payload_available
   */
  payload_available?: string;

  /**
   * The payload that represents the unavailable state.
   * https://www.home-assistant.io/integrations/sensor.mqtt#payload_not_available
   */
  payload_not_available?: string;

  /**
   * The maximum QoS level of the state topic.
   * https://www.home-assistant.io/integrations/sensor.mqtt#qos
   */
  qos?: number;

  /**
   * The MQTT topic subscribed to receive sensor values.
   * https://www.home-assistant.io/integrations/sensor.mqtt#state_topic
   */
  state_topic: string;

  /**
   * An ID that uniquely identifies this sensor. If two sensors have the same unique ID, Home Assistant will raise an exception.
   * https://www.home-assistant.io/integrations/sensor.mqtt#unique_id
   */
  unique_id?: string;

  /**
   * Defines the units of measurement of the sensor, if any.
   * https://www.home-assistant.io/integrations/sensor.mqtt#unit_of_measurement
   */
  unit_of_measurement?: string;

  /**
   * Defines a template to extract the value.
   * https://www.home-assistant.io/integrations/sensor.mqtt#value_template
   */
  value_template?: Template;
}
