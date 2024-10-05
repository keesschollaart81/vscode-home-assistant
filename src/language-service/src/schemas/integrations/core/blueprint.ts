/**
 * Blueprint integration
 * Source:
 * - https://github.com/home-assistant/core/blob/dev/homeassistant/components/blueprint/__init__.py
 * - https://github.com/home-assistant/core/blob/dev/homeassistant/components/blueprint/models.py
 * - https://github.com/home-assistant/core/blob/dev/homeassistant/components/blueprint/schemas.py
 */
import { Selector } from "../selectors";
import { AutomationItem } from "./automation";
import { ScriptItem } from "./script";

export type Domain = "blueprint";
export type Schema = null;

export interface AutomationBlueprint extends AutomationItem {
  /**
   * The blueprint schema.
   * https://www.home-assistant.io/docs/blueprint/schema/#the-blueprint-schema
   */
  blueprint: Blueprint;
}

export interface ScriptBlueprint extends ScriptItem {
  /**
   * The blueprint schema.
   * https://www.home-assistant.io/docs/blueprint/schema/#the-blueprint-schema
   */
  blueprint: Blueprint;
}

interface Blueprint {
  /**
   * Defines the name of the author of this Blueprint
   * https://www.home-assistant.io/docs/blueprint/schema/#author
   */
  author?: string;

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
    [key: string]: BlueprintInputSchema | BlueprintInputSectionSchema;
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
  default?: any;

  /**
   * The default value of this input, in case the input is not provided by the user of this blueprint.
   * https://www.home-assistant.io/docs/blueprint/schema/#default
   */
  selector?: Selector;
}

interface BlueprintInputSectionSchema {
  /**
   * A name for the section. If omitted the key of the section is used.
   * https://www.home-assistant.io/docs/blueprint/schema/#name
   */
  name?: string;

  /**
   * An optional description of this section, which will be displayed at the top of the section. The description can include Markdown.
   * https://www.home-assistant.io/docs/blueprint/schema/#description
   */
  description?: string;

  /**
   * An icon to display next to the name of the section.
   * https://www.home-assistant.io/docs/blueprint/schema/#icon
   */
  icon?: string;

  /**
   * If true, the section will be collapsed by default. Useful for optional or less important inputs. All collapsed inputs must also have a defined default before they can be hidden.
   * https://www.home-assistant.io/docs/blueprint/schema/#collapsed
   */
  collapsed?: boolean;

  /**
   * A dictionary of defined user inputs within this section.
   * https://www.home-assistant.io/docs/blueprint/schema/#input
   */
  input: {
    [key: string]: BlueprintInputSchema;
  };
}
