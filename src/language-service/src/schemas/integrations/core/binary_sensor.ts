/**
 * Binary Sensor integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/binary_sensor/__init__.py
 */
import { IncludeList } from "../../types";
import { PlatformSchema } from "../platform";
import { BinarySensorPlatformSchema as GroupPlatformSchema } from "./group";
import { BinarySensorPlatformSchema as TemplatePlatformSchema } from "./template";
import { BinarySensorPlatformSchema as TodPlatformSchema } from "./tod";

export type Domain = "binary_sensor";
export type Schema = Item[] | IncludeList;
export type File = Item | Item[];

/**
 * @TJS-additionalProperties true
 */
 
interface OtherPlatform extends PlatformSchema {
  /**
   * @TJS-pattern ^(?!(group|template|tod|mqtt)$)\w+$
   */
  platform: string;
}

type Item =
  | GroupPlatformSchema
  | TemplatePlatformSchema
  | TodPlatformSchema
  | OtherPlatform;
