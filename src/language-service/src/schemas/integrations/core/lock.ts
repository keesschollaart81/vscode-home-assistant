/**
 * Lock integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/lock/__init__.py
 */
import { IncludeList } from "../../types";
import { PlatformSchema } from "../platform";
import { LockPlatformSchema as TemplatePlatformSchema } from "./template";

export type Domain = "sensor";
export type Schema = Item[] | IncludeList;
export type File = Item | Item[];

/**
 * @TJS-additionalProperties true
 */
interface OtherPlatform extends PlatformSchema {
  /**
   * @TJS-pattern ^(?!(template|mqtt)$)\w+$
   */
  platform: string;
}

type Item = TemplatePlatformSchema | OtherPlatform;
