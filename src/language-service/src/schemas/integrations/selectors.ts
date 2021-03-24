/**
 * Selectors
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/helpers/selector.py
 */
import { Domain, DeviceClasses } from "../types";

export type Selector =
  | ActionSelector
  | AddonSelector
  | AreaSelector
  | BooleanSelector
  | DeviceSelector
  | EntitySelector
  | NumberSelector
  | ObjectSelector
  | SelectSelector
  | TargetSelector
  | TextSelector
  | TimeSelector;

export interface ActionSelector {
  /**
   * The action selector allows the user to input one or more sequences of actions.
   * https://www.home-assistant.io/docs/blueprint/selectors/#action-selector
   */
  action: null;
}

export interface AddonSelector {
  /**
   * The add-on selector allows the user to input an add-on slug. On the user interface, it will list all installed add-ons and use the slug of the selected add-on.
   * https://www.home-assistant.io/docs/blueprint/selectors/#add-on-selector
   */
  addon: null;
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
    device?: {
      /**
       * Can be set to an integration domain. Limits the list of areas that provide devices by the set integration domain.
       * https://www.home-assistant.io/docs/blueprint/selectors/#area-selector
       */
      integration?: string;

      /**
       * When set, it limits the list of areas that provide devices by the set manufacturer name.
       * https://www.home-assistant.io/docs/blueprint/selectors/#area-selector
       */
      manufacturer?: string;

      /**
       * When set, it limits the list of areas that provide devices that have the set model.
       * https://www.home-assistant.io/docs/blueprint/selectors/#area-selector
       */
      model?: string;
    };

    /**
     * When entity options are provided, the list of areas is filtered by areas that at least provide one entity that matches the given conditions.
     * https://www.home-assistant.io/docs/blueprint/selectors/#area-selector
     */
    entity?: {
      /**
       * Limits the list of areas that provide entities of a certain domain, for example, light or binary_sensor.
       * https://www.home-assistant.io/docs/blueprint/selectors/#area-selector
       */
      domain?: Domain;

      /**
       * Limits the list of areas to areas that have entities with a certain device class, for example, motion or window.
       * https://www.home-assistant.io/docs/blueprint/selectors/#area-selector
       */
      device_class?: DeviceClasses;

      /**
       * Can be set to an integration domain. Limits the list of areas that provide entities by the set integration domain.
       * https://www.home-assistant.io/docs/blueprint/selectors/#area-selector
       */
      integration?: string;
    };
  } | null;
}

export interface BooleanSelector {
  /**
   * The boolean selector shows a toggle that allows the user to turn on or off the selected option.
   * https://www.home-assistant.io/docs/blueprint/selectors/#boolean-selector
   */
  boolean: null;
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
    entity?: {
      /**
       * Can be set to an integration domain. Limits the list of devices that provide entities by the set integration domain.
       * https://www.home-assistant.io/docs/blueprint/selectors/#device-selector
       */
      integration?: string;
      /**
       * Limits the list of devices that provide entities of a certain domain.
       * https://www.home-assistant.io/docs/blueprint/selectors/#device-selector
       */
      domain?: Domain;
      /**
       * Limits the list of entities to entities that have a certain device class.
       * https://www.home-assistant.io/docs/blueprint/selectors/#device-selector
       */
      device_class?: DeviceClasses;
    };
    /**
     * Can be set to an integration domain. Limits the list of devices to devices provided by the set integration domain.
     * https://www.home-assistant.io/docs/blueprint/selectors/#device-selector
     */
    integration?: string;
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
  } | null;
}

export interface EntitySelector {
  /**
   * The entity selector shows an entity finder that can pick a single entity.
   * https://www.home-assistant.io/docs/blueprint/selectors/#entity-selector
   */
  entity: {
    /**
     * Can be set to an integration domain. Limits the list of devices that provide entities by the set integration domain.
     * https://www.home-assistant.io/docs/blueprint/selectors/#entity-selector
     */
    integration?: string;
    /**
     * Limits the list of devices that provide entities of a certain domain.
     * https://www.home-assistant.io/docs/blueprint/selectors/#entity-selector
     */
    domain?: Domain;
    /**
     * Limits the list of entities to entities that have a certain device class.
     * https://www.home-assistant.io/docs/blueprint/selectors/#entity-selector
     */
    device_class?: DeviceClasses;
  } | null;
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
  object: null;
}

export interface SelectSelector {
  /**
   * The select selector shows a list of available options from which the user can choose.
   * https://www.home-assistant.io/docs/blueprint/selectors/#select-selector
   */
  select: {
    /**
     * List of options that the user can choose from.
     * https://www.home-assistant.io/docs/blueprint/selectors/#select-selector
     */
    options: [string];
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
    device?: {
      /**
       * Can be set to an integration domain. Limits the device targets that are provided devices by the set integration domain.
       * https://www.home-assistant.io/docs/blueprint/selectors/#target-selector
       */
      integration?: string;

      /**
       * When set, it limits the targets to devices provided by the set manufacturer name.
       * https://www.home-assistant.io/docs/blueprint/selectors/#target-selector
       */
      manufacturer?: string;

      /**
       * When set, it limits the targets to devices by the set model.
       * https://www.home-assistant.io/docs/blueprint/selectors/#target-selector
       */
      model?: string;
    };

    /**
     * When entity options are provided, the targets are limited by entities that at least match the given conditions.
     * https://www.home-assistant.io/docs/blueprint/selectors/#target-selector
     */
    entity?: {
      /**
       * Limits the targets to entities of a certain domain, for example, light or binary_sensor.
       * https://www.home-assistant.io/docs/blueprint/selectors/#target-selector
       */
      domain?: Domain;

      /**
       * Limits the targets to entities with a certain device class, for example, motion or window.
       * https://www.home-assistant.io/docs/blueprint/selectors/#target-selector
       */
      device_class?: DeviceClasses;

      /**
       * Can be set to an integration domain. Limits targets to entities provided by the set integration domain.
       * https://www.home-assistant.io/docs/blueprint/selectors/#target-selector
       */
      integration?: string;
    };
  } | null;
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
  } | null;
}

export interface TimeSelector {
  /**
   * The time selector shows a time input that allows the user to specify a time of the day.
   * https://www.home-assistant.io/docs/blueprint/selectors/#time-selector
   */
  time: null;
}
