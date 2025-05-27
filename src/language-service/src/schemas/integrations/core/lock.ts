/**
 * Lock integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/lock/__init__.py
 */
import { IncludeList } from "../../types";
import { PlatformSchema } from "../platform";
import { LockPlatformSchema as GroupPlatformSchema } from "./group";
import { LockPlatformSchema as TemplatePlatformSchema } from "./template";

export type Domain = "lock";
export type Schema = Item[] | IncludeList;
export type File = Item | Item[];

/**
 * @TJS-additionalProperties true
 */
interface OtherPlatform extends PlatformSchema {
  /**
   * @TJS-pattern ^(?!(group|template|mqtt)$)\w+$
   */
  platform: string;
}

type Item = GroupPlatformSchema | TemplatePlatformSchema | OtherPlatform;
