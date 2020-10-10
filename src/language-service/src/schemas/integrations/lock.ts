/**
 * Lock integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/lock/__init__.py
 */
import { IncludeList } from "../types";
import { PlatformSchema } from "../platform";
import { LockPlatformSchema as MQTTLockPlatformSchema } from "./mqtt";
import { LockPlatformSchema as TemplatePlatformSchema } from "./template";

export type Domain = "sensor";
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

type Item = MQTTLockPlatformSchema | TemplatePlatformSchema | OtherPlatform;
