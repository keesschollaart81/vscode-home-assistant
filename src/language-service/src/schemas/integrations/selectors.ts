/**
 * Selectors
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/helpers/selector.py
 */
import {
  Domain,
  DeviceClasses,
  Entity,
  PositiveInteger,
  SupportedFeature,
  LegacySyntax,
} from "../types";

export type Selector =
  | ActionSelector
  | AddonSelector
  | AreaSelector
  | AssistPipelineSelector
  | AttributeSelector
  | BackupLocationSelector
  | BooleanSelector
  | ColorRGBSelector
  | ColorTempSelector
  | ConditionSelector
  | ConfigEntrySelector
  | ConstantSelector
  | ConversationAgentSelector
  | CountrySelector
  | DateSelector
  | DateTimeSelector
  | DeviceSelector
  | DurationSelector
  | EntitySelector
  | FloorSelector
  | IconSelector
  | LabelSelector
  | LanguageSelector
  | LocationSelector
  | MediaSelector
  | NumberSelector
  | ObjectSelector
  | QRCodeSelector
  | SelectSelector
  | TargetSelector
  | TemplateSelector
  | TextSelector
  | ThemeSelector
  | TimeSelector
  | TriggerSelector;

export interface ActionSelector {
  /**
   * The action selector allows the user to input one or more sequences of actions.
   * https://www.home-assistant.io/docs/blueprint/selectors/#action-selector
   */
  action: null | Record<string, never>;
}

export interface AddonSelector {
  /**
   * The add-on selector allows the user to input an add-on slug. On the user interface, it will list all installed add-ons and use the slug of the selected add-on.
   * https://www.home-assistant.io/docs/blueprint/selectors/#add-on-selector
   */
  addon: null | Record<string, never>;
}

export interface AreaSelector {
  /**
   * The area selector shows an area finder that can pick a single area. The value of the input will be the area ID of the user-selected area.
   * https://www.home-assistant.io/docs/blueprint/selectors/#area-selector
   */
  area: {
    /**
     * When device options are provided, the list of areas is filtered by areas that at least provide one device that matches the given conditions.
     * https://www.home-assistant.io/docs/blueprint/selectors/#area-selector
     */
    device?: DeviceSelectorFilter | DeviceSelectorFilter[];

    /**
     * When entity options are provided, the list of areas is filtered by areas that at least provide one entity that matches the given conditions.
     * https://www.home-assistant.io/docs/blueprint/selectors/#area-selector
     */
    entity?: EntitySelectorFilter | EntitySelectorFilter[];

    /**
     * Allows selecting multiple areas. If set to `true`, the resulting value of this selector will be a list instead of a single string value.
     * https://www.home-assistant.io/docs/blueprint/selectors/#area-selector
     */
    multiple?: boolean;
  } | null;
}

export interface AssistPipelineSelector {
  /**
   * The assist pipeline selector shows all available assist pipelines (assistants) of which one can be selected.
   * https://www.home-assistant.io/docs/blueprint/selectors/#assist-pipeline-selector
   */
  assist_pipeline: null | Record<string, never>;
}

export interface AttributeSelector {
  /**
   * The attributes selector shows a list of state attribites from a provided entity of which one can be selected.
   * https://www.home-assistant.io/docs/blueprint/selectors/#attribute-selector
   */
  attribute: {
    /**
     * The entity ID of which an state attribute can be selected from.
     * https://www.home-assistant.io/docs/blueprint/selectors/#attribute-selector
     */
    entity_id: Entity;
  };
}

export interface BackupLocationSelector {
  /**
   * The backup location selector shows a list of places a backup could go, depending on what you have configured in storage.
   * https://www.home-assistant.io/docs/blueprint/selectors/#backup-location-selector
   */
  backup_location: null | Record<string, never>;
}

export interface BooleanSelector {
  /**
   * The boolean selector shows a toggle that allows the user to turn on or off the selected option.
   * https://www.home-assistant.io/docs/blueprint/selectors/#boolean-selector
   */
  boolean: null | Record<string, never>;
}

export interface ColorRGBSelector {
  /**
   * The date selector shows a date input that allows the user to specify a date.
   * https://www.home-assistant.io/docs/blueprint/selectors/#date-selector
   */
  color_rgb: null | Record<string, never>;
}

