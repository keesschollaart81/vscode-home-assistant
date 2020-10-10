/**
 * Vacuum integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/vacuum/__init__.py
 */
import { IncludeList } from "../types";
import { PlatformSchema } from "../platform";
import {
  VacuumPlatformSchema as MQTTPlatformSchema,
  VacuumLegacyPlatformSchema as MQTTLegacyPlatformSchema,
} from "./mqtt";
import { VacuumPlatformSchema as TemplatePlatformSchema } from "./template";

export type Domain = "vacuum";
export type Schema = Item[] | IncludeList;
export type File = Item | Item[];

/**
 * @TJS-additionalProperties true
 */
interface OtherPlatform extends PlatformSchema {
  /**
   * @TJS-pattern ^(?!(mqtt|template)$)\w+$
   */
  platform: string;
}

type Item =
  | MQTTPlatformSchema
  | MQTTLegacyPlatformSchema
  | TemplatePlatformSchema
  | OtherPlatform;
