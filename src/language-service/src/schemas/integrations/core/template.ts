/**
 * Template integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/template/
 */
import {
  DeviceClassesBinarySensor,
  DeviceClassesCover,
  DeviceClassesSensor,
  DynamicTemplate,
  IncludeList,
  IncludeNamed,
  PositiveInteger,
  PressureUnit,
  StateClassesSensor,
  TemperatureUnit,
  Template,
  TimePeriod,
  VisibilityUnit,
  WindSpeedUnit,
} from "../../types";
import { Action } from "../actions";
import { BlueprintUsage } from "./blueprint";
import { Condition } from "../conditions";
import { PlatformSchema } from "../platform";
import { Trigger } from "../triggers";

export type Domain = "template";
export type Schema = Item[] | IncludeList;

// TemplateFile instead of File to avoid JSON schema conflicts
export type TemplateFile = Item | Item[];

export interface Item {
  /**
   * List of alarm control panels
   * https://www.home-assistant.io/integrations/template#alarm-control-panel
   */
  alarm_control_panel?: AlarmControlPanelItem | AlarmControlPanelItem[] | IncludeList;

  /**
   * List of binary sensors
   * https://www.home-assistant.io/integrations/template#binary_sensor
   */
  binary_sensor?: BinarySensorItem | BinarySensorItem[] | IncludeList;

  /**
   * List of buttons
   * https://www.home-assistant.io/integrations/template#button
   */
  button?: ButtonItem | ButtonItem[] | IncludeList;

  /**
   * List of covers
   * https://www.home-assistant.io/integrations/template#cover
   */
  cover?: CoverItem | CoverItem[] | IncludeList;

  /**
   * List of events
   * https://www.home-assistant.io/integrations/template#event
   */
  event?: EventItem | EventItem[] | IncludeList;

  /**
   * List of fans
   * https://www.home-assistant.io/integrations/template#fan
   */
  fan?: FanItem | FanItem[] | IncludeList;

  /**
   * List of images
   * https://www.home-assistant.io/integrations/template/#image
   */
  image?: ImageItem | ImageItem[] | IncludeList;

  /**
   * List of lights
   * https://www.home-assistant.io/integrations/template#light
   */
  light?: LightItem | LightItem[] | IncludeList;

  /**
   * List of locks
   * https://www.home-assistant.io/integrations/template#lock
   */
  lock?: LockItem | LockItem[] | IncludeList;

  /**
   * List of numbers
   * https://www.home-assistant.io/integrations/template#number
   */
  number?: NumberItem | NumberItem[] | IncludeList;

  /**
   * List of selects
   * https://www.home-assistant.io/integrations/template#select
   */
  select?: SelectItem | SelectItem[] | IncludeList;

  /**
   * List of sensors
   * https://www.home-assistant.io/integrations/template#sensor
   */
  sensor?: SensorItem | SensorItem[] | IncludeList;

  /**
   * List of switches
   * https://www.home-assistant.io/integrations/template/#switch
   */
  switch?: SwitchItem | SwitchItem[] | IncludeList;

  /**
   * List of updates
   * https://www.home-assistant.io/integrations/template#update
   */
  update?: UpdateItem | UpdateItem[] | IncludeList;

  /**
   * List of vacuums
   * https://www.home-assistant.io/integrations/template#vacuum
   */
  vacuum?: VacuumItem | VacuumItem[] | IncludeList;

  /**
   * List of weather entities
   * https://www.home-assistant.io/integrations/template#weather
   */
  weather?: WeatherItem | WeatherItem[] | IncludeList;

  /**
   * Define actions to be executed when the trigger fires. Optional. Variables set by the action script are available when evaluating entity templates.
   * This can be used to interact with anything via services, in particular services with response data. See action documentation.
   * https://www.home-assistant.io/integrations/template/#action
   */
  action?: Action | Action[];

  /**
   * Define conditions that have to be met after a trigger fires and before any actions are executed or sensor updates are performed (for trigger-based entities only). Optional. See condition documentation.
   * https://www.home-assistant.io/integrations/template/#condition
   */
  condition?: Condition | Condition[] | DynamicTemplate | IncludeList;

  /**
   * Define an automation trigger to update the entities. Optional. If omitted will update based on referenced entities. See trigger documentation.
   * https://www.home-assistant.io/integrations/template#trigger
   */
  trigger?: Trigger | Trigger[] | IncludeList;

  /**
   * Define template sensors or binary sensors based on a blueprint. Optional. See template template documentation.
   * https://www.home-assistant.io/integrations/template/#using-blueprints
   */
  use_blueprint?: BlueprintUsage;

  /**
   * The unique ID for this config block. This will be prefixed to all unique IDs of all entities in this block.
   * https://www.home-assistant.io/integrations/template#unique_id
   */
  unique_id?: string;
}

interface BaseItem {
  /**
   * Defines a template to get the available state of the entity. If the template either fails to render or returns True, "1", "true", "yes", "on", "enable", or a non-zero number, the entity will be available.
   * https://www.home-assistant.io/integrations/template#availability
   */
  availability?: Template;

  /**
   * Use default_entity_id instead of name for automatic generation of the entity id. E.g. sensor.my_awesome_sensor. When used without a unique_id, the entity id will update during restart or reload if the entity id is available. If the entity id already exists, the entity id will be created with a number at the end. When used with a unique_id, the default_entity_id is only used when the entity is added for the first time. When set, this overrides a user-customized Entity ID in case the entity was deleted and added again.
   * https://www.home-assistant.io/integrations/template#default_entity_id
   */
  default_entity_id?: string

  /**
   * Defines a template for the icon of the entity.
   * https://www.home-assistant.io/integrations/template#icon
   */
  icon?: Template;

  /**
   * Defines a template for the entity picture of the sensor.
   * https://www.home-assistant.io/integrations/template#picture
   */
  picture?: Template;

  /**
   * Defines a template to get the name of the entity.
   * https://www.home-assistant.io/integrations/template#name
   */
  name?: Template;

  /**
   * An ID that uniquely identifies this entity. Will be combined with the unique ID of the configuration block if available. This allows changing the name, icon and entity_id from the web interface.
   * https://www.home-assistant.io/integrations/template#unique_id
   */
  unique_id?: string;
}

interface AlarmControlPanelItem extends BaseItem {
  /**
   * Defines actions to run when the alarm is armed to away mode.
   * https://www.home-assistant.io/integrations/template#arm_away
   */
  arm_away?: Action | Action[];

  /**
   * Defines actions to run when the alarm is armed to custom bypass mode.
   * https://www.home-assistant.io/integrations/template#arm_custom_bypass
   */
  arm_custom_bypass?: Action | Action[];

  /**
   * Defines actions to run when the alarm is armed to home mode.
   * https://www.home-assistant.io/integrations/template#arm_home
   */
  arm_home?: Action | Action[];

  /**
   * Defines actions to run when the alarm is armed to night mode.
   * https://www.home-assistant.io/integrations/template#arm_night
   */
  arm_night?: Action | Action[];

  /**
   * Defines actions to run when the alarm is armed to vacation mode.
   * https://www.home-assistant.io/integrations/template#arm_vacation
   */
  arm_vacation?: Action | Action[];

  /**
   * If true, the code is required to arm the alarm.
   * https://www.home-assistant.io/integrations/template#code_arm_required
   */
  code_arm_required?: boolean;

  /**
   * Format for the code used to arm/disarm the alarm. Valid values are 'number', 'text', or 'no_code'.
   * https://www.home-assistant.io/integrations/template#code_format
   */
  code_format?: "number" | "text" | "no_code";

  /**
   * Defines actions to run when the alarm is disarmed.
   * https://www.home-assistant.io/integrations/template#disarm
   */
  disarm?: Action | Action[];