export interface ColorTempSelector {
  /**
   *
   * https://www.home-assistant.io/docs/blueprint/selectors/#color-temperature-selector
   */
  color_temp: {
    /**
     * The minimum color temperature in mireds.
     * https://www.home-assistant.io/docs/blueprint/selectors/#color-temperature-selector
     */
    min_mireds?: PositiveInteger;

    /**
     * The maximum color temperature in mireds.
     * https://www.home-assistant.io/docs/blueprint/selectors/#color-temperature-selector
     */
    max_mireds?: PositiveInteger;
  } | null;
}

export interface ConditionSelector {
  /**
   * The condition selector allows the user to input one or more conditions..
   * https://www.home-assistant.io/docs/blueprint/selectors/#condition-selector
   */
  condition: null | Record<string, never>;
}

export interface ConfigEntrySelector {
  /**
   * The config entry selector allows the user to select an integration configuration entry. The selector returns the entry ID of the selected integration configuration entry.
   * https://www.home-assistant.io/docs/blueprint/selectors/#config-entry-selector
   */
  config_entry: {
    /**
     * Can be set to an integration domain. Limits the list of config entries provided by the set integration domain.
     * https://www.home-assistant.io/docs/blueprint/selectors/#config-entry-selector
     */
    integration?: Domain;
  } | null;
}

export interface ConstantSelector {
  /**
   * The constant selector shows a toggle that allows the user to enable the selected option. This is similar to the boolean selector, the difference is that the constant selector has no value when it’s not enabled.
   * https://www.home-assistant.io/docs/blueprint/selectors/#constant-selector
   */
  constant: {
    /**
     * The label that is show in the UI for this constant.
     * https://www.home-assistant.io/docs/blueprint/selectors/#constant-selector
     */
    label: string;

    /**
     * Value that is returned when this constant is enabled by the user
     * https://www.home-assistant.io/docs/blueprint/selectors/#constant-selector
     */
    value: string;
  };
}

export interface ConversationAgentSelector {
  /**
   * The conversation agent selector allows picking a conversation agent.
   * https://www.home-assistant.io/docs/blueprint/selectors/#conversation-agent-selector
   */
  conversation_agent: {
    /**
     * Limits the list of conversation agents to those supporting the specified language.
     * https://www.home-assistant.io/docs/blueprint/selectors/#conversation-agent-selector
     */
    language?: string;
  } | null;
}

export interface CountrySelector {
  /**
   * The country selector allows a user to pick a country from a list of countries.
   * https://www.home-assistant.io/docs/blueprint/selectors/#country-selector
   */
  country: {
    /**
     * A list of countries to pick from, this should be ISO 3166 country codes.
     * https://www.home-assistant.io/docs/blueprint/selectors/#country-selector
     */
    countries?: string[];

    /**
     * Should the options be sorted by name, if set to true, the order of the provided countries is kept.
     * https://www.home-assistant.io/docs/blueprint/selectors/#country-selector
     */
    no_sort?: boolean;
  } | null;
}

export interface DateSelector {
  /**
   * The date selector shows a date input that allows the user to specify a date.
   * https://www.home-assistant.io/docs/blueprint/selectors/#date-selector
   */
  date: null | Record<string, never>;
}

export interface DateTimeSelector {
  /**
   * The date selector shows a date and time input that allows the user to specify a date with a specific time.
   * https://www.home-assistant.io/docs/blueprint/selectors/#date--time-selector
   */
  datetime: null | Record<string, never>;
}

interface DeviceSelectorFilter {
  /**
   * Can be set to an integration domain. Limits the list of devices to devices provided by the set integration domain.
   * https://www.home-assistant.io/docs/blueprint/selectors/#device-selector
   */
  integration?: Domain;

  /**
   * When set, it limits the list of devices to devices provided by the set manufacturer name.
   * https://www.home-assistant.io/docs/blueprint/selectors/#device-selector
   */
  manufacturer?: string;

  /**
   * When set, it limits the list of devices to devices that have the set model.
   * https://www.home-assistant.io/docs/blueprint/selectors/#device-selector
   */
  model?: string;
}

export interface DeviceSelector {
  /**
   * The device selector shows a device finder that can pick a single device.
   * https://www.home-assistant.io/docs/blueprint/selectors/#device-selector
   */
  device: {
    /**
     * When entity options are provided, the list of devices is filtered by devices that at least provide one entity that matches the given conditions.
     * https://www.home-assistant.io/docs/blueprint/selectors/#device-selector
     */
    entity?: EntitySelectorFilter | EntitySelectorFilter[];

    /**
     * When filter options are provided, the list of devices is filtered by devices that at least provide one entity that matches the given conditions.
     * https://www.home-assistant.io/docs/blueprint/selectors/#device-selector
     */
    filter?: DeviceSelectorFilter | DeviceSelectorFilter[];

    /**
     * You can use filter parameter to filter devices".
     */
    integration?: LegacySyntax;

    /**
     * You can use filter parameter to filter devices".
     */
    manufacturer?: LegacySyntax;

    /**
     * You can use filter parameter to filter devices".
     */
    model?: LegacySyntax;

    /**
     * Allows selecting multiple devices. If set to `true`, the resulting value of this selector will be a list instead of a single string value.
     * https://www.home-assistant.io/docs/blueprint/selectors/#device-selector
     */
    multiple?: boolean;
  } | null;
}

