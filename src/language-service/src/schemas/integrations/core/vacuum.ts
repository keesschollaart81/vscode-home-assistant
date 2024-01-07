/**
 * Vacuum integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/vacuum/__init__.py
 */
import { IncludeList } from "../../types";
import { PlatformSchema } from "../platform";
import { VacuumPlatformSchema as TemplatePlatformSchema } from "./template";

export type Domain = "vacuum";
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

export type SupportedFeature =
  | "vacuum.VacuumEntityFeature.TURN_ON"
  | "vacuum.VacuumEntityFeature.TURN_OFF"
  | "vacuum.VacuumEntityFeature.PAUSE"
  | "vacuum.VacuumEntityFeature.STOP"
  | "vacuum.VacuumEntityFeature.RETURN_HOME"
  | "vacuum.VacuumEntityFeature.FAN_SPEED"
  | "vacuum.VacuumEntityFeature.BATTERY"
  | "vacuum.VacuumEntityFeature.STATUS"
  | "vacuum.VacuumEntityFeature.SEND_COMMAND"
  | "vacuum.VacuumEntityFeature.LOCATE"
  | "vacuum.VacuumEntityFeature.CLEAN_SPOT"
  | "vacuum.VacuumEntityFeature.MAP"
  | "vacuum.VacuumEntityFeature.STATE"
  | "vacuum.VacuumEntityFeature.START";
