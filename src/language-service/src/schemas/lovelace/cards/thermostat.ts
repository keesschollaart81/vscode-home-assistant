/**
 * Lovelace Thermostat Card
 * Sources:
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/hui-thermostat-card.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/types.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/data/lovelace.ts
 */

import { ClimateEntity } from "../../types";
import { ViewLayout } from "../types";

interface FeatureBase {
  type: string;
  style?: "icons" | "dropdown";
}

interface ClimateHvacModesFeature extends FeatureBase {
  type: "climate-hvac-modes";
  hvac_modes?: string[];
}

interface ClimatePresetModesFeature extends FeatureBase {
  type: "climate-preset-modes";
  preset_modes?: string[];
}

interface TargetTemperatureFeature {
  type: "target-temperature";
}

interface ClimateFanModesFeature extends FeatureBase {
  type: "climate-fan-modes";
  fan_modes?: string[];
}

interface ClimateSwingModesFeature extends FeatureBase {
  type: "climate-swing-modes";
  swing_modes?: string[];
}

interface AuxHeatFeature {
  type: "aux-heat";
}

type Feature =
  | ClimateHvacModesFeature
  | ClimatePresetModesFeature
  | TargetTemperatureFeature
  | ClimateFanModesFeature
  | ClimateSwingModesFeature
  | AuxHeatFeature;

export interface Schema {
  /**
   * The Thermostat card gives control of your climate entity, allowing you to change the temperature and mode of the entity.
   * https://www.home-assistant.io/lovelace/thermostat/
   */
  type: "thermostat";

  /**
   * Entity id of climate domain.
   * https://www.home-assistant.io/lovelace/thermostat/#entity
   */
  entity: ClimateEntity;

  /**
   * Overwrites friendly name.
   * https://www.home-assistant.io/lovelace/thermostat/#name
   */
  name?: string;

  /**
   * Set to any theme within themes.yaml.
   * https://www.home-assistant.io/lovelace/thermostat/#theme
   */
  theme?: string;

  /**
   * Layout options for the view this card is in
   */
  view_layout?: ViewLayout;

  /**
   * A list of features to customize the card.
   * https://www.home-assistant.io/dashboards/thermostat/#features
   */
  features?: Feature[];
}