export interface DurationSelector {
  /**
   * The duration select allow the user to select a time duration. This can be helpful for, e.g., delays or offsets.
   * https://www.home-assistant.io/docs/blueprint/selectors/#duration-selector
   */
  duration: {
    /**
     * Set to true to display the input as a multi-line text box on the user interface.
     * https://www.home-assistant.io/docs/blueprint/selectors/#duration-selector
     */
    enable_day?: boolean;

    /**
     * When true, the duration selector will allow selecting milliseconds.
     * https://www.home-assistant.io/docs/blueprint/selectors/#duration-selector
     */
    enable_millisecond?: boolean;
  } | null;
}

interface EntitySelectorFilter {
  /**
   * Can be set to an integration domain. Limits the list of devices that provide entities by the set integration domain.
   * https://www.home-assistant.io/docs/blueprint/selectors/#entity-selector
   */
  integration?: Domain;
  /**
   * Limits the list of devices that provide entities of a certain domain.
   * https://www.home-assistant.io/docs/blueprint/selectors/#entity-selector
   */
  domain?: Domain | Domain[];
  /**
   * Limits the list of entities to entities that have a certain device class.
   * https://www.home-assistant.io/docs/blueprint/selectors/#entity-selector
   */
  device_class?: DeviceClasses | DeviceClasses[];
  /**
   * Limits the list of entities to entities that have a certain supported feature.
   * https://www.home-assistant.io/docs/blueprint/selectors/#entity-selector
   */
  supported_features?: SupportedFeature | SupportedFeature[];
}

export interface EntitySelector {
  /**
   * The entity selector shows an entity finder that can pick a single entity.
   * https://www.home-assistant.io/docs/blueprint/selectors/#entity-selector
   */
  entity: {
    /**
     * List of entity IDs to exclude from the selectable list.
     * https://www.home-assistant.io/docs/blueprint/selectors/#entity-selector
     */
    exclude_entities?: Entity[];

    /**
     * List of entity IDs to limit the selectable list to.
     * https://www.home-assistant.io/docs/blueprint/selectors/#entity-selector
     */
    include_entities?: Entity[];

    /**
     * You can use filter parameter to filter entities".
     */
    integration?: LegacySyntax;

    /**
     * You can use filter parameter to filter entities".
     */
    domain?: LegacySyntax;

    /**
     * You can use filter parameter to filter entities".
     */
    device_class?: LegacySyntax;

    /**
     * When filter options are provided, the entities are limited by entities that at least match the given conditions.
     * https://www.home-assistant.io/docs/blueprint/selectors/#entity-selector
     */
    filter?: EntitySelectorFilter | EntitySelectorFilter[];
    /**
     * Allows selecting multiple devices. If set to `true`, the resulting value of this selector will be a list instead of a single string value.
     * https://www.home-assistant.io/docs/blueprint/selectors/#entity-selector
     */
    multiple?: boolean;
  } | null;
}

export interface FloorSelector {
  /**
   * The icon selector shows an icon picker that allows the user to select an icon.
   * https://www.home-assistant.io/docs/blueprint/selectors/#floor-selector
   */
  floor: {
    /**
     * When device options are provided, the list of floors is filtered by floors that have at least one device matching the given conditions.
     * https://www.home-assistant.io/docs/blueprint/selectors/#floor-selector
     */
    device?: DeviceSelectorFilter | DeviceSelectorFilter[];

    /**
     * When entity options are provided, the list only includes floors that at least have one entity that matches the given conditions.
     * https://www.home-assistant.io/docs/blueprint/selectors/#floor-selector
     */
    entity?: EntitySelectorFilter | EntitySelectorFilter[];

    /**
     * Allows selecting multiple floors. If set to true, the resulting value of this selector will be a list instead of a single string value.
     * https://www.home-assistant.io/docs/blueprint/selectors/#floor-selector
     */
    multiple?: boolean;
  } | null;
}

