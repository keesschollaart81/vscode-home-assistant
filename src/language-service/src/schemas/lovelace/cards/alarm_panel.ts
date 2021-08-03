/**
 * Lovelace Alarm Panel Card
 * Sources:
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/hui-alarm-panel-card.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/types.ts
 *  - https://github.com/home-assistant/frontend/blob/dev/src/data/lovelace.ts
 */
import { AlarmControlPanelEntity } from "../../types";
import { ViewLayout } from "../types";

type States = "arm_away" | "arm_custom_bypass" | "arm_home" | "arm_night";

export interface Schema {
  /**
   * The Alarm Panel card allows you to Arm and Disarm your alarm control panel integrations.
   * https://www.home-assistant.io/lovelace/alarm-panel/
   */
  type: "alarm-panel";

  /**
   * Entity ID of alarm_control_panel domain
   * https://www.home-assistant.io/lovelace/alarm-panel/#entity
   */
  entity: AlarmControlPanelEntity;

  /**
   * Overwrites Friendly Name.
   * https://www.home-assistant.io/lovelace/alarm-panel/#name
   */
  name?: string;

  /**
   * Controls which states to have available.
   * https://www.home-assistant.io/lovelace/alarm-panel/#states
   */
  states?: States[];

  /**
   * Set to any theme within themes.yaml.
   * https://www.home-assistant.io/lovelace/alarm-panel/#theme
   */
  theme?: string;

  /**
   * Layout options for the view this card is in
   */
  view_layout?: ViewLayout;
}