  /**
   * Defines a template to get the state of the alarm control panel. Valid values are armed_away, armed_home, armed_night, armed_vacation, arming, disarmed, pending, triggered, unavailable.
   * https://www.home-assistant.io/integrations/template#state
   */
  state?: Template;

  /**
   * Defines actions to run when the alarm is triggered.
   * https://www.home-assistant.io/integrations/template#trigger
   */
  trigger?: Action | Action[];
}

export interface BinarySensorItem extends BaseItem {
  /**
   * Defines a template to get the available state of the entity. If the template either fails to render or returns True, "1", "true", "yes", "on", "enable", or a non-zero number, the entity will be available.
   * https://www.home-assistant.io/integrations/template#availability
   */
  attributes?: { [key: string]: Template };

  /**
   * **Requires a trigger**. After how much time the entity should turn off after it rendered ‘on’.
   * https://www.home-assistant.io/integrations/template#auto_off
   */
  auto_off?: TimePeriod | Template;

  /**
   * The amount of time (ie 0:00:05) the template state must be not met before this sensor will switch to on. This can also be a template.
   * https://www.home-assistant.io/integrations/template#delay_off
   */
  delay_off?: TimePeriod | Template;

  /**
   * The amount of time (ie 0:00:05) the template state must be met before this sensor will switch to on. This can also be a template.
   * https://www.home-assistant.io/integrations/template#delay_on
   */
  delay_on?: TimePeriod | Template;

  /**
   * Sets the class of the device, changing the device state and icon that is displayed on the UI (see below). It does not set the unit_of_measurement.
   * https://www.home-assistant.io/integrations/template#device_class
   */
  device_class?: DeviceClassesBinarySensor;

  /**
   * Defines a template for the entity picture of the sensor.
   * https://www.home-assistant.io/integrations/template#picture
   */
  picture?: Template;

  /**
   * The sensor is on if the template evaluates as True, yes, on, enable or a positive number. Any other value will render it as off. The actual appearance in the frontend (Open/Closed, Detected/Clear etc) depends on the sensor’s device_class value
   * https://www.home-assistant.io/integrations/template#state
   */
  state?: Template;
}

interface ButtonItem extends BaseItem {
  /**
   * Defines actions to run to press the button.
   * https://www.home-assistant.io/integrations/template#button
   */
  press?: Action | Action[];
}

interface CoverItem extends BaseItem {
  /**
   * Defines actions to run when the cover is given a close command.
   * https://www.home-assistant.io/integrations/template#close_cover
   */
  close_cover?: Action | Action[];

  /**
   * Sets the class of the device, changing the device state and icon that is displayed on the UI.
   * https://www.home-assistant.io/integrations/template#device_class
   */
  device_class?: DeviceClassesCover;

  /**
   * Defines actions to run when the cover is given an open command.
   * https://www.home-assistant.io/integrations/template#open_cover
   */
  open_cover?: Action | Action[];

  /**
   * Defines if the cover works in optimistic mode.
   * https://www.home-assistant.io/integrations/template#optimistic
   */
  optimistic?: boolean;

  /**
   * Defines a template to get the position of the cover. Legal values are numbers between 0 (closed) and 100 (open).
   * https://www.home-assistant.io/integrations/template#position
   */
  position?: Template;

  /**
   * Defines actions to run when the cover is given a set position command. The position is available as `position` variable.
   * https://www.home-assistant.io/integrations/template#set_cover_position
   */
  set_cover_position?: Action | Action[];

  /**
   * Defines actions to run when the cover is given a set tilt position command. The tilt position is available as `tilt` variable.
   * https://www.home-assistant.io/integrations/template#set_cover_tilt_position
   */
  set_cover_tilt_position?: Action | Action[];

  /**
   * Defines a template to get the state of the cover. Valid values are open, opening, closed, closing.
   * https://www.home-assistant.io/integrations/template#state
   */
  state?: Template;

  /**
   * Defines actions to run when the cover is given a stop command.
   * https://www.home-assistant.io/integrations/template#stop_cover
   */
  stop_cover?: Action | Action[];

  /**
   * Defines a template to get the tilt position of the cover. Legal values are numbers between 0 (closed) and 100 (open).
   * https://www.home-assistant.io/integrations/template#tilt
   */
  tilt?: Template;

  /**
   * Defines if the cover tilt works in optimistic mode.
   * https://www.home-assistant.io/integrations/template#tilt_optimistic
   */
  tilt_optimistic?: boolean;
}

interface EventItem extends BaseItem {
  /**
   * Sets the class of the device, changing the device state and icon that is displayed on the UI.
   * https://www.home-assistant.io/integrations/template#device_class
   */
  device_class?: string;

  /**
   * Defines a template for the event type.
   * https://www.home-assistant.io/integrations/template#event_type
   */
  event_type?: Template;

  /**
   * Defines a template for the list of available event types. Must render as a list.
   * https://www.home-assistant.io/integrations/template#event_types
   */
  event_types?: Template;
}

interface FanItem extends BaseItem {
  /**
   * Defines a template to get the direction of the fan. Valid values are 'forward' or 'reverse'.
   * https://www.home-assistant.io/integrations/template#direction
   */
  direction?: Template;

  /**
   * Defines a template to get the oscillating state of the fan. Valid values are true or false.
   * https://www.home-assistant.io/integrations/template#oscillating
   */
  oscillating?: Template;

  /**
   * Defines a template to get the speed percentage of the fan.
   * https://www.home-assistant.io/integrations/template#percentage
   */
  percentage?: Template;

  /**
   * Defines a template to get the preset mode of the fan.
   * https://www.home-assistant.io/integrations/template#preset_mode
   */
  preset_mode?: Template;

  /**
   * List of preset modes the fan is capable of.
   * https://www.home-assistant.io/integrations/template#preset_modes
   */
  preset_modes?: string[];

  /**
   * Defines actions to run when the fan is given a direction command.
   * https://www.home-assistant.io/integrations/template#set_direction
   */
  set_direction?: Action | Action[];

  /**
   * Defines actions to run when the fan is given an oscillating command.
   * https://www.home-assistant.io/integrations/template#set_oscillating
   */
  set_oscillating?: Action | Action[];

  /**
   * Defines actions to run when the fan is given a speed percentage command.
   * https://www.home-assistant.io/integrations/template#set_percentage
   */
  set_percentage?: Action | Action[];

  /**
   * Defines actions to run when the fan is given a preset mode command.
   * https://www.home-assistant.io/integrations/template#set_preset_mode
   */
  set_preset_mode?: Action | Action[];

  /**
   * The number of speeds the fan supports.
   * https://www.home-assistant.io/integrations/template#speed_count
   */
  speed_count?: number;

  /**
   * Defines a template to get the state of the fan. Valid values are 'on' or 'off'.
   * https://www.home-assistant.io/integrations/template#state
   */
  state?: Template;

  /**
   * Defines actions to run when the fan is turned off.
   * https://www.home-assistant.io/integrations/template#turn_off
   */
  turn_off?: Action | Action[];

  /**
   * Defines actions to run when the fan is turned on.
   * https://www.home-assistant.io/integrations/template#turn_on
   */
  turn_on?: Action | Action[];
}

interface LightItem extends BaseItem {
  /**
   * Defines a template to get the current effect.
   * https://www.home-assistant.io/integrations/template#effect
   */
  effect?: Template;

  /**
   * Defines a template to get the list of supported effects. Must render as a list.
   * https://www.home-assistant.io/integrations/template#effect_list
   */
  effect_list?: Template;

  /**
   * Defines a template to get the HS color of the light. Must render as a tuple (hue, saturation).
   * https://www.home-assistant.io/integrations/template#hs
   */
  hs?: Template;