export interface IconSelector {
  /**
   * The icon selector shows an icon picker that allows the user to select an icon.
   * https://www.home-assistant.io/docs/blueprint/selectors/#icon-selector
   */
  icon: {
    /**
     * Placeholder icon to show, when no icon is selected.
     * https://www.home-assistant.io/docs/blueprint/selectors/#icon-selector
     */
    placeholder?: string;
  } | null;
}

export interface LabelSelector {
  /**
   * The label selector shows a label finder that can pick labels.
   * https://www.home-assistant.io/docs/blueprint/selectors/#label-selector
   */
  label: {
    /**
     * Allows selecting multiple labels. If set to true, the resulting value of this selector will be a list instead of a single string value
     * https://www.home-assistant.io/docs/blueprint/selectors/#label-selector
     */
    multiple?: boolean;
  } | null;
}

export interface LanguageSelector {
  /**
   * The language selector allows a user to pick a language from a list of languages.
   * https://www.home-assistant.io/docs/blueprint/selectors/#language-selector
   */
  language: {
    /**
     * A list of languages to pick from, this should be RFC 5646 languages codes.
     * https://www.home-assistant.io/docs/blueprint/selectors/#language-selector
     */
    languages?: string[];

    /**
     * Should the name of the languages be shown in the language of the user, or in the language itself.
     * https://www.home-assistant.io/docs/blueprint/selectors/#language-selector
     */
    native_name?: boolean;

    /**
     * Should the options be sorted by name, if set to true, the order of the provided languages is kept.
     * https://www.home-assistant.io/docs/blueprint/selectors/#language-selector
     */
    no_sort?: boolean;
  } | null;
}

export interface LocationSelector {
  /**
   * The icon selector shows an icon picker that allows the user to select an icon.
   * https://www.home-assistant.io/docs/blueprint/selectors/#location-selector
   */
  location: {
    /**
     * An optional icon to show on the map.
     * https://www.home-assistant.io/docs/blueprint/selectors/#location-selector
     */
    icon?: string;

    /**
     * Allow selecting the radius of the location. If enabled, the radius will be returned in meters.
     * https://www.home-assistant.io/docs/blueprint/selectors/#location-selector
     */
    radius?: boolean;
  } | null;
}

export interface MediaSelector {
  /**
   * The media selector is a powerful selector that allows a user to easily select media to play on a media device.
   * https://www.home-assistant.io/docs/blueprint/selectors/#media-selector
   */
  media: null | Record<string, never>;
}

export interface NumberSelector {
  /**
   * The number selector shows either a number input or a slider input, that allows the user to specify a numeric value.
   * https://www.home-assistant.io/docs/blueprint/selectors/#number-selector
   */
  number: {
    /**
     * The maximum user-settable number value.
     * https://www.home-assistant.io/docs/blueprint/selectors/#number-selector
     */
    max: number;

    /**
     * The minimal user-settable number value.
     * https://www.home-assistant.io/docs/blueprint/selectors/#number-selector
     */
    min: number;

    /**
     * This can be either box or slider mode.
     * https://www.home-assistant.io/docs/blueprint/selectors/#number-selector
     */
    mode?: "box" | "slider";

    /**
     * The step value of the number value.
     * https://www.home-assistant.io/docs/blueprint/selectors/#number-selector
     */
    step?: number;

    /**
     * Unit of measurement in which the number value is expressed in.
     * https://www.home-assistant.io/docs/blueprint/selectors/#number-selector
     */
    unit_of_measurement?: string;
  };
}

export interface ObjectSelector {
  /**
   * The object selector can be used to input arbitrary data in YAML form. This is useful for e.g. lists and dictionaries like service data.
   * https://www.home-assistant.io/docs/blueprint/selectors/#object-selector
   */
  object: null | Record<string, never>;
}

export interface QRCodeSelector {
  /**
   * The QR code selector shows a QR code.
   * https://www.home-assistant.io/docs/blueprint/selectors/#qr-code-selector
   */
  qr_code: {
    /**
     * The data that should be represented in the QR code.
     * https://www.home-assistant.io/docs/blueprint/selectors/#qr-code-selector
     */
    data: any;

    /**
     * The scale factor to use, this will make the QR code bigger or smaller.
     * https://www.home-assistant.io/docs/blueprint/selectors/#qr-code-selector
     */
    scale?: PositiveInteger;

    /**
     * The error correction level of the QR code, with a higher error correction level the QR code can be scanned even when some pieces are missing.
     * https://www.home-assistant.io/docs/blueprint/selectors/#qr-code-selector
     */
    error_correction_level?: "low" | "medium" | "quartile" | "high";
  };
}

