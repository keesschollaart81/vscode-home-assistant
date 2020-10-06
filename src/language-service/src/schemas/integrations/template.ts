/**
 * Template integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/template/
 */
import {
  Deprecated,
  DeviceClassesBinarySensor,
  DeviceClassesSensor,
  DeviceClassesCover,
  IncludeList,
  IncludeNamed,
  Template,
  TimePeriod,
} from "../types";
import { Action } from "../actions";
import { PlatformSchema } from "../platform";

export type Domain = "template";

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
    [key: string]: AlarmControlPanelItem | IncludeNamed;
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
    [key: string]: BinarySensorItem | IncludeNamed;
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
    [key: string]: CoverItem | IncludeNamed;
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
    [key: string]: FanItem | IncludeNamed;
  };
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
    [key: string]: SensorItem | IncludeNamed;
  };
}

interface AlarmControlPanelItem {
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

interface BinarySensorItem {
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
   * DEPRECATED as of Home Assistant 0.115.0
   */
  entity_id?: Deprecated;

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

interface CoverItem {
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

interface FanItem {
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
   * Defines an action to run when the fan is given a speed command.
   * https://www.home-assistant.io/integrations/fan.template/#set_speed
   */
  set_speed?: Action | Action[];

  /**
   * Defines a template to get the speed of the fan.
   * https://www.home-assistant.io/integrations/fan.template/#speed_template
   */
  speed_template?: Template;

  /**
   * List of speeds the fan is capable of running at.
   * https://www.home-assistant.io/integrations/fan.template/#speeds
   */
  speeds: string[];

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

interface SensorItem {
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
   * DEPRECATED as of Home Assistant 0.115.0
   */
  entity_id?: Deprecated;

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
