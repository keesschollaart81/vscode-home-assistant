/**
 * Blueprint integration
 * Source:
 * - https://github.com/home-assistant/core/blob/dev/homeassistant/components/blueprint/__init__.py
 * - https://github.com/home-assistant/core/blob/dev/homeassistant/components/blueprint/models.py
 * - https://github.com/home-assistant/core/blob/dev/homeassistant/components/blueprint/schemas.py
 */
import { Selector } from "../selectors";
import { AutomationItem } from "./automation";

export type Domain = "blueprint";
export type Schema = null;

export interface AutomationBlueprint extends AutomationItem {
  /**
   * The blueprint schema.
   * https://www.home-assistant.io/docs/blueprint/schema/#the-blueprint-schema
   */
  blueprint: Blueprint;
}

// export interface AutomationBlueprint extends AutomationItem, Blueprint {}

interface Blueprint {
  /**
   * The description of the blueprint. While optional, this field is highly recommended. The description can include Markdown.
   * https://www.home-assistant.io/docs/blueprint/schema/#description
   */
  description?: string;

  /**
   * The domain name this blueprint provides a blueprint for.
   * https://www.home-assistant.io/docs/blueprint/schema/#domain
   */
  domain: string;

  /**
   * Home Assistant requirements for this Blueprint.
   */
  homeassistant?: {
    /**
     * The minimal version number of Home Assistant Core that is needed for this Blueprint.
     */
    min_version?: string;
  };

  /**
   * These are the input fields that the consumer of your blueprint can provide using YAML definition, or via a configuration form in the UI.
   * https://www.home-assistant.io/docs/blueprint/schema/#input
   */
  input?: {
    [key: string]: BlueprintInputSchema;
  };

  /**
   * The name of the blueprint. Keep this short and descriptive.
   * https://www.home-assistant.io/docs/blueprint/schema/#name
   */
  name: string;

  /**
   * The URL to the online location where this Blueprint was imported from. Generally there is no need to add this, in the future this might be used for updating Blueprints.
   */
  source_url?: string;
}

interface BlueprintInputSchema {
  /**
   * The name of the input field.
   * https://www.home-assistant.io/docs/blueprint/schema/#name
   */
  name?: string;

  /**
   * A short description of the input field. Keep this short and descriptive.
   * https://www.home-assistant.io/docs/blueprint/schema/#description
   */
  description?: string;

  /**
   * The default value of this input, in case the input is not provided by the user of this blueprint.
   * https://www.home-assistant.io/docs/blueprint/schema/#default
   */
  default?: string;

  /**
   * The default value of this input, in case the input is not provided by the user of this blueprint.
   * https://www.home-assistant.io/docs/blueprint/schema/#default
   */
  selector?: Selector;
}