export interface SelectSelector {
  /**
   * The select selector shows a list of available options from which the user can choose.
   * https://www.home-assistant.io/docs/blueprint/selectors/#select-selector
   */
  select: {
    /**
     * Allows the user to enter and select a custom value (or multiple custom values in addition to the listed options if `multiple` is set to true).
     * https://www.home-assistant.io/docs/blueprint/selectors/#select-selector
     */
    custom_value?: boolean;

    /**
     * This can be either `list` or `dropdown` mode. when not specificied, small lists (5 items or less), are displayed as radio buttons. When more items are added, a dropdown list is used.
     * https://www.home-assistant.io/docs/blueprint/selectors/#select-selector
     */
    mode?: "list" | "dropdown";

    /**
     * Allows selecting multiple options. If set to `true`, the resulting value of this selector will be a list instead of a single string value.
     * https://www.home-assistant.io/docs/blueprint/selectors/#select-selector
     */
    multiple?: boolean;

    /**
     * List of options that the user can choose from.
     * https://www.home-assistant.io/docs/blueprint/selectors/#select-selector
     */
    options:
      | string[]
      | {
          /**
           * The description to show in the UI for this item.
           * https://www.home-assistant.io/docs/blueprint/selectors/#select-selector
           */
          label: string;

          /**
           * The value to return when this label is selected.
           * https://www.home-assistant.io/docs/blueprint/selectors/#select-selector
           */
          value: string;
        }[];
  };
}

export interface TargetSelector {
  /**
   * The target selector is a rather special selector, allowing the user to select targeted entities, devices or areas for service calls.
   * https://www.home-assistant.io/docs/blueprint/selectors/#target-selector
   */
  target: {
    /**
     * When device options are provided, the targets are limited by devices that at least match the given conditions.
     * https://www.home-assistant.io/docs/blueprint/selectors/#target-selector
     */
    device?: DeviceSelectorFilter | DeviceSelectorFilter[];

    /**
     * When entity options are provided, the targets are limited by entities that at least match the given conditions.
     * https://www.home-assistant.io/docs/blueprint/selectors/#target-selector
     */
    entity?: EntitySelectorFilter | EntitySelectorFilter[];
  } | null;
}

export interface TemplateSelector {
  /**
   * The template can be used for allowing the user to input a Jinja2 template.
   * https://www.home-assistant.io/docs/blueprint/selectors/#template-selector
   */
  template: null | Record<string, never>;
}

export interface TextSelector {
  /**
   * The text selector can be used to input a text string.
   * https://www.home-assistant.io/docs/blueprint/selectors/#text-selector
   */
  text: {
    /**
     * Set to true to display the input as a multi-line text box on the user interface.
     * https://www.home-assistant.io/docs/blueprint/selectors/#text-selector
     */
    multiline?: boolean;

    /**
     * llows adding list of text strings. If set to true, the resulting value of this selector will be a list instead of a single string value.
     * https://www.home-assistant.io/docs/blueprint/selectors/#text-selector
     */
    multiple?: boolean;

    /**
     * Allows adding a prefix to the input field.
     * https://www.home-assistant.io/docs/blueprint/selectors/#text-selector
     */
    prefix?: string;

    /**
     * Allows adding a suffix to the input field.
     * https://www.home-assistant.io/docs/blueprint/selectors/#text-selector
     */
    suffix?: string;

    /**
     * The type of input. This is a browser hint, which can improve the client side validation of the input. The value isn't validated by the backend.
     * https://www.home-assistant.io/docs/blueprint/selectors/#text-selector
     */
    type?:
      | "color"
      | "date"
      | "datetime-local"
      | "email"
      | "month"
      | "number"
      | "password"
      | "search"
      | "tel"
      | "text"
      | "time"
      | "url"
      | "week";
  } | null;
}

export interface ThemeSelector {
  /**
   * The theme selector allows for selecting a theme from the available themes installed in Home Assistant.
   * https://www.home-assistant.io/docs/blueprint/selectors/#theme-selector
   */
  theme: null | Record<string, never>;
}

export interface TimeSelector {
  /**
   * The time selector shows a time input that allows the user to specify a time of the day.
   * https://www.home-assistant.io/docs/blueprint/selectors/#time-selector
   */
  time: null | Record<string, never>;
}

export interface TriggerSelector {
  /**
   * The triggers selector allows the user to input one or more triggers. On the user interface, the trigger part of the automation editor is shown.
   * https://www.home-assistant.io/docs/blueprint/selectors/#trigger-selector
   */
  trigger: null | Record<string, never>;
}
