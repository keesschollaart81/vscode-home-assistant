/**
 * Button integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/button/__init__.py
 */
import { IncludeList } from "../../types";
import { PlatformSchema } from "../platform";
import { ButtonPlatformSchema as GroupPlatformSchema } from "./group";

export type Domain = "button";
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