  /**
   * Defines a template to get the brightness of the light.
   * https://www.home-assistant.io/integrations/template#level
   */
  level?: Template;

  /**
   * Defines a template to get the maximum mireds value of the light.
   * https://www.home-assistant.io/integrations/template#max_mireds
   */
  max_mireds?: Template;

  /**
   * Defines a template to get the minimum mireds value of the light.
   * https://www.home-assistant.io/integrations/template#min_mireds
   */
  min_mireds?: Template;

  /**
   * Defines a template to get the RGB color of the light. Must render as a tuple (red, green, blue).
   * https://www.home-assistant.io/integrations/template#rgb
   */
  rgb?: Template;

  /**
   * Defines a template to get the RGBW color of the light. Must render as a tuple (red, green, blue, white).
   * https://www.home-assistant.io/integrations/template#rgbw
   */
  rgbw?: Template;

  /**
   * Defines a template to get the RGBWW color of the light. Must render as a tuple (red, green, blue, cold white, warm white).
   * https://www.home-assistant.io/integrations/template#rgbww
   */
  rgbww?: Template;

  /**
   * Defines actions to run when the light is given an effect command.
   * https://www.home-assistant.io/integrations/template#set_effect
   */
  set_effect?: Action | Action[];

  /**
   * Defines actions to run when the light is given an HS color command.
   * https://www.home-assistant.io/integrations/template#set_hs
   */
  set_hs?: Action | Action[];

  /**
   * Defines actions to run when the light is given a brightness command.
   * https://www.home-assistant.io/integrations/template#set_level
   */
  set_level?: Action | Action[];

  /**
   * Defines actions to run when the light is given an RGB color command.
   * https://www.home-assistant.io/integrations/template#set_rgb
   */
  set_rgb?: Action | Action[];

  /**
   * Defines actions to run when the light is given an RGBW color command.
   * https://www.home-assistant.io/integrations/template#set_rgbw
   */
  set_rgbw?: Action | Action[];

  /**
   * Defines actions to run when the light is given an RGBWW color command.
   * https://www.home-assistant.io/integrations/template#set_rgbww
   */
  set_rgbww?: Action | Action[];

  /**
   * Defines actions to run when the light is given a color temperature command.
   * https://www.home-assistant.io/integrations/template#set_temperature
   */
  set_temperature?: Action | Action[];

  /**
   * Defines a template to get the state of the light. Valid values are 'on' or 'off'.
   * https://www.home-assistant.io/integrations/template#state
   */
  state?: Template;

  /**
   * Defines a template to get if the light supports transition.
   * https://www.home-assistant.io/integrations/template#supports_transition
   */
  supports_transition?: Template;

  /**
   * Defines a template to get the color temperature of the light.
   * https://www.home-assistant.io/integrations/template#temperature
   */
  temperature?: Template;

  /**
   * Defines actions to run when the light is turned off.
   * https://www.home-assistant.io/integrations/template#turn_off
   */
  turn_off?: Action | Action[];

  /**
   * Defines actions to run when the light is turned on.
   * https://www.home-assistant.io/integrations/template#turn_on
   */
  turn_on?: Action | Action[];
}

interface LockItem extends BaseItem {
  /**
   * Defines a template for the code format. Should be a valid Python regex or None.
   * https://www.home-assistant.io/integrations/template#code_format
   */
  code_format?: Template;

  /**
   * Defines actions to run to lock the lock.
   * https://www.home-assistant.io/integrations/template#lock
   */
  lock?: Action | Action[];

  /**
   * Defines actions to run to open the lock.
   * https://www.home-assistant.io/integrations/template#open
   */
  open?: Action | Action[];

  /**
   * Defines a template to get the state of the lock. Valid values are locked, unlocked, open, locking, unlocking, opening, jammed.
   * https://www.home-assistant.io/integrations/template#state
   */
  state?: Template;

  /**
   * Defines actions to run to unlock the lock.
   * https://www.home-assistant.io/integrations/template#unlock
   */
  unlock?: Action | Action[];
}

interface ImageItem extends BaseItem {
  /**
   * The URL on which the image is served.
   * https://www.home-assistant.io/integrations/template/#url
   */
  url: Template;

  /**
   * Enable or disable SSL certificate verification.
   * Set to false to use an http-only URL, or you have a self-signed SSL certificate and haven’t installed the CA certificate to enable verification.
   * https://www.home-assistant.io/integrations/template/#verify_ssl
   */
  verify_ssl?: boolean;
}

interface NumberItem extends BaseItem {
  /**
   * Template for the number’s maximum value.
   * https://www.home-assistant.io/integrations/template#max
   */
  max?: Template;

  /**
   * Template for the number’s minimum value.
   * https://www.home-assistant.io/integrations/template#min
   */
  min?: Template;

  /**
   * Flag that defines if number works in optimistic mode.
   * https://www.home-assistant.io/integrations/template#optimistic
   */
  optimistic?: boolean;

  /**
   * Defines actions to run when the number value changes. The variable `value` will contain the number entered.
   * https://www.home-assistant.io/integrations/template#set_value
   */
  set_value: Action | Action[];

  /**
   * Defines a template to get the state of the sensor.
   * https://www.home-assistant.io/integrations/template#state
   */
  state: Template;

  /**
   * Template for the number’s increment/decrement step.
   * https://www.home-assistant.io/integrations/template#step
   */
  step: Template;
}

interface SelectItem extends BaseItem {
  /**
   * Flag that defines if select works in optimistic mode.
   * https://www.home-assistant.io/integrations/template#options
   */
  optimistic?: boolean;

  /**
   * Template for the select’s available options.
   * https://www.home-assistant.io/integrations/template#options
   */
  options: Template;

  /**
   * Defines actions to run to select an option from the options list. The variable `option` will contain the option selected.
   * https://www.home-assistant.io/integrations/template#select_option
   */
  select_option: Action | Action[];

  /**
   * Template for the select’s current value.
   * https://www.home-assistant.io/integrations/template#state
   */
  state: Template;
}

export interface SensorItem extends BaseItem {
  /**
   * Defines a template to get the available state of the entity. If the template either fails to render or returns True, "1", "true", "yes", "on", "enable", or a non-zero number, the entity will be available.
   * https://www.home-assistant.io/integrations/template#availability
   */
  attributes?: { [key: string]: Template };

  /**
   * Sets the class of the device, changing the device state and icon that is displayed on the UI (see below). It does not set the unit_of_measurement.
   * https://www.home-assistant.io/integrations/template#device_class
   */
  device_class?: DeviceClassesSensor;

  /**
   * Defines a template for the entity picture of the sensor.
   * https://www.home-assistant.io/integrations/template#picture
   */
  picture?: Template;

  /**
   * The state_class of the sensor. This will also display the value based on the user profile Number Format setting and influence the graphical presentation in the history visualization as a continuous value.
   * https://www.home-assistant.io/integrations/template#state_class
   */
  state_class?: StateClassesSensor;

  /**
   * Defines a template to get the state of the sensor.
   * https://www.home-assistant.io/integrations/template#state
   */
  state: Template;

  /**
   * Defines the units of measurement of the sensor, if any. This will also display the value based on the user profile Number Format setting and influence the graphical presentation in the history visualization as a continuous value.
   * https://www.home-assistant.io/integrations/template#state
   */
  unit_of_measurement?: string;
}

interface SwitchItem {
  /**
   * Defines a template to get the available state of the component. If the template returns true, the device is available.
   * https://www.home-assistant.io/integrations/switch.template#availability_template
   */
  availability?: Template;

  /**
   * Name to use in the frontend.
   * https://www.home-assistant.io/integrations/switch.template#friendly_name
   */
  name?: string;

  /**
   * Defines a template for the icon of the switch.
   * https://www.home-assistant.io/integrations/switch.template#icon_template
   */
  icon?: Template;

