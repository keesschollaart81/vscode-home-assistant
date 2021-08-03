/**
 * Lovelace Webpage/iframe Card
 * Sources:
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/hui-weather-forecast-card.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/types.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/data/lovelace.ts
 */

import { WeatherEntity } from "../../types";
import { ViewLayout } from "../types";

export interface Schema {
  /**
   * The Weather Forecast card displays the weather. Very useful to include on interfaces that people display on the wall.
   * https://www.home-assistant.io/lovelace/weather-forecast/
   */
  type: "weather-forecast";

  /**
   * The entity_id of the weather platform to use.
   * https://www.home-assistant.io/lovelace/weather-forecast/#entity
   */
  entity: WeatherEntity;

  /**
   * Overwrites the friendly name.
   * https://www.home-assistant.io/lovelace/weather-forecast/#name
   */
  name?: string;

  /**
   * Show next hours/days forecast.
   * https://www.home-assistant.io/lovelace/weather-forecast/#show_forecast
   */
  show_forecast?: boolean;

  /**
   * Which attribute to display under the temperature.
   * https://www.home-assistant.io/lovelace/weather-forecast/#secondary_info_attribute
   */
  secondary_info_attribute?: string;

  /**
   * Set to any theme within themes.yaml.
   * https://www.home-assistant.io/lovelace/weather-forecast/#theme
   */
  theme?: string;

  /**
   * Layout options for the view this card is in
   */
  view_layout?: ViewLayout;
}
