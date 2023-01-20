/**
 * Intent script integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/intent_script/__init__.py
 */
import { IncludeNamed, Template } from "../../types";
import { Action } from "../actions";

export type Domain = "intent_script";
export interface Schema {
  [key: string]: Item | IncludeNamed | null;
}
export type File = Schema | Item;

interface Item {
  /**
   * Defines an action to run to intents.
   * https://www.home-assistant.io/integrations/intent_script/#action
   */
  action?: Action | Action[];

  /**
   * Set to True to have Home Assistant not wait for the script to finish before returning the intent response.
   * https://www.home-assistant.io/integrations/intent_script/#async_action
   */
  async_action?: boolean;

  /**
   * Card to display.
   * https://www.home-assistant.io/integrations/intent_script/#card
   */
  card?: {
    /**
     * Type of card to display. Defaults to "simple".
     * https://www.home-assistant.io/integrations/intent_script/#type
     */
    type?: string;

    /**
     * Title of the card to display.
     * https://www.home-assistant.io/integrations/intent_script/#title
     */
    title: Template;

    /**
     * Contents of the card to display.
     * https://www.home-assistant.io/integrations/intent_script/#content
     */
    content: Template;
  };

  /**
   * Text or template to return.
   * https://www.home-assistant.io/integrations/intent_script/#speech
   */
  speech?: {
    /**
     * Type of speech. Defaults to "plain".
     * https://www.home-assistant.io/integrations/intent_script/#type
     */
    type?: string;

    /**
     * Text to speech
     * https://www.home-assistant.io/integrations/intent_script/#content
     */
    text: Template;
  };
}