  /**
   * Defines an action to run when the switch is turned off.
   * https://www.home-assistant.io/integrations/switch.template#turn_off
   */
  turn_off: Action | Action[];

  /**
   * Defines an action to run when the switch is turned on.
   * https://www.home-assistant.io/integrations/switch.template#turn_on
   */
  turn_on: Action | Action[];

  /**
   * An ID that uniquely identifies this switch. Set this to an unique value to allow customization trough the UI.
   * https://www.home-assistant.io/integrations/switch.template#unique_id
   */
  unique_id?: string;

  /**
   * Defines a template to set the state of the switch. If not defined, the switch will optimistically assume all commands are successful.
   * https://www.home-assistant.io/integrations/template/#state
   */
  state?: Template;
}

interface UpdateItem extends BaseItem {
  /**
   * Enable automatic backup option.
   * https://www.home-assistant.io/integrations/template#backup
   */
  backup?: boolean;

  /**
   * Sets the class of the device, changing the device state and icon that is displayed on the UI.
   * https://www.home-assistant.io/integrations/template#device_class
   */
  device_class?: string;

  /**
   * Defines a template for whether an update is in progress.
   * https://www.home-assistant.io/integrations/template#in_progress
   */
  in_progress?: Template;

  /**
   * Defines actions to run to install the update.
   * https://www.home-assistant.io/integrations/template#install
   */
  install?: Action | Action[];

  /**
   * Defines a template for the currently installed version.
   * https://www.home-assistant.io/integrations/template#installed_version
   */
  installed_version?: Template;

  /**
   * Defines a template for the latest available version.
   * https://www.home-assistant.io/integrations/template#latest_version
   */
  latest_version?: Template;

  /**
   * Defines a template for the release summary.
   * https://www.home-assistant.io/integrations/template#release_summary
   */
  release_summary?: Template;

  /**
   * Defines a template for the release URL.
   * https://www.home-assistant.io/integrations/template#release_url
   */
  release_url?: Template;

  /**
   * Allow selecting a specific version to install.
   * https://www.home-assistant.io/integrations/template#specific_version
   */
  specific_version?: boolean;

  /**
   * Defines a template for the title of the update.
   * https://www.home-assistant.io/integrations/template#title
   */
  title?: Template;

  /**
   * Defines a template for the update progress percentage.
   * https://www.home-assistant.io/integrations/template#update_percent
   */
  update_percent?: Template;
}

interface VacuumItem extends BaseItem {
  /**
   * Defines a template for custom attributes.
   * https://www.home-assistant.io/integrations/template#attributes
   */
  attributes?: { [key: string]: Template };

  /**
   * Defines a template to get the battery level of the vacuum. Legal values are numbers between 0 and 100.
   * https://www.home-assistant.io/integrations/template#battery_level
   */
  battery_level?: Template;

  /**
   * Defines actions to run when the vacuum is given a clean spot command.
   * https://www.home-assistant.io/integrations/template#clean_spot
   */
  clean_spot?: Action | Action[];

  /**
   * Defines a template to get the fan speed of the vacuum.
   * https://www.home-assistant.io/integrations/template#fan_speed
   */
  fan_speed?: Template;

  /**
   * List of fan speeds supported by the vacuum.
   * https://www.home-assistant.io/integrations/template#fan_speeds
   */
  fan_speeds?: string[];

  /**
   * Defines actions to run when the vacuum is given a locate command.
   * https://www.home-assistant.io/integrations/template#locate
   */
  locate?: Action | Action[];

  /**
   * Defines actions to run when the vacuum is paused.
   * https://www.home-assistant.io/integrations/template#pause
   */
  pause?: Action | Action[];

  /**
   * Defines actions to run when the vacuum is given a return to base command.
   * https://www.home-assistant.io/integrations/template#return_to_base
   */
  return_to_base?: Action | Action[];

  /**
   * Defines actions to run when the vacuum is given a command to set the fan speed.
   * https://www.home-assistant.io/integrations/template#set_fan_speed
   */
  set_fan_speed?: Action | Action[];

  /**
   * Defines actions to run when the vacuum is started.
   * https://www.home-assistant.io/integrations/template#start
   */
  start?: Action | Action[];

  /**
   * Defines a template to get the state of the vacuum. Valid values are docked, cleaning, idle, paused, returning, error.
   * https://www.home-assistant.io/integrations/template#state
   */
  state?: Template;

  /**
   * Defines actions to run when the vacuum is stopped.
   * https://www.home-assistant.io/integrations/template#stop
   */
  stop?: Action | Action[];
}

interface WeatherItem extends BaseItem {
  /**
   * Defines a template for the apparent temperature.
   * https://www.home-assistant.io/integrations/template#apparent_temperature
   */
  apparent_temperature?: Template;

  /**
   * Defines a template for the cloud coverage.
   * https://www.home-assistant.io/integrations/template#cloud_coverage
   */
  cloud_coverage?: Template;

  /**
   * Defines a template for the current weather condition.
   * https://www.home-assistant.io/integrations/template#condition
   */
  condition?: Template;

  /**
   * Defines a template for the dew point.
   * https://www.home-assistant.io/integrations/template#dew_point
   */
  dew_point?: Template;

  /**
   * Defines a template for the daily forecast data.
   * https://www.home-assistant.io/integrations/template#forecast_daily
   */
  forecast_daily?: Template;

  /**
   * Defines a template for the hourly forecast data.
   * https://www.home-assistant.io/integrations/template#forecast_hourly
   */
  forecast_hourly?: Template;

  /**
   * Defines a template for the twice daily forecast data.
   * https://www.home-assistant.io/integrations/template#forecast_twice_daily
   */
  forecast_twice_daily?: Template;

  /**
   * Defines a template for the current humidity.
   * https://www.home-assistant.io/integrations/template#humidity
   */
  humidity?: Template;

  /**
   * Defines a template for the ozone level.
   * https://www.home-assistant.io/integrations/template#ozone
   */
  ozone?: Template;

  /**
   * The unit of measurement for precipitation.
   * https://www.home-assistant.io/integrations/template#precipitation_unit
   */
  precipitation_unit?: string;

  /**
   * Defines a template for the current air pressure.
   * https://www.home-assistant.io/integrations/template#pressure
   */
  pressure?: Template;

  /**
   * Unit for pressure output.
   * https://www.home-assistant.io/integrations/template#pressure_unit
   */
  pressure_unit?: PressureUnit;

  /**
   * Defines a template for the current temperature.
   * https://www.home-assistant.io/integrations/template#temperature
   */
  temperature?: Template;

  /**
   * Unit for temperature output.
   * https://www.home-assistant.io/integrations/template#temperature_unit
   */
  temperature_unit?: TemperatureUnit;

  /**
   * Defines a template for the UV index.
   * https://www.home-assistant.io/integrations/template#uv_index
   */
  uv_index?: Template;

  /**
   * Defines a template for the current visibility.
   * https://www.home-assistant.io/integrations/template#visibility
   */
  visibility?: Template;

  /**
   * Unit for visibility output.
   * https://www.home-assistant.io/integrations/template#visibility_unit
   */
  visibility_unit?: VisibilityUnit;

  /**
   * Defines a template for the current wind bearing.
   * https://www.home-assistant.io/integrations/template#wind_bearing
   */
  wind_bearing?: Template;

  /**
   * Defines a template for the current wind gust speed.
   * https://www.home-assistant.io/integrations/template#wind_gust_speed
   */
  wind_gust_speed?: Template;

  /**
   * Defines a template for the current wind speed.
   * https://www.home-assistant.io/integrations/template#wind_speed
   */
  wind_speed?: Template;

  /**
   * Unit for wind speed output.
   * https://www.home-assistant.io/integrations/template#wind_speed_unit
   */
  wind_speed_unit?: WindSpeedUnit;
}

