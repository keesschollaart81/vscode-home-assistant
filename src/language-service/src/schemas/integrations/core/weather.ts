/**
 * Weather integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/weather/__init__.py
 */
import { IncludeList } from "../../types";
import { PlatformSchema } from "../platform";
import { WeatherPlatformSchema as TemplatePlatformSchema } from "./template";

export type Domain = "weather";
export type Schema = Item[] | IncludeList;
export type File = Item | Item[];

/**
 * @TJS-additionalProperties true
 */
interface OtherPlatform extends PlatformSchema {
  /**
   * @TJS-pattern ^(?!(template)$)\w+$
   */
  platform: string;
}

type Item = TemplatePlatformSchema | OtherPlatform;

export type SupportedFeature =
  | "weather.WeatherEntityFeature.FORECAST_DAILY"
  | "weather.WeatherEntityFeature.FORECAST_HOURLY"
  | "weather.WeatherEntityFeature.FORECAST_TWICE_DAILY";
