/**
 * Lovelace Elements.
 * Source: https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/elements
 */
import { Data, Entity, CameraEntity } from "../types";
import { Condition } from "./types";
import { Action } from "./actions";

interface Style {
  [key: string]: any;
}

export type Element =
  | ConditionalElement
  | CustomElement
  | IconElement
  | ImageElement
  | ServiceButtonElement
  | StateBadgeElement
  | StateIconElement
  | StateLabelElement;

export interface ConditionalElement {
  /**
   * Much like the Conditional card, this element will let you show its sub-elements based on entity states.
   * https://www.home-assistant.io/lovelace/picture-elements/#conditional-element
   */
  type: "conditional";

  /**
   * List of entity IDs and matching states.
   * https://www.home-assistant.io/lovelace/picture-elements/#conditions
   */
  conditions: Condition[];

  /**
   * One or more elements of any type to show when conditions are met.
   */
  elements: Element[];
}

/**
 * @TJS-additionalProperties true
 */
export interface CustomElement {
  /**
   * This is a custom element.
   * @TJS-pattern custom:(.*)$
   */
  type: string;
}

export interface IconElement {
  /**
   * This element creates a static icon that is not linked to the state of an entity.
   * https://www.home-assistant.io/lovelace/picture-elements/#icon-element
   */
  type: "icon";

  /**
   * Action taken on card double tap.
   * https://www.home-assistant.io/lovelace/picture-elements/#double_tap_action
   */
  double_tap_action?: Action;

  /**
   * Entity to use for more-info/toggle.
   * https://www.home-assistant.io/lovelace/picture-elements/#entity
   */
  entity?: Entity;

  /**
   * Action taken on card tap and hold..
   * https://www.home-assistant.io/lovelace/picture-elements/#hold_action
   */
  hold_action?: Action;

  /**
   * Icon to display (e.g., mdi:home).
   * https://www.home-assistant.io/lovelace/picture-elements/#icon
   */
  icon: string;

  /**
   * Position and style the element using CSS.
   * https://www.home-assistant.io/lovelace/picture-elements/#style
   */
  style: Style;

  /**
   * Action taken on card tap.
   * https://www.home-assistant.io/lovelace/picture-elements/#tap_action
   */
  tap_action?: Action;
}

export interface ImageElement {
  /**
   * This creates an image element that overlays the background image.
   * https://www.home-assistant.io/lovelace/picture-elements/#image-element
   */
  type: "image";

  /**
   * Height-width-ratio. Defaults to 50%.
   * https://www.home-assistant.io/lovelace/picture-elements/#aspect_ratio
   */
  aspect_ratio?: string;

  /**
   * A camera entity.
   * https://www.home-assistant.io/lovelace/picture-elements/#camera_image
   */
  camera_image?: CameraEntity;

  /**
   * Action taken on card double tap.
   * https://www.home-assistant.io/lovelace/picture-elements/#double_tap_action
   */
  double_tap_action?: Action;

  /**
   * Entity to use for state_image and state_filter and also target for actions.
   * https://www.home-assistant.io/lovelace/picture-elements/#entity
   */
  entity?: Entity;

  /**
   * Default CSS filter.
   * https://www.home-assistant.io/lovelace/picture-elements/#filter
   */
  filter?: string;

  /**
   * Action taken on card tap and hold.
   * https://www.home-assistant.io/lovelace/picture-elements/#hold_action
   */
  hold_action?: Action;

  /**
   * The image to display.
   * https://www.home-assistant.io/lovelace/picture-elements/#image
   */
  image?: string;

  /**
   * State-based CSS filters.
   * https://www.home-assistant.io/lovelace/picture-elements/#how-to-use-state_filter
   */
  state_filter?: { [key: string]: string };

  /**
   * Specify a different image to display based on the state of the entity.
   * https://www.home-assistant.io/lovelace/picture-elements/#how-to-use-state_image
   */
  state_image?: { [key: string]: string };

  /**
   * Position and style the element using CSS.
   * https://www.home-assistant.io/lovelace/picture-elements/#style
   */
  style: Style;

  /**
   * Action taken on card tap.
   * https://www.home-assistant.io/lovelace/picture-elements/#tap_action
   */
  tap_action?: Action;
}

export interface ServiceButtonElement {
  /**
   * This entity creates a button (with arbitrary text) that can be used to call a service.
   * https://www.home-assistant.io/lovelace/picture-elements/#service-call-button
   */
  type: "service-button";

  /**
   * The Home Assistant service to call.
   * https://www.home-assistant.io/lovelace/picture-elements/#service
   */
  service: string;