export interface AlarmControlPanelPlatformSchema extends PlatformSchema {
  /**
   * The template integrations creates alarm control panels that combine integrations or adds pre-processing logic to actions.
   * https://www.home-assistant.io/integrations/alarm_control_panel.template/
   */
  platform: "template";

  /**
   * List of panels.
   * https://www.home-assistant.io/integrations/alarm_control_panel.template/#panels
   */
  panels: {
    [key: string]: AlarmControlPanelPlatformItem | IncludeNamed;
  };
}

export interface BinarySensorPlatformSchema extends PlatformSchema {
  /**
   * The template platform supports binary sensors which get their values from other entities. The state of a Template Binary Sensor can only be on or off.
   * https://www.home-assistant.io/integrations/binary_sensor.template
   */
  platform: "template";

  /**
   * List of sensors.
   * https://www.home-assistant.io/integrations/binary_sensor.template#sensors
   */
  sensors: {
    [key: string]: BinarySensorPlatformItem | IncludeNamed;
  };
}

export interface CoverPlatformSchema extends PlatformSchema {
  /**
   * The template platform can create covers that combine integrations and provides the ability to run scripts or invoke services for each of the open, close, stop, position and tilt commands of a cover.
   * https://www.home-assistant.io/integrations/cover.template
   */
  platform: "template";

  /**
   * List of covers.
   * https://www.home-assistant.io/integrations/cover.template/#covers
   */
  covers: {
    [key: string]: CoverPlatformItem | IncludeNamed;
  };
}

export interface FanPlatformSchema extends PlatformSchema {
  /**
   * The template platform creates fans that combine integrations and provides the ability to run scripts or invoke services for each of the turn_on, turn_off, set_speed, set_oscillating, and set_direction commands of a fan.
   * https://www.home-assistant.io/integrations/fan.template
   */
  platform: "template";

  /**
   * List of fans.
   * https://www.home-assistant.io/integrations/fan.template/#fans
   */
  fans: {
    [key: string]: FanPlatformItem | IncludeNamed;
  };
}

export interface LightPlatformSchema extends PlatformSchema {
  /**
   * The template platform creates lights that combine integrations and provides the ability to run scripts or invoke services for each of the on, off, and brightness commands of a light.
   * https://www.home-assistant.io/integrations/light.template
   */
  platform: "template";

  /**
   * List of lights.
   * https://www.home-assistant.io/integrations/fan.template/#lights
   */
  lights: {
    [key: string]: LightPlatformItem | IncludeNamed;
  };
}

export interface LockPlatformSchema extends PlatformSchema {
  /**
   * The template platform creates locks that combines components.
   * https://www.home-assistant.io/integrations/lock.template
   */
  platform: "template";

  /**
   * Defines a template to get the available state of the component. If the template returns true, the device is available.
   * https://www.home-assistant.io/integrations/lock.template/#availability_template
   */
  availability_template?: Template;

  /**
   * Defines an action to lock the lock.
   * https://www.home-assistant.io/integrations/lock.template/#lock
   */
  lock: Action | Action[];

  /**
   * Name to use in the frontend.
   * https://www.home-assistant.io/integrations/lock.template/#name
   */
  name?: string;

  /**
   * Force lock state to use optimistic mode.
   * https://www.home-assistant.io/integrations/lock.template/#optimistic
   */
  optimistic?: boolean;

  /**
   * An ID that uniquely identifies this lock. Set this to an unique value to allow customization trough the UI.
   * https://www.home-assistant.io/integrations/lock.template/#unique_id
   */
  unique_id?: string;

  /**
   * Defines an action to unlock the lock.
   * https://www.home-assistant.io/integrations/lock.template/#unlock
   */
  unlock: Action | Action[];

  /**
   * Defines a template to set the state of the lock.
   * https://www.home-assistant.io/integrations/lock.template/#value_template
   */
  value_template: Template;
}

export interface SensorPlatformSchema extends PlatformSchema {
  /**
   * The template platform supports sensors which get their values from other entities.
   * https://www.home-assistant.io/integrations/template
   */
  platform: "template";

  /**
   * List of sensors.
   * https://www.home-assistant.io/integrations/template#sensors
   */
  sensors: {
    [key: string]: SensorPlatformItem | IncludeNamed;
  };
}

export interface SwitchPlatformSchema extends PlatformSchema {
  /**
   * The template platform creates switches that combines components.
   * https://www.home-assistant.io/integrations/switch.template
   */
  platform: "template";

  /**
   * List of switches.
   * https://www.home-assistant.io/integrations/switch.template#switches
   */
  switches: {
    [key: string]: SwitchPlatformItem | IncludeNamed;
  };
}

export interface VacuumPlatformSchema extends PlatformSchema {
  /**
   * The template platform creates vacuums that combine integrations and provides the ability to run scripts or invoke services for each of the start, pause, stop, return_to_base, clean_spot, locate and set_fan_speed commands of a vacuum.
   * https://www.home-assistant.io/integrations/vacuum.template
   */
  platform: "template";

  /**
   * List of vacuums.
   * https://www.home-assistant.io/integrations/vacuum.template#vacuums
   */
  vacuums: {
    [key: string]: VacuumPlatformItem | IncludeNamed;
  };
}

export interface WeatherPlatformSchema extends PlatformSchema {
  /**
   * The template integrations creates weather provider that combines integrations and an existing weather provider into a fused weather provider.
   * https://www.home-assistant.io/integrations/weather.template
   */
  platform: "template";

  /**
   * Defines a template for the current apparent temperature.
   * https://www.home-assistant.io/integrations/weather.template#apparent_temperature_template
   */
  apparent_temperature_template?: Template;

  /**
   * The attribution to be shown in the frontend.
   * https://www.home-assistant.io/integrations/weather.template#attribution_template
   */
  attribution_template?: Template;

  /**
   * Defines templates for the current cloud coverage.
   * https://www.home-assistant.io/integrations/weather.template#cloud_coverage_template
   */
  cloud_coverage_template?: Template;

  /**
   * Defines templates for the current weather condition.
   * https://www.home-assistant.io/integrations/weather.template#condition_template
   */
  condition_template: Template;

  /**
   * Defines templates for the current dew point.
   * https://www.home-assistant.io/integrations/weather.template#dew_point_template
   */
  dew_point_template?: Template;

  /**
   * Defines templates for the daily forcast data.
   * https://www.home-assistant.io/integrations/weather.template#forecast_template
   */
  forecast_daily_template?: Template;

  /**
   * Defines templates for the twice daily forcast data.
   * https://www.home-assistant.io/integrations/weather.template#forecast_template
   */
  forecast_twice_daily_template?: Template;

  /**
   * Defines templates for the hourly forcast data.
   * https://www.home-assistant.io/integrations/weather.template#forecast_template
   */
  forecast_hourly_template?: Template;

  /**
   * Defines templates for the current humidity.
   * https://www.home-assistant.io/integrations/weather.template#humidity_template
   */
  humidity_template: Template;

  /**
   * Name to use in the frontend.
   * https://www.home-assistant.io/integrations/weather.template#name
   */
  name: string;

  /**
   * The current ozone level.
   * https://www.home-assistant.io/integrations/weather.template#ozone_template
   */
  ozone_template?: Template;

  /**
   * The unit of measurement for the precipitation output.
   * https://www.home-assistant.io/integrations/weather.template#precipitation_unit
   */
  precipitation_unit?: string;

  /**
   * Defines templates for the current air pressure.
   * https://www.home-assistant.io/integrations/weather.template#pressure_template
   */
  pressure_template?: Template;

  /**
   * Unit for pressure_template output.
   * https://www.home-assistant.io/integrations/weather.template#pressure_unit
   */
  pressure_unit?: PressureUnit;

