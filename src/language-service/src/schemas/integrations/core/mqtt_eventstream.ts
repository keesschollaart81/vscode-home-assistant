/**
 * MQTT Eventstream integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/mqtt_eventstream/__init__.py
 */
export type Domain = "mqtt_eventstream";
export interface Schema {
  /**
   * Topic for publishing local events.
   * https://www.home-assistant.io/integrations/mqtt_eventstream/#publish_topic
   */
  publish_topic?: string;

  /**
   * Topic to receive events from the remote server.
   * https://www.home-assistant.io/integrations/mqtt_eventstream/#subscribe_topic
   */
  subscribe_topic?: string;

  /**
   * Ignore sending these events over mqtt.
   * https://www.home-assistant.io/integrations/mqtt_eventstream/#ignore_event
   */
  ignore_event?: string[];
}
