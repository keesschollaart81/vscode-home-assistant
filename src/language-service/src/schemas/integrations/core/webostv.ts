export interface WebOSTvTrigger {
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