  /**
   * Defines templates for the current temperature.
   * https://www.home-assistant.io/integrations/weather.template#temperature_template
   */
  temperature_template: Template;

  /**
   * Unit for temperature_template output.
   * https://www.home-assistant.io/integrations/weather.template#temperature_unit
   */
  temperature_unit?: TemperatureUnit;

  /**
   * An ID that uniquely identifies this weather entity. Set this to a unique value to allow customization through the UI.
   * https://www.home-assistant.io/integrations/weather.template#unique_id
   */
  unique_id?: string;

  /**
   * The current visibility.
   * https://www.home-assistant.io/integrations/weather.template#visibility_template
   */
  visibility_template?: Template;

  /**
   * Unit for visibility_template output.
   * https://www.home-assistant.io/integrations/weather.template#visibility_unit
   */
  visibility_unit?: VisibilityUnit;

  /**
   * The current wind bearing.
   * https://www.home-assistant.io/integrations/weather.template#wind_bearing_template
   */
  wind_bearing_template?: Template;

  /**
   * Defines templates for the current wind gust speed.
   * https://www.home-assistant.io/integrations/weather.template#wind_gust_speed_template
   */
  wind_gust_speed_template?: Template;

  /**
   * Defines templates for the current wind speed.
   * https://www.home-assistant.io/integrations/weather.template#wind_speed_template
   */
  wind_speed_template?: Template;

  /**
   * Unit for wind_speed_template output.
   * https://www.home-assistant.io/integrations/weather.template#wind_speed_unit
   */
  wind_speed_unit?: WindSpeedUnit;
}

interface AlarmControlPanelPlatformItem {
  /**
   * Defines an action to run when the alarm is armed to away mode.
   * https://www.home-assistant.io/integrations/alarm_control_panel.template/#arm_away
   */
  arm_away?: Action | Action[] | IncludeList;

  /**
   * Defines an action to run when the alarm is armed to home mode.
   * https://www.home-assistant.io/integrations/alarm_control_panel.template/#arm_home
   */
  arm_home?: Action | Action[] | IncludeList;

  /**
   * Defines an action to run when the alarm is armed to night mode.
   * https://www.home-assistant.io/integrations/alarm_control_panel.template/#arm_night
   */
  arm_night?: Action | Action[] | IncludeList;

  /**
   * If true, the code is required to arm the alarm.
   * https://www.home-assistant.io/integrations/alarm_control_panel.template/#code_arm_required
   */
  code_arm_required?: boolean;

  /**
   * Format for the code used to arm/disarm the alarm.
   * https://www.home-assistant.io/integrations/alarm_control_panel.template/#code_format
   */
  code_format?: "no_code" | "number" | "text";

  /**
   * Defines an action to run when the alarm is disarmed.
   * https://www.home-assistant.io/integrations/alarm_control_panel.template/#disarm
   */
  disarm?: Action | Action[] | IncludeList;

  /**
   * Name to use in the frontend.
   * https://www.home-assistant.io/integrations/alarm_control_panel.template/#name
   */
  name?: string;

  /**
   * An ID that uniquely identifies this alarm control panel. Set this to an unique value to allow customization trough the UI.
   * https://www.home-assistant.io/integrations/alarm_control_panel.template/#unique_id
   */
  unique_id?: string;

  /**
   * Defines a template to set the state of the alarm panel. Only the states armed_away, armed_home, armed_night, disarmed, pending, triggered and unavailable are used.
   * https://www.home-assistant.io/integrations/alarm_control_panel.template/#value_template
   */
  value_template?: Template;
}

interface BinarySensorPlatformItem {
  /**
   * Defines templates for attributes of the sensor.
   * https://www.home-assistant.io/integrations/binary_sensor.template#attribute_templates
   */
  attribute_templates?: { [key: string]: Template };

  /**
   * Defines a template to get the available state of the sensor. Return true if the device is available, false otherwise.
   * https://www.home-assistant.io/integrations/binary_sensor.template#availability_template
   */
  availability_template?: Template;

  /**
   * The amount of time the template state must be not met before this sensor will switch to off.
   * https://www.home-assistant.io/integrations/binary_sensor.template#delay_off
   */
  delay_off?: TimePeriod;

  /**
   * The amount of time the template state must be met before this sensor will switch to on.
   * https://www.home-assistant.io/integrations/binary_sensor.template#delay_on
   */
  delay_on?: TimePeriod;

  /**
   * Sets the class of the device, changing the device state and icon that is displayed on the frontend.
   * https://www.home-assistant.io/integrations/binary_sensor.template#device_class
   */
  device_class?: DeviceClassesBinarySensor;

  /**
   * Defines a template for the entity picture of the sensor.
   * https://www.home-assistant.io/integrations/binary_sensor.template#entity_picture_template
   */
  entity_picture_template?: Template;

  /**
   * Name to use in the frontend.
   * https://www.home-assistant.io/integrations/binary_sensor.template#friendly_name
   */
  friendly_name?: string;

  /**
   * Defines a template for the icon of the sensor.
   * https://www.home-assistant.io/integrations/binary_sensor.template#icon_template
   */
  icon_template?: Template;

  /**
   * An ID that uniquely identifies this binary sensor. Set this to an unique value to allow customization through the UI.
   * https://www.home-assistant.io/integrations/binary_sensor.template#unique_id
   */
  unique_id?: string;

  /**
   * The sensor is on if the template evaluates as True and off otherwise.
   * https://www.home-assistant.io/integrations/binary_sensor.template#value_template
   */
  value_template: Template;
}

interface CoverPlatformItem {
  /**
   * Defines a template to get the available state of the component. If the template returns true, the device is available. If the template returns any other value, the device will be unavailable.
   * https://www.home-assistant.io/integrations/cover.template/#availability_template
   */
  availability_template?: Template;

  /**
   * Defines an action to close the cover.
   * https://www.home-assistant.io/integrations/cover.template/#close_cover
   */
  close_cover?: Action | Action[];

  /**
   * Sets the class of the device, changing the device state and icon that is displayed on the frontend.
   * https://www.home-assistant.io/integrations/cover.template/#device_class
   */
  device_class?: DeviceClassesCover;

  /**
   * Defines a template for the entity picture of the sensor.
   * https://www.home-assistant.io/integrations/cover.template/#entity_picture_template
   */
  entity_picture_template?: Template;

  /**
   * Name to use in the frontend.
   * https://www.home-assistant.io/integrations/cover.template/#friendly_name
   */
  friendly_name?: string;

  /**
   * Defines a template to specify which icon to use.
   * https://www.home-assistant.io/integrations/cover.template/#icon_template
   */
  icon_template?: Template;

  /**
   * Defines an action to open the cover. If open_cover is specified, close_cover must also be specified.
   * https://www.home-assistant.io/integrations/cover.template/#open_cover
   */
  open_cover?: Action | Action[];

  /**
   * Force cover position to use optimistic mode.
   * https://www.home-assistant.io/integrations/cover.template/#optimistic
   */
  optimistic?: boolean;

  /**
   * Defines a template to get the state of the cover. Legal values are numbers between 0 (closed) and 100 (open).
   * https://www.home-assistant.io/integrations/cover.template/#position_template
   */
  position_template?: Template;

  /**
   * Defines an action to set to a cover position (between 0 and 100).
   * https://www.home-assistant.io/integrations/cover.template/#set_cover_position
   */
  set_cover_position?: Action | Action[];

  /**
   * Defines an action to set the tilt of a cover (between 0 and 100).
   * https://www.home-assistant.io/integrations/cover.template/#set_cover_tilt_position
   */
  set_cover_tilt_position?: Action | Action[];

