/**
 * Spotify integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/spotify/__init__.py
 */
export type Domain = "spotify";
export interface Schema {
  /**
   * Client ID from your Spotify Developer application.
   * https://www.home-assistant.io/integrations/spotify/#client_id
   */
  client_id: string;

  /**
   * Client Secret from your Spotify Developer application.
   * https://www.home-assistant.io/integrations/spotify/#client_secret
   */
  client_secret: string;
}