  /**
   * The service data to pass into the service call.
   * https://www.home-assistant.io/lovelace/picture-elements/#service_data
   */
  service_data?: Data;

  /**
   * Position and style the element using CSS.
   * https://www.home-assistant.io/lovelace/picture-elements/#style
   */
  style: Style;

  /**
   * Button label.
   * https://www.home-assistant.io/lovelace/picture-elements/#title
   */
  title: string;
}

export interface StateBadgeElement {
  /**
   * This element creates a badge representing the state of an entity.
   * https://www.home-assistant.io/lovelace/picture-elements/#state-badge
   */
  type: "state-badge";

  /**
   * Action taken on card double tap.
   * https://www.home-assistant.io/lovelace/picture-elements/#double_tap_action
   */
  double_tap_action?: Action;

  /**
   * Entity id.
   * https://www.home-assistant.io/lovelace/picture-elements/#entity
   */
  entity: Entity;

  /**
   * Action taken on card tap and hold..
   * https://www.home-assistant.io/lovelace/picture-elements/#hold_action
   */
  hold_action?: Action;

  /**
   * Position and style the element using CSS.
   * https://www.home-assistant.io/lovelace/picture-elements/#style
   */
  style: Style;

  /**
   * Action taken on card tap.
   * https://www.home-assistant.io/lovelace/picture-elements/#tap_action
   */
  tap_action?: Action;

  /**
   * State badge tooltip. Set to null to hide.
   * https://www.home-assistant.io/lovelace/picture-elements/#title
   */
  title?: string;
}

export interface StateIconElement {
  /**
   * This element represents an entity state using an icon.
   * https://www.home-assistant.io/lovelace/picture-elements/#state-icon
   */
  type: "state-icon";

  /**
   * The entity id to use.
   * https://www.home-assistant.io/lovelace/picture-elements/#entity
   */
  entity: Entity;

  /**
   * Action taken on card double tap.
   * https://www.home-assistant.io/lovelace/picture-elements/#double_tap_action
   */
  double_tap_action?: Action;

  /**
   * Action taken on card tap and hold..
   * https://www.home-assistant.io/lovelace/picture-elements/#hold_action
   */
  hold_action?: Action;

  /**
   * Overwrites icon.
   * https://www.home-assistant.io/lovelace/picture-elements/#icon
   */
  icon?: string;

  /**
   * Set to true to have icons colored when entity is active
   * https://www.home-assistant.io/lovelace/picture-elements/#state_color
   */
  state_color?: boolean;

  /**
   * Position and style the element using CSS.
   * https://www.home-assistant.io/lovelace/picture-elements/#style
   */
  style: Style;

  /**
   * Action taken on card tap.
   * https://www.home-assistant.io/lovelace/picture-elements/#tap_action
   */
  tap_action?: Action;

  /**
   * State badge tooltip. Set to null to hide.
   * https://www.home-assistant.io/lovelace/picture-elements/#title
   */
  title?: string;
}

export interface StateLabelElement {
  /**
   * This element represents an entity’s state via text.
   * https://www.home-assistant.io/lovelace/picture-elements/#state-label
   */
  type: "state-label";

  /**
   * Entity id,
   * https://www.home-assistant.io/lovelace/picture-elements/#entity
   */
  entity: Entity;

  /**
   * If present, the corresponding attribute will be shown, instead of the entity’s state.
   * https://www.home-assistant.io/lovelace/picture-elements/#attribute
   */
  attribute?: string;

  /**
   * Action taken on card double tap.
   * https://www.home-assistant.io/lovelace/picture-elements/#double_tap_action
   */
  double_tap_action?: Action;

  /**
   * Action taken on card tap and hold..
   * https://www.home-assistant.io/lovelace/picture-elements/#hold_action
   */
  hold_action?: Action;

  /**
   * Text before entity state.
   * https://www.home-assistant.io/lovelace/picture-elements/#prefix
   */
  prefix?: string;

  /**
   * Text after entity state.
   * https://www.home-assistant.io/lovelace/picture-elements/#suffix
   */
  suffix?: string;

  /**
   * Position and style the element using CSS.
   * https://www.home-assistant.io/lovelace/picture-elements/#style
   */
  style: Style;

  /**
   * Action taken on card tap.
   * https://www.home-assistant.io/lovelace/picture-elements/#tap_action
   */
  tap_action?: Action;

  /**
   * State badge tooltip. Set to null to hide.
   * https://www.home-assistant.io/lovelace/picture-elements/#title
   */
  title?: string;
}
