/**
 * Media Player integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/media_player/__init__.py
 */
import { IncludeList } from "../../types";
import { PlatformSchema } from "../platform";
import { MediaPlayerPlatformSchema as GroupPlatformSchema } from "./group";

export type Domain = "media_player";
export type Schema = Item[] | IncludeList;
export type File = Item | Item[];

/**
 * @TJS-additionalProperties true
 */
interface OtherPlatform extends PlatformSchema {
  /**
   * @TJS-pattern ^(?!(group|mqtt)$)\w+$
   */
  platform: string;
}

type Item = GroupPlatformSchema | OtherPlatform;
