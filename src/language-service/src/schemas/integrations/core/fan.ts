/**
 * Fan integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/fan/__init__.py
 */
import { IncludeList } from "../../types";
import { PlatformSchema } from "../platform";
import { FanPlatformSchema as GroupPlatformSchema } from "./group";
import { FanPlatformSchema as TemplatePlatformSchema } from "./template";

export type Domain = "fan";
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