  /**
   * Defines an action to stop the cover.
   * https://www.home-assistant.io/integrations/cover.template/#stop_cover
   */
  stop_cover?: Action | Action[];

  /**
   * Force cover tilt position to use optimistic mode.
   * https://www.home-assistant.io/integrations/cover.template/#tilt_optimistic
   */
  tilt_optimistic?: boolean;

  /**
   * Defines a template to get the tilt state of the cover. Legal values are numbers between 0 (closed) and 100 (open).
   * https://www.home-assistant.io/integrations/cover.template/#tilt_template
   */
  tilt_template?: Template;

  /**
   * An ID that uniquely identifies this cover. Set this to an unique value to allow customization trough the UI.
   * https://www.home-assistant.io/integrations/cover.template/#unique_id
   */
  unique_id?: string;

  /**
   * Defines a template to get the state of the cover. Valid values are open/true or closed/false.
   * https://www.home-assistant.io/integrations/cover.template/#value_template
   */
  value_template?: Template;
}

interface FanPlatformItem {
  /**
   * Defines a template to get the available state of the component. If the template returns true, the device is available.
   * https://www.home-assistant.io/integrations/fan.template/#availability_template
   */
  availability_template?: Template;

  /**
   * Defines a template to get the direction of the fan. Valid value: ‘forward’/‘reverse’
   * https://www.home-assistant.io/integrations/fan.template/#direction_template
   */
  direction_template?: Template;

  /**
   * Name to use in the frontend.
   * https://www.home-assistant.io/integrations/fan.template/#friendly_name
   */
  friendly_name?: string;

  /**
   * Defines a template to get the osc state of the fan. Valid value: true/false
   * https://www.home-assistant.io/integrations/fan.template/#oscillating_template
   */
  oscillating_template?: Template;

  /**
   * Defines a template to get the speed percentage of the fan.
   * https://www.home-assistant.io/integrations/fan.template/#percentage_template
   */
  percentage_template?: Template;

  /**
   * Defines a template to get the preset mode of the fan.
   * https://www.home-assistant.io/integrations/fan.template/#preset_mode_template
   */
  preset_mode_template?: Template;

  /**
   * List of preset modes the fan is capable of. This is an arbitrary list of strings and must not contain any speeds.
   * https://www.home-assistant.io/integrations/fan.template/#preset_modes
   */
  preset_modes?: string[];

  /**
   * Defines an action to run when the fan is given a direction command.
   * https://www.home-assistant.io/integrations/fan.template/#set_direction
   */
  set_direction?: Action | Action[];

  /**
   * Defines an action to run when the fan is given an osc state command.
   * https://www.home-assistant.io/integrations/fan.template/#set_oscillating
   */
  set_oscillating?: Action | Action[];

  /**
   * Defines an action to run when the fan is given a speed percentage command.
   * https://www.home-assistant.io/integrations/fan.template/#set_percentage
   */
  set_percentage?: Action | Action[];

  /**
   * Defines an action to run when the fan is given a preset command.
   * https://www.home-assistant.io/integrations/fan.template/#set_preset_mode
   */
  set_preset_mode?: Action | Action[];

  /**
   * The number of speeds the fan supports. Used to calculate the percentage step for the fan.increase_speed and fan.decrease_speed services.
   * https://www.home-assistant.io/integrations/fan.template/#speed_count
   */
  speed_count?: PositiveInteger;

  /**
   * Defines an action to run when the fan is turned off.
   * https://www.home-assistant.io/integrations/fan.template/#turn_off
   */
  turn_off: Action | Action[];

  /**
   * Defines an action to run when the fan is turned on.
   * https://www.home-assistant.io/integrations/fan.template/#turn_on
   */
  turn_on: Action | Action[];

  /**
   * An ID that uniquely identifies this fan. Set this to an unique value to allow customization trough the UI.
   * https://www.home-assistant.io/integrations/fan.template/#unique_id
   */
  unique_id?: string;

  /**
   * Defines a template to get the state of the fan. Valid value: ‘on’/‘off’
   * https://www.home-assistant.io/integrations/fan.template/#value_template
   */
  value_template: Template;
}

interface LightPlatformItem {
  /**
   * Defines a template to get the available state of the component. If the template returns true, the device is available.
   * https://www.home-assistant.io/integrations/light.template#availability_template
   */
  availability_template?: Template;

  /**
   * Defines a template to get the list of supported effects. Must render a list.
   * https://www.home-assistant.io/integrations/light.template#effect_list_template
   */
  effect_list_template?: Template;

  /**
   * Defines a template to get the currently selected effect.
   * https://www.home-assistant.io/integrations/light.template#effect_template
   */
  effect_template?: Template;

  /**
   * Defines a template for the entity picture of the light.
   * https://www.home-assistant.io/integrations/light.template#entity_picture_template
   */
  entity_picture_template?: Template;

  /**
   * Name to use in the frontend.
   * https://www.home-assistant.io/integrations/light.template#friendly_name
   */
  friendly_name?: string;

  /**
   * Defines a template to get the HS color of the light. Must render a tuple (hue, saturation).
   * https://www.home-assistant.io/integrations/light.template#hs_template
   */
  hs_template?: Template;

  /**
   * Defines a template for an icon or picture, e.g., showing a different icon for different states.
   * https://www.home-assistant.io/integrations/light.template#icon_template
   */
  icon_template?: Template;

  /**
   * Defines a template to get the brightness of the light.
   * https://www.home-assistant.io/integrations/light.template#level_template
   */
  level_template?: Template;

  /**
   * Defines a template to get the max mireds value of the light.
   * https://www.home-assistant.io/integrations/light.template#max_mireds_template
   */
  max_mireds_template?: Template;

  /**
   * Defines a template to get the min mireds value of the light.
   * https://www.home-assistant.io/integrations/light.template#min_mireds_template
   */
  min_mireds_template?: Template;

  /**
   * Defines a template to get the RGB color of the light. Must render a tuple or a list (red, green, blue).
   * https://www.home-assistant.io/integrations/light.template#rgb_template
   */
  rgb_template?: Template;

  /**
   * Defines a template to get the RGBW color of the light. Must render a tuple or a list (red, green, blue, white).
   * https://www.home-assistant.io/integrations/light.template#rgbw_template
   */
  rgbw_template?: Template;

  /**
   * Defines a template to get the RGBWW color of the light. Must render a tuple or a list (red, green, blue, cold white, warm white).
   * https://www.home-assistant.io/integrations/light.template#rgbww_template
   */
  rgbww_template?: Template;

  /**
   * Defines an action to run when the light is given a effect command.
   * https://www.home-assistant.io/integrations/light.template#set_effect
   */
  set_effect?: Action | Action[];

  /**
   * Defines an action to run when the light is given a hs color command. Available variables: `hs` as a tuple, `h` and `s`.
   * https://www.home-assistant.io/integrations/light.template#set_hs
   */
  set_hs?: Action | Action[];

  /**
   * Defines an action to run when the light is given a brightness command.
   * https://www.home-assistant.io/integrations/light.template#set_level
   */
  set_level?: Action | Action[];

  /**
   * Defines an action to run when the light is given an RGB color command. Available variables: `rgb` as a tuple, `r`, `g` and `b`.
   * https://www.home-assistant.io/integrations/light.template#set_rgb
   */
  set_rgb?: Action | Action[];

  /**
   * Defines an action to run when the light is given an RGBW color command. Available variables: `rgbw` as a tuple, `rgb` as a tuple, `r`, `g`, `b` and `w`.
   * https://www.home-assistant.io/integrations/light.template#set_rgbw
   */
  set_rgbw?: Action | Action[];

  /**
   * Defines an action to run when the light is given an RGBWW color command. Available variables: `rgbww` as a tuple, `rgb` as a tuple, `r`, `g`, `b`, `cw` and `ww`.
   * https://www.home-assistant.io/integrations/light.template#set_rgbww
   */
  set_rgbww?: Action | Action[];

