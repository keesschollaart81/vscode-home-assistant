/**
 * Select integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/select/__init__.py
 */
import { IncludeList } from "../../types";
import { PlatformSchema } from "../platform";

export type Domain = "number";
export type Schema = Item[] | IncludeList;
export type File = Item | Item[];

/**
 * @TJS-additionalProperties true
 */
interface OtherPlatform extends PlatformSchema {
  /**
   * @TJS-pattern ^(?!(mqtt)$)\w+$
   */
  platform: string;
}

type Item = OtherPlatform;
