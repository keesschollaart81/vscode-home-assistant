/**
 * Binary Sensor integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/binary_sensor/__init__.py
 */
import { IncludeList } from "../types";
import { PlatformSchema } from "../platform";
import { BinarySensorPlatformSchema as TemplatePlatformSchema } from "./template";

export type Domain = "binary_sensor";
export type Schema = Item[] | IncludeList;
export type File = Item | Item[];

/**
 * @TJS-additionalProperties true
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface OtherPlatform extends PlatformSchema {
  /**
   * @TJS-pattern ^(?!template)\w+$
   */
  platform: string;
}

type Item = TemplatePlatformSchema | OtherPlatform;