  /**
   * Defines an action to run when the light is given a color temperature command.
   * https://www.home-assistant.io/integrations/light.template#set_temperature
   */
  set_temperature?: Action | Action[];

  /**
   * Defines a template to get if light supports transition.
   * https://www.home-assistant.io/integrations/light.template#supports_transition_template
   */
  supports_transition_template?: Template;

  /**
   * Defines a template to get the color temperature of the light.
   * https://www.home-assistant.io/integrations/light.template#temperature_template
   */
  temperature_template?: Template;

  /**
   * Defines an action to run when the light is turned off.
   * https://www.home-assistant.io/integrations/light.template#turn_off
   */
  turn_off: Action | Action[];

  /**
   * Defines an action to run when the light is turned on.
   * https://www.home-assistant.io/integrations/light.template#turn_on
   */
  turn_on: Action | Action[];

  /**
   * An ID that uniquely identifies this light. Set this to an unique value to allow customisation trough the UI.
   * https://www.home-assistant.io/integrations/light.template#unique_id
   */
  unique_id?: string;

  /**
   * Defines a template to get the state of the light.
   * https://www.home-assistant.io/integrations/light.template#value_template
   */
  value_template?: Template;
}

interface SensorPlatformItem {
  /**
   * Defines templates for attributes of the sensor.
   * https://www.home-assistant.io/integrations/template#attribute_templates
   */
  attribute_templates?: { [key: string]: Template };

  /**
   * Defines a template to get the available state of the sensor. Return true if the device is available, false otherwise.
   * https://www.home-assistant.io/integrations/template#availability_template
   */
  availability_template?: Template;

  /**
   * Sets the class of the device, changing the device state and icon that is displayed on the frontend.
   * https://www.home-assistant.io/integrations/template#device_class
   */
  device_class?: DeviceClassesSensor;

  /**
   * Defines a template for the entity picture of the sensor.
   * https://www.home-assistant.io/integrations/binary_sensor.template#entity_picture_template
   */
  entity_picture_template?: Template;

  /**
   * Name to use in the frontend.
   * https://www.home-assistant.io/integrations/binary_sensor.template#friendly_name
   */
  friendly_name?: string;

  /**
   * Defines a template for the name to be used in the frontend (this overrides friendly_name).
   * https://www.home-assistant.io/integrations/binary_sensor.template#friendly_name
   */
  friendly_name_template?: Template;

  /**
   * Defines a template for the icon of the sensor.
   * https://www.home-assistant.io/integrations/binary_sensor.template#icon_template
   */
  icon_template?: Template;

  /**
   * The State Class of the sensor.
   * https://www.home-assistant.io/integrations/binary_sensor.template#state_class
   */
  state_class?: StateClassesSensor;

  /**
   * Defines the units of measurement of the sensor, if any. This will also influence the graphical presentation in the history visualization as a continuous value.
   * https://www.home-assistant.io/integrations/binary_sensor.template#unique_id
   */
  unit_of_measurement?: string;

  /**
   * An ID that uniquely identifies this binary sensor. Set this to an unique value to allow customization through the UI.
   * https://www.home-assistant.io/integrations/template#unique_id
   */
  unique_id?: string;

  /**
   * Defines a template to get the state of the sensor.
   * https://www.home-assistant.io/integrations/template#value_template
   */
  value_template: Template;
}

interface SwitchPlatformItem {
  /**
   * Defines a template to get the available state of the component. If the template returns true, the device is available.
   * https://www.home-assistant.io/integrations/switch.template#availability_template
   */
  availability_template?: Template;

  /**
   * Defines a template for the picture of the switch.
   * https://www.home-assistant.io/integrations/switch.template#entity_picture_template
   */
  entity_picture_template?: Template;

  /**
   * Name to use in the frontend.
   * https://www.home-assistant.io/integrations/switch.template#friendly_name
   */
  friendly_name?: string;

  /**
   * Defines a template for the icon of the switch.
   * https://www.home-assistant.io/integrations/switch.template#icon_template
   */
  icon_template?: Template;

  /**
   * Defines an action to run when the switch is turned off.
   * https://www.home-assistant.io/integrations/switch.template#turn_off
   */
  turn_off: Action | Action[];

  /**
   * Defines an action to run when the switch is turned on.
   * https://www.home-assistant.io/integrations/switch.template#turn_on
   */
  turn_on: Action | Action[];

  /**
   * An ID that uniquely identifies this switch. Set this to an unique value to allow customization trough the UI.
   * https://www.home-assistant.io/integrations/switch.template#unique_id
   */
  unique_id?: string;

  /**
   * Defines a template to set the state of the switch. If not defined, the switch will optimistically assume all commands are successful.
   * https://www.home-assistant.io/integrations/switch.template#value_template
   */
  value_template?: Template;
}

interface VacuumPlatformItem {
  /**
   * Defines templates for attributes of the sensor.
   * https://www.home-assistant.io/integrations/vacuum.template#attribute_templates
   */
  attribute_templates?: { [key: string]: Template };

  /**
   * Defines a template to get the available state of the component. If the template returns true, the device is available.
   * https://www.home-assistant.io/integrations/vacuum.template#availability_template
   */
  availability_template?: Template;

  /**
   * Defines a template to get the battery level of the vacuum. Legal values are numbers between 0 and 100.
   * https://www.home-assistant.io/integrations/vacuum.template#battery_level_template
   */
  battery_level_template?: Template;

  /**
   * Defines an action to run when the vacuum is given a clean spot command.
   * https://www.home-assistant.io/integrations/vacuum.template#clean_spot
   */
  clean_spot?: Action | Action[];

  /**
   * Defines a template to get the fan speed of the vacuum.
   * https://www.home-assistant.io/integrations/vacuum.template#fan_speed_template
   */
  fan_speed_template?: Template;

  /**
   * List of fan speeds supported by the vacuum.
   * https://www.home-assistant.io/integrations/vacuum.template#fan_speeds
   */
  fan_speeds?: string[];

  /**
   * Name to use in the frontend.
   * https://www.home-assistant.io/integrations/vacuum.template#friendly_name
   */
  friendly_name?: string;

  /**
   * Defines an action to run when the vacuum is given a locate command.
   * https://www.home-assistant.io/integrations/vacuum.template#locate
   */
  locate?: Action | Action[];

  /**
   * Defines an action to run when the vacuum is paused.
   * https://www.home-assistant.io/integrations/vacuum.template#pause
   */
  pause?: Action | Action[];

  /**
   * Defines an action to run when the vacuum is given a return to base command.
   * https://www.home-assistant.io/integrations/vacuum.template#return_to_base
   */
  return_to_base?: Action | Action[];

  /**
   * Defines an action to run when the vacuum is given a command to set the fan speed.
   * https://www.home-assistant.io/integrations/vacuum.template#set_fan_speed
   */
  set_fan_speed?: Action | Action[];

  /**
   * Defines an action to run when the vacuum is started.
   * https://www.home-assistant.io/integrations/vacuum.template#start
   */
  start: Action | Action[];

  /**
   * Defines an action to run when the vacuum is stopped.
   * https://www.home-assistant.io/integrations/vacuum.template#stop
   */
  stop?: Action | Action[];

  /**
   * An ID that uniquely identifies this vacuum. Set this to an unique value to allow customization trough the UI.
   * https://www.home-assistant.io/integrations/vacuum.template#unique_id
   */
  unique_id?: string;

  /**
   * Defines a template to get the state of the vacuum. Valid value: docked/cleaning/idle/paused/returning/error.
   * https://www.home-assistant.io/integrations/vacuum.template#value_template
   */
  value_template?: Template;
}