/**
 * Sensor integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/sensor/__init__.py
 */
import { IncludeList } from "../types";
import { PlatformSchema } from "../platform";
import { SensorPlatformSchema as TemplatePlatformSchema } from "./template";
import { SensorPlatformSchema as MQTTPlatformSchema } from "./mqtt";

export type Domain = "sensor";
export type Schema = Item[] | IncludeList;
export type File = Item | Item[];

/**
 * @TJS-additionalProperties true
 */
interface OtherPlatform extends PlatformSchema {
  /**
   * @TJS-pattern ^(?!mqtt|template)\w+$
   */
  platform: string;
}

type Item = MQTTPlatformSchema | TemplatePlatformSchema | OtherPlatform;
