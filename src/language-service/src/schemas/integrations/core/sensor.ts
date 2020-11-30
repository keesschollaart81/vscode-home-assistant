/**
 * Sensor integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/sensor/__init__.py
 */
import { IncludeList } from "../../types";
import { PlatformSchema } from "../platform";
import { SensorPlatformSchema as TemplatePlatformSchema } from "./template";
import { SensorPlatformSchema as MQTTPlatformSchema } from "./mqtt";
import { SensorPlatformSchema as MQTTRoomPlatformSchema } from "./mqtt_room";

export type Domain = "sensor";
export type Schema = Item[] | IncludeList;
export type File = Item | Item[];

/**
 * @TJS-additionalProperties true
 */
interface OtherPlatform extends PlatformSchema {
  /**
   * @TJS-pattern ^(?!(mqtt|mqtt_room|template)$)\w+$
   */
  platform: string;
}

type Item =
  | MQTTPlatformSchema
  | MQTTRoomPlatformSchema
  | TemplatePlatformSchema
  | OtherPlatform;
