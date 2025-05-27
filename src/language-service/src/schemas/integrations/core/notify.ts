/**
 * Notify integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/notify/__init__.py
 */
import { IncludeList } from "../../types";
import { PlatformSchema } from "../platform";
import { NotifyPlatformSchema as GroupPlatformSchema } from "./group";

export type Domain = "notify";
export type Schema = Item[] | IncludeList;
export type File = Item | Item[];

/**
 * @TJS-additionalProperties true
 */
interface OtherPlatform extends PlatformSchema {
  /**
   * @TJS-pattern ^(?!(group)$)\w+$
   */
  platform: string;
}

type Item = GroupPlatformSchema | OtherPlatform;
