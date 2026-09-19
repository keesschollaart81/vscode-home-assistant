export interface WebOSTvTrigger {
  /**
   * Note displayed in the Home Assistant automation editor.
   * https://www.home-assistant.io/docs/automation/editor/#adding-notes-to-an-automation
   */
  note?: string;

  /**
   * Trigger fires when WebOS integration attempts to turn on the TV.
   * https://www.home-assistant.io/integrations/webostv/#configuration
   */
  platform: "webostv.turn_on";

  /**
   * The entity ID of the TV that wants to get turned on.
   * https://www.home-assistant.io/integrations/webostv/#configuration
   */
  entity_id?: string;
}
