/**
 * KNX integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/knx/__init__.py
 */
import {
  DeviceClassesBinarySensor,
  DeviceClassesCover,
  DeviceClassesSensor,
  DeviceClassesSwitch,
  Entity,
  EntityCategory,
  Integer,
  StateClassesSensor,
} from "../../types";

/**
 * @TJS-pattern ^(\d{1,2}(\/\d{1,2})?\/\d{1,4}|\d{1,5}|i-.+)$
 */
type GroupAddress = string;

/**
 * @TJS-pattern ^(\d{1,2}(\/\d{1,2})?\/\d{1,4}|\d{1,5}|i-.+)$
 * @items.pattern ^(\d{1,2}(\/\d{1,2})?\/\d{1,4}|\d{1,5}|i-.+)$
 */
type GroupAddresses = string[] | string;

type ValueType =
  | "1byte_signed"
  | "1byte_unsigned"
  | "2byte_float"
  | "2byte_signed"
  | "2byte_unsigned"
  | "4byte_float"
  | "4byte_signed"
  | "4byte_unsigned"
  | "absolute_temperature"
  | "acceleration_angular"
  | "acceleration"
  | "activation_energy"
  | "active_energy_kwh"
  | "active_energy"
  | "activity"
  | "amplitude"
  | "angle_deg"
  | "angle_rad"
  | "angle"
  | "angular_frequency"
  | "angular_momentum"
  | "angular_velocity"
  | "apparant_energy_kvah"
  | "apparant_energy"
  | "area"
  | "brightness"
  | "capacitance"
  | "charge_density_surface"
  | "charge_density_volume"
  | "color_temperature"
  | "common_temperature"
  | "compressibility"
  | "conductance"
  | "counter_pulses"
  | "curr"
  | "current"
  | "decimal_factor"
  | "delta_time_100ms"
  | "delta_time_10ms"
  | "delta_time_hrs"
  | "delta_time_min"
  | "delta_time_ms"
  | "delta_time_sec"
  | "density"
  | "electric_charge"
  | "electric_current_density"
  | "electric_current"
  | "electric_dipole_moment"
  | "electric_displacement"
  | "electric_field_strength"
  | "electric_flux_density"
  | "electric_flux"
  | "electric_polarization"
  | "electric_potential_difference"
  | "electric_potential"
  | "electrical_conductivity"
  | "electromagnetic_moment"
  | "electromotive_force"
  | "energy"
  | "enthalpy"
  | "flow_rate_m3h"
  | "force"
  | "frequency"
  | "heat_quantity"
  | "heatcapacity"
  | "heatflowrate"
  | "humidity"
  | "illuminance"
  | "impedance"
  | "kelvin_per_percent"
  | "latin_1"
  | "length_mm"
  | "length"
  | "light_quantity"
  | "long_delta_timesec"
  | "luminance"
  | "luminous_flux"
  | "luminous_intensity"
  | "magnetic_field_strength"
  | "magnetic_flux_density"
  | "magnetic_flux"
  | "magnetic_moment"
  | "magnetic_polarization"
  | "magnetization"
  | "magnetomotive_force"
  | "mass_flux"
  | "mass"
  | "mol"
  | "momentum"
  | "percent"
  | "percentU8"
  | "percentV16"
  | "percentV8"
  | "phaseangledeg"
  | "phaseanglerad"
  | "power_2byte"
  | "power_density"
  | "power"
  | "powerfactor"
  | "ppm"
  | "pressure_2byte"
  | "pressure"
  | "pulse_2byte_signed"
  | "pulse_2byte"
  | "pulse_4byte"
  | "pulse"
  | "rain_amount"
  | "reactance"
  | "reactive_energy_kvarh"
  | "reactive_energy"
  | "resistance"
  | "resistivity"
  | "rotation_angle"
  | "scene_number"
  | "self_inductance"
  | "solid_angle"
  | "sound_intensity"
  | "speed"
  | "stress"
  | "string"
  | "surface_tension"
  | "tariff"
  | "temperature_a"
  | "temperature_difference_2byte"
  | "temperature_difference"
  | "temperature_f"
  | "temperature"
  | "thermal_capacity"
  | "thermal_conductivity"
  | "thermoelectric_power"
  | "time_1"
  | "time_2"
  | "time_period_100msec"
  | "time_period_10msec"
  | "time_period_hrs"
  | "time_period_min"
  | "time_period_msec"
  | "time_period_sec"
  | "time_seconds"
  | "torque"
  | "voltage"
  | "volume_flow"
  | "volume_flux"
  | "volume_liquid_litre"
  | "volume_m3"
  | "volume"
  | "weight"
  | "wind_speed_kmh"
  | "wind_speed_ms"
  | "work";

export type Domain = "knx";
export interface Schema {
  /**
   * The KNX binary sensor platform allows you to monitor KNX binary sensors.
   * https://www.home-assistant.io/integrations/knx#binary-sensor
   */
  binary_sensor?: BinarySensor[];

  /**
   * The KNX binary sensor platform allows you to monitor KNX binary sensors.
   * https://www.home-assistant.io/integrations/knx/#button
   */
  button?: Button[];

  /**
   * The KNX climate platform is used as an interface to KNX thermostats and room controllers.
   * https://www.home-assistant.io/integrations/knx#binary-sensor
   */
  climate?: Climate[];

  /**
   * The KNX cover platform is used as an interface to KNX covers.
   * https://www.home-assistant.io/integrations/knx#cover
   */
  cover?: Cover[];

  /**
   * Defines lists of patterns for filtering KNX group addresses. Telegrams with destination addresses matching this pattern are sent to the Home Assistant event bus as knx_event.
   * https://www.home-assistant.io/integrations/knx/#events
   */
  event?: Event[];

  /**
   * KNX integration is able to expose entity states or attributes to KNX bus.
   * https://www.home-assistant.io/integrations/knx#exposing-entity-states-entity-attributes-or-time-to-knx-bus
   */
  expose?: (ExposeTime | ExposeSensor)[];

  /**
   * The KNX fan integration is used to control KNX fans.
   * https://www.home-assistant.io/integrations/knx#fan
   */
  fan?: Fan[];

  /**
   * The KNX light integration is used as an interface to control KNX actuators for lighting applications.
   * https://www.home-assistant.io/integrations/knx#light
   */
  light?: Light[];

  /**
   * The KNX notify platform allows you to send notifications to KNX devices as DPT16 strings.
   * https://www.home-assistant.io/integrations/knx#notify
   */
  notify?: Notify[];

  /**
   * The KNX number platform allows to send generic numeric values to the KNX bus and update its state from received telegrams.
   * https://www.home-assistant.io/integrations/knx#number
   */
  number?: NumberEntity[];

  /**
   * The KNX scenes platform allows you to trigger KNX scenes.
   * https://www.home-assistant.io/integrations/knx#scene
   */
  scene?: Scene[];

  /**
   * The KNX select platform allows the user to define a list of values that can be selected via the frontend and can be used within conditions of automation.
   * https://www.home-assistant.io/integrations/knx#select
   */
  select?: Select[];

  /**
   * The KNX sensor platform allows you to monitor KNX sensors.
   * https://www.home-assistant.io/integrations/knx#sensor
   */
  sensor?: Sensor[];

  /**
   * The KNX switch platform is used as an interface to switching actuators.
   * https://www.home-assistant.io/integrations/knx#switch
   */
  switch?: Switch[];

  /**
   * The KNX text platform is used as an interface for sending text.
   * https://www.home-assistant.io/integrations/knx#text
   */
  text?: TextEntity[];

  /**
   * The KNX weather platform is used as an interface to KNX weather stations.
   * https://www.home-assistant.io/integrations/knx#weather
   */
  weather?: Weather[];
}

interface BinarySensor {
  /**
   * The time in seconds between multiple identical telegram payloads would count towards the internal counter that is used for automations.
   * https://www.home-assistant.io/integrations/knx#context_timeout
   *
   * @minimum 1
   * @maximum 100
   */
  context_timeout?: number;

  /**
   * Sets the class of the device, changing the device state and icon that is displayed on the frontend.
   * https://www.home-assistant.io/integrations/knx#device_class
   */
  device_class?: DeviceClassesBinarySensor;

  /**
   * Specifies if telegrams should ignore the internal state and always trigger a Home Assistant state update.
   * https://www.home-assistant.io/integrations/knx#ignore_internal_state
   */
  ignore_internal_state?: boolean;

  /**
   * Invert the telegrams payload before processing. This is applied before context_timeout or reset_after is evaluated.
   * https://www.home-assistant.io/integrations/knx#invert
   */
  invert?: boolean;

  /**
   * A name for this device used within Home Assistant.
   * https://www.home-assistant.io/integrations/knx#name
   */
  name?: string;

  /**
   * Reset back to “off” state after specified seconds.
   * https://www.home-assistant.io/integrations/knx#reset_after
   */
  reset_after?: number;

  /**
   * KNX group address of the binary sensor.
   * https://www.home-assistant.io/integrations/knx#state_address
   */
  state_address: GroupAddresses;

  /**
   * Actively read the value from the bus.
   * https://www.home-assistant.io/integrations/knx#sync_state
   */
  sync_state?: boolean | number | string;
}

interface Button {
  /**
   * Group address to send to.
   * https://www.home-assistant.io/integrations/knx#address
   */
  address: GroupAddress;

  /**
   * The category of the entity.
   * https://www.home-assistant.io/integrations/knx#entity_category
   */
  entity_category?: EntityCategory;

  /**
   * A name for this device used within Home Assistant.
   * https://www.home-assistant.io/integrations/knx#name
   */
  name?: string;

  /**
   * The raw payload to be sent. Defaults to `1`
   * https://www.home-assistant.io/integrations/knx#payload
   */
  payload?: Integer;

  /**
   * The length of the payload expected for the DPT. Use `0` for DPT 1, 2 or 3. Defaults to `0`. When `payload_length` is used `value` shall not be set.
   * https://www.home-assistant.io/integrations/knx#payload_length
   */
  payload_length?: Integer;

  /**
   * The value to be sent.
   * https://www.home-assistant.io/integrations/knx#payload
   */
  value?: Integer;

  /**
   * A type from the value types to decode the value. Requires `value` to be set.
   * https://www.home-assistant.io/integrations/knx/#value-types
   */
  type?: ValueType;
}

interface Climate {
  /**
   * KNX address for reading current activity. `0` is idle, `1` is active. DPT 1
   * https://www.home-assistant.io/integrations/knx#active_state_addres
   */
  active_state_address?: GroupAddresses;

  /**
   * KNX address for reading current command value in percent. `0` sets the climate entity to idle if `active_state_address` is not set. DPT 5.001
   * https://www.home-assistant.io/integrations/knx#command_value_state_address
   */
  command_value_state_address?: GroupAddresses;

  /**
   * KNX address for setting HVAC controller modes. DPT 20.105
   * https://www.home-assistant.io/integrations/knx#controller_mode_address
   */
  controller_mode_address?: GroupAddress;

  /**
   * KNX address for reading HVAC control mode. DPT 20.105
   * https://www.home-assistant.io/integrations/knx#controller_mode_state_address
   */
  controller_mode_state_address?: GroupAddresses;

  /**
   * Overrides the supported controller modes.
   * https://www.home-assistant.io/integrations/knx#controller_modes
   */
  controller_modes?: ("Off" | "Auto" | "Heat" | "Cool" | "Fan only" | "Dry")[];

  /**
   * KNX address for HVAC controller status (in accordance with KNX AN 097/07 rev 3).
   * https://www.home-assistant.io/integrations/knx#controller_status_address
   */
  controller_status_address?: GroupAddresses;

  /**
   * KNX address for reading HVAC controller status.
   * https://www.home-assistant.io/integrations/knx#controller_status_state_address
   */
  controller_status_state_address?: GroupAddresses;

  /**
   * Overrides the default controller mode. Any Home Assistant hvac_mode can be configured. This can, for example, be set to “cool” for cooling-only devices.
   * https://www.home-assistant.io/integrations/knx#climate
   */
  default_controller_mode?:
    | "off"
    | "auto"
    | "heat"
    | "cool"
    | "heat_cool"
    | "fan_only"
    | "dry";

  /**
   * The category of the entity.
   * https://www.home-assistant.io/integrations/knx#entity_category
   */
  entity_category?: EntityCategory;

  /**
   * KNX address for switching between heat/cool mode. DPT 1.100
   * https://www.home-assistant.io/integrations/knx#heat_cool_address
   */
  heat_cool_address?: GroupAddresses;

  /**
   * KNX address for reading heat/cool mode. DPT 1.100
   * https://www.home-assistant.io/integrations/knx#heat_cool_state_address
   */
  heat_cool_state_address?: GroupAddresses;

  /**
   * Override the minimum temperature.
   * https://www.home-assistant.io/integrations/knx#max_temp
   */
  max_temp?: number;

  /**
   * Override the minimum temperature.
   * https://www.home-assistant.io/integrations/knx#min_temp
   */
  min_temp?: number;

  /**
   * A name for this device used within Home Assistant.
   * https://www.home-assistant.io/integrations/knx#name
   */
  name?: string;

  /**
   * KNX address for switching the climate device on/off. DPT 1
   * https://www.home-assistant.io/integrations/knx#on_off_address
   */
  on_off_address?: GroupAddresses;

  /**
   * Value for switching the climate device on/off is inverted.
   * https://www.home-assistant.io/integrations/knx#on_off_invert
   */
  on_off_invert?: boolean;

  /**
   * KNX address for gathering the current state (on/off) of the climate device. DPT 1
   * https://www.home-assistant.io/integrations/knx#on_off_state_address
   */
  on_off_state_address?: GroupAddresses;

  /**
   * KNX address for setting operation mode (Frost protection/night/comfort). DPT 20.102
   * https://www.home-assistant.io/integrations/knx#operation_mode_address
   */
  operation_mode_address?: GroupAddresses;

  /**
   * KNX address for switching on/off comfort mode. DPT 1
   * https://www.home-assistant.io/integrations/knx#operation_mode_comfort_address
   */
  operation_mode_comfort_address?: GroupAddresses;

  /**
   * KNX address for switching on/off frost/heat protection mode. DPT 1
   * https://www.home-assistant.io/integrations/knx#operation_mode_frost_protection_address
   */
  operation_mode_frost_protection_address?: GroupAddresses;

  /**
   * KNX address for switching on/off night mode. DPT 1
   * https://www.home-assistant.io/integrations/knx#operation_mode_night_address
   */
  operation_mode_night_address?: GroupAddresses;

  /**
   * KNX address for switching on/off standby mode. DPT 1
   * https://www.home-assistant.io/integrations/knx#operation_mode_standby_address
   */
  operation_mode_standby_address?: GroupAddresses;

  /**
   * KNX address for reading operation mode. DPT 20.102
   * https://www.home-assistant.io/integrations/knx#operation_mode_state_address
   */
  operation_mode_state_address?: GroupAddresses;

  /**
   * Overrides the supported operation modes.
   * https://www.home-assistant.io/integrations/knx#operation_modes
   */
  operation_modes?: ("Auto" | "Comfort" | "Standby" | "Night" | "Frost")[];

  /**
   * KNX address for setpoint_shift. DPT 6.010 or DPT 9.002 based on setpoint_shift_mode
   * https://www.home-assistant.io/integrations/knx#setpoint_shift_address
   */
  setpoint_shift_address?: GroupAddresses;

  /**
   * Maximum value of setpoint shift.
   * https://www.home-assistant.io/integrations/knx#setpoint_shift_max
   *
   * @TJS-type integer
   * @minimum 0
   * @maximum 32
   */
  setpoint_shift_max?: number;

  /**
   * Minimum value of setpoint shift.
   * https://www.home-assistant.io/integrations/knx#setpoint_shift_min
   *
   * @TJS-type integer
   * @minimum -32
   * @maximum 0
   */
  setpoint_shift_min?: number;

  /**
   * Defines the internal device DPT used. Either ‘DPT6010’ or ‘DPT9002’.
   * https://www.home-assistant.io/integrations/knx#setpoint_shift_mode
   */
  setpoint_shift_mode?: "DPT6010" | "DPT9002";

  /**
   * KNX address for reading setpoint_shift. DPT 6.010 or DPT 9.002 based on setpoint_shift_mode
   * https://www.home-assistant.io/integrations/knx#setpoint_shift_state_address
   */
  setpoint_shift_state_address?: GroupAddresses;

  /**
   * KNX group address for setting target temperature. DPT 9.001
   * https://www.home-assistant.io/integrations/knx#target_temperature_address
   */
  target_temperature_address?: GroupAddresses;

  /**
   * KNX group address for reading current target temperature from KNX bus. DPT 9.001
   * https://www.home-assistant.io/integrations/knx#target_temperature_state_address
   */
  target_temperature_state_address: GroupAddresses;

  /**
   * KNX group address for reading current room temperature from KNX bus. DPT 9.001
   * https://www.home-assistant.io/integrations/knx#temperature_address
   */
  temperature_address: GroupAddresses;

  /**
   * Defines the step size in Kelvin for each step of setpoint_shift.
   * https://www.home-assistant.io/integrations/knx#temperature_step
   *
   * @minimum 0
   * @maximum 2
   */
  temperature_step?: number;
}

interface Cover {
  /**
   * KNX group address for tilting the cover to the dedicated angle. DPT 5.001
   * https://www.home-assistant.io/integrations/knx#angle_address
   */
  angle_address?: GroupAddresses;

  /**
   * Separate KNX group address for requesting the current tilt angle of the cover. DPT 5.001
   * https://www.home-assistant.io/integrations/knx#angle_state_address
   */
  angle_state_address?: GroupAddresses;

  /**
   * Sets the class of the device, changing the device state and icon that is displayed on the frontend.
   * https://www.home-assistant.io/integrations/knx#device_class
   */
  device_class?: DeviceClassesCover;

  /**
   * The category of the entity.
   * https://www.home-assistant.io/integrations/knx#entity_category
   */
  entity_category?: EntityCategory;

  /**
   * Set this to true if your actuator reports fully closed tilt as 0% in KNX.
   * https://www.home-assistant.io/integrations/knx#invert_angle
   */
  invert_angle?: boolean;

  /**
   * Set this to true if your actuator reports fully closed position as 0% in KNX.
   * https://www.home-assistant.io/integrations/knx#invert_position
   */
  invert_position?: boolean;

  /**
   * Set this to true to invert the binary up/down commands from/to your KNX actuator.
   * https://www.home-assistant.io/integrations/knx#invert_updown
   */
  invert_updown?: boolean;

  /**
   * KNX group address for moving the cover full up or down. DPT 1
   * https://www.home-assistant.io/integrations/knx#move_long_address
   */
  move_long_address?: GroupAddresses;

  /**
   * KNX group address for moving the cover stepwise up or down. DPT 1
   * https://www.home-assistant.io/integrations/knx#move_short_address
   */
  move_short_address?: GroupAddresses;

  /**
   * A name for this device used within Home Assistant.
   * https://www.home-assistant.io/integrations/knx#name
   */
  name?: string;

  /**
   * KNX group address for moving the cover to the dedicated position. DPT 5.001
   * https://www.home-assistant.io/integrations/knx#position_address
   */
  position_address?: GroupAddresses;

  /**
   * Separate KNX group address for requesting the current position of the cover. DPT 5.001
   * https://www.home-assistant.io/integrations/knx#position_state_address
   */
  position_state_address?: GroupAddresses;

  /**
   * KNX group address for stopping the current movement of the cover. DPT 1
   * https://www.home-assistant.io/integrations/knx#stop_address
   */
  stop_address?: GroupAddresses;

  /**
   * Time cover needs to travel down in seconds. Needed to calculate the intermediate positions of cover while traveling.
   * https://www.home-assistant.io/integrations/knx#travelling_time_down
   *
   * @minimum 0
   */
  travelling_time_down?: number;

  /**
   * Time cover needs to travel up in seconds. Needed to calculate the intermediate positions of cover while traveling.
   * https://www.home-assistant.io/integrations/knx#travelling_time_up
   *
   * @minimum 0
   */
  travelling_time_up?: number;
}

interface Event {
  /**
   * KNX group address to fire events.
   * https://www.home-assistant.io/integrations/knx#state_address
   */
  address: GroupAddresses;

  /**
   * A type from the value types. The decoded value will be written to the event data `value` key.
   * https://www.home-assistant.io/integrations/knx/#value-types
   */
  type?: ValueType;
}

interface ExposeTime {
  /**
   * Group address state or attribute updates will be sent to. GroupValueRead requests will be answered.
   * https://www.home-assistant.io/integrations/knx#address
   */
  address: GroupAddress;

  /**
   * Either time, date or datetime.
   * https://www.home-assistant.io/integrations/knx/#value-types
   */
  type: "time" | "date" | "datetime";
}

interface ExposeSensor {
  /**
   * Group address state or attribute updates will be sent to. GroupValueRead requests will be answered.
   * https://www.home-assistant.io/integrations/knx#address
   */
  address: GroupAddresses;

  /**
   * Attribute of the entity that shall be sent to the KNX bus. If not set (or None) the state will be sent.
   * https://www.home-assistant.io/integrations/knx#attribute
   */
  attribute?: string;

  /**
   * Minimum time in seconds between two sent telegrams.
   * https://www.home-assistant.io/integrations/knx#cooldown
   *
   * @minimum 0
   */
  cooldown?: number;

  /**
   * Default value to send to the bus if the state or attribute value is None.
   * https://www.home-assistant.io/integrations/knx#default
   */
  default?: boolean | string | number;

  /**
   * Entity ID to be exposed.
   * https://www.home-assistant.io/integrations/knx#entity_id
   */
  entity_id: Entity;

  /**
   * Respond to GroupValueRead telegrams received to the configured `address`.
   * https://www.home-assistant.io/integrations/knx#respond_to_read
   */
  respond_to_read?: boolean;

  /**
   * Type of the exposed value.
   * https://www.home-assistant.io/integrations/knx/#value-types
   */
  type: ValueType | "binary" | "time" | "date" | "datetime";
}

interface Fan {
  /**
   * KNX group address for setting the percentage or step of the fan. DPT 5.001 or DPT 5.010
   * https://www.home-assistant.io/integrations/knx#address
   */
  address: GroupAddresses;

  /**
   * The category of the entity.
   * https://www.home-assistant.io/integrations/knx#entity_category
   */
  entity_category?: EntityCategory;

  /**
   * The maximum amount of steps for a step-controlled fan. If set, the integration will convert percentages to steps automatically.
   * https://www.home-assistant.io/integrations/knx#max_step
   *
   * @TJS-type integer
   * @minimum 0
   * @maximum 255
   */
  max_step?: number;

  /**
   * A name for this device used within Home Assistant.
   * https://www.home-assistant.io/integrations/knx#name
   */
  name?: string;

  /**
   * KNX group address for switching the fan oscillation on or off. DPT 1
   * https://www.home-assistant.io/integrations/knx#oscillation_address
   */
  oscillation_address?: GroupAddresses;

  /**
   * KNX group address for retrieving the state of the fan oscillation. DPT 1
   * https://www.home-assistant.io/integrations/knx#oscillation_stat_address
   */
  oscillation_stat_address?: GroupAddresses;

  /**
   * KNX group address for retrieving the percentage or step of the fan. DPT 5.001 or DPT 5.010
   * https://www.home-assistant.io/integrations/knx#state_address
   */
  state_address?: GroupAddresses;
}

interface LightColor {
  /**
   * KNX group address to switch this color component. DPT 1.001
   * https://www.home-assistant.io/integrations/knx#address
   */
  address?: GroupAddresses;

  /**
   * KNX group address for the state of this color component. DPT 1.001
   * https://www.home-assistant.io/integrations/knx#state_address
   */
  state_address?: GroupAddresses;

  /**
   * KNX group address to set the brightness of this color component. DPT 5.001
   * https://www.home-assistant.io/integrations/knx#brightness_address
   */
  brightness_address: GroupAddresses;

  /**
   * KNX group address for the current brightness of this color component. DPT 5.001
   * https://www.home-assistant.io/integrations/knx#brightness_state_address
   */
  brightness_state_address?: GroupAddresses;
}

interface Light {
  /**
   * KNX group address for switching the light on and off. DPT 1.001
   * https://www.home-assistant.io/integrations/knx#address
   */
  address?: GroupAddresses;

  /**
   * KNX group address for setting the brightness of the light in percent (absolute dimming). DPT 5.001
   * https://www.home-assistant.io/integrations/knx#brightness_address
   */
  brightness_address?: GroupAddresses;

  /**
   * KNX group address for retrieving the brightness of the light in percent. DPT 5.001
   * https://www.home-assistant.io/integrations/knx#brightness_state_address
   */
  brightness_state_address?: GroupAddresses;

  /**
   * KNX group address for setting the RGB color of the light. DPT 232.600
   * https://www.home-assistant.io/integrations/knx#color_address
   */
  color_address?: GroupAddresses;

  /**
   * KNX group address for retrieving the RGB color of the light. DPT 232.600
   * https://www.home-assistant.io/integrations/knx#color_state_address
   */
  color_state_address?: GroupAddresses;

  /**
   * KNX group address for setting the color temperature of the light. DPT 5.001 or 7.600 based on color_temperature_mode
   * https://www.home-assistant.io/integrations/knx#color_temperature_address
   */
  color_temperature_address?: GroupAddresses;

  /**
   * Color temperature group address data type. absolute color temperature in Kelvin. color_temperature_address -> DPT 7.600. relative color temperature in percent cold white (0% warmest; 100% coldest). color_temperature_address -> DPT 5.001
   * https://www.home-assistant.io/integrations/knx#color_temperature_mode
   */
  color_temperature_mode?: "absolute" | "relative";

  /**
   * KNX group address for retrieving the color temperature of the light. DPT 5.001 or 7.600 based on color_temperature_mode
   * https://www.home-assistant.io/integrations/knx#color_temperature_state_address
   */
  color_temperature_state_address?: GroupAddresses;

  /**
   * The category of the entity.
   * https://www.home-assistant.io/integrations/knx#entity_category
   */
  entity_category?: EntityCategory;

  /**
   * KNX group address for setting the hue of the light color in degrees. DPT 5.003
   * https://www.home-assistant.io/integrations/knx#hue_address
   */
  hue_address?: GroupAddresses;

  /**
   * KNX group address for retrieving the hue of the light color in degrees. DPT 5.003
   * https://www.home-assistant.io/integrations/knx#hue_state_address
   */
  hue_state_address?: GroupAddresses;

  /**
   * Used when the actuator only supports individual group addresses for colors. When address is specified for all 3 (or 4) individual colors the root address key can be omitted.
   * https://www.home-assistant.io/integrations/knx#individual_colors
   */
  individual_colors?: {
    /**
     * Group addresses for the blue component.
     * https://www.home-assistant.io/integrations/knx#blue
     */
    blue: LightColor;

    /**
     * Group addresses for the green component.
     * https://www.home-assistant.io/integrations/knx#green
     */
    green: LightColor;

    /**
     * Group addresses for the red component.
     * https://www.home-assistant.io/integrations/knx#red
     */
    red: LightColor;

    /**
     * Group addresses for the white component.
     * https://www.home-assistant.io/integrations/knx#white
     */
    white?: Light;
  };

  /**
   * Warmest possible color temperature in Kelvin. Used in combination with color_temperature_address.
   * https://www.home-assistant.io/integrations/knx#max_kelvin
   *
   * @TJS-type integer
   * @minimum 1
   */
  max_kelvin?: number;

  /**
   * Coldest possible color temperature in Kelvin. Used in combination with color_temperature_address.
   * https://www.home-assistant.io/integrations/knx#min_kelvin
   *
   * @TJS-type integer
   * @minimum 1
   */
  min_kelvin?: number; // int, min 1

  /**
   * A name for this device used within Home Assistant.
   * https://www.home-assistant.io/integrations/knx#name
   */
  name?: string;

  /**
   * KNX group address for setting the RGBW color of the light. DPT 251.600
   * https://www.home-assistant.io/integrations/knx#rgbw_address
   */
  rgbw_address?: GroupAddresses;

  /**
   * KNX group address for retrieving the RGBW color of the light. DPT 251.600
   * https://www.home-assistant.io/integrations/knx#rgbw_state_address
   */
  rgbw_state_address?: GroupAddresses;

  /**
   * KNX group address for setting the saturation of the light color in percent. DPT 5.001
   * https://www.home-assistant.io/integrations/knx#saturation_address
   */
  saturation_address?: GroupAddresses;

  /**
   * KNX group address for retrieving the saturation of the light color in percent. DPT 5.001
   * https://www.home-assistant.io/integrations/knx#saturation_state_address
   */
  saturation_state_address?: GroupAddresses;

  /**
   * KNX group address for retrieving the switch state of the light. DPT 1.001
   * https://www.home-assistant.io/integrations/knx#state_address
   */
  state_address?: GroupAddresses;

  /**
   * KNX group address for setting the xyY color of the light. DPT 242.600
   * https://www.home-assistant.io/integrations/knx#xyy_address
   */
  xyy_address?: GroupAddresses;

  /**
   * KNX group address for retrieving the xyY color of the light. DPT 242.600
   * https://www.home-assistant.io/integrations/knx#xyy_state_address
   */
  xyy_state_address?: GroupAddresses;
}

interface Notify {
  /**
   * KNX group address of the notification. DPT 16.000
   * https://www.home-assistant.io/integrations/knx#address
   */
  address: GroupAddress;

  /**
   * A name for this device used within Home Assistant.
   * https://www.home-assistant.io/integrations/knx#name
   */
  name?: string;

  /**
   * Any supported type of KNX Sensor representing a string value.
   * https://www.home-assistant.io/integrations/knx#type
   */
  type?: "string" | "latin_1";
}

interface NumberEntity {
  /**
   * KNX group address for sending a new value.
   * https://www.home-assistant.io/integrations/knx#address
   */
  address: GroupAddresses;

  /**
   * The category of the entity.
   * https://www.home-assistant.io/integrations/knx#entity_category
   */
  entity_category?: EntityCategory;

  /**
   * Maximum value that can be sent. Defaults to the `type` DPT maximum value.
   * https://www.home-assistant.io/integrations/knx#number
   */
  max?: number;

  /**
   * Minimum value that can be sent. Defaults to the `type` DPT minimum value.
   * https://www.home-assistant.io/integrations/knx#number
   */
  min?: number;

  /**
   * Specifies the mode used in the UI.
   * https://www.home-assistant.io/integrations/knx#number
   */
  mode?: "auto" | "box" | "slider";

  /**
   * A name for this device used within Home Assistant.
   * https://www.home-assistant.io/integrations/knx#name
   */
  name?: string;

  /**
   * Respond to GroupValueRead telegrams received to the configured `address`.
   * https://www.home-assistant.io/integrations/knx#respond_to_read
   */
  respond_to_read?: boolean;

  /**
   * Group address for retrieving the state from the KNX bus.
   * https://www.home-assistant.io/integrations/knx#state_address
   */
  state_address?: GroupAddresses;

  /**
   * Step value. Defaults to the step size defined for the DPT in the KNX specifications.
   * https://www.home-assistant.io/integrations/knx#temperature_step
   *
   * @minimum 0
   */
  step?: number;

  /**
   * Any supported type of KNX Sensor representing a numeric value (e.g., "percent" or "temperature")
   * https://www.home-assistant.io/integrations/knx/#value-types
   */
  type: ValueType;
}

interface Scene {
  /**
   * KNX group address for the scene. DPT 17.001
   * https://www.home-assistant.io/integrations/knx#address
   */
  address?: GroupAddresses;

  /**
   * The category of the entity.
   * https://www.home-assistant.io/integrations/knx#entity_category
   */
  entity_category?: EntityCategory;

  /**
   * A name for this device used within Home Assistant.
   * https://www.home-assistant.io/integrations/knx#name
   */
  name?: string;

  /**
   * KNX scene number to be activated (range 1..64 ).
   * https://www.home-assistant.io/integrations/knx#scene_number
   *
   * @TJS-type integer
   * @minimum 1
   * @maximum 64
   */
  scene_number: number;
}

interface Select {
  /**
   * Group address new values will be sent to.
   * https://www.home-assistant.io/integrations/knx#address
   */
  address: GroupAddresses;

  /**
   * The category of the entity.
   * https://www.home-assistant.io/integrations/knx#entity_category
   */
  entity_category?: EntityCategory;

  /**
   * A name for this device used within Home Assistant.
   * https://www.home-assistant.io/integrations/knx#name
   */
  name?: string;

  /**
   * List of options to choose from. Each `option` and `payload` have to be unique.
   * https://www.home-assistant.io/integrations/knx#options
   */
  options: {
    /**
     * The name of the option used to trigger the assigned `payload`.
     * https://www.home-assistant.io/integrations/knx#option
     */
    option: string;

    /**
     * The raw payload assigned to the `option`.
     * https://www.home-assistant.io/integrations/knx#payload
     */
    payload: Integer;
  }[];

  /**
   * The length of the payload expected for the DPT. Use `0` for DPT 1, 2 or 3.
   * https://www.home-assistant.io/integrations/knx#payload_length
   */
  payload_length: Integer;

  /**
   * Respond to GroupValueRead telegrams received to the configured `address`.
   * https://www.home-assistant.io/integrations/knx#respond_to_read
   */
  respond_to_read?: boolean;

  /**
   * Group address for retrieving the state from the KNX bus.
   * https://www.home-assistant.io/integrations/knx#state_address
   */
  state_address?: GroupAddresses;

  /**
   * Actively read the value from the bus.
   * https://www.home-assistant.io/integrations/knx#sync_state
   */
  sync_state?: boolean | string;
}

interface Sensor {
  /**
   * Defines if telegrams with equal payload as the previously received telegram should trigger a state update within Home Assistant.
   * https://www.home-assistant.io/integrations/knx#always_callback
   */
  always_callback?: boolean;

  /**
   * The category of the entity.
   * https://www.home-assistant.io/integrations/knx#entity_category
   */
  entity_category?: EntityCategory;

  /**
   * Sets the class of the device, changing the device state and icon that is displayed on the frontend.
   * https://www.home-assistant.io/integrations/knx#device_class
   */
  device_class?: DeviceClassesSensor;

  /**
   * A name for this device used within Home Assistant.
   * https://www.home-assistant.io/integrations/knx#name
   */
  name?: string;

  /**
   * KNX group address of the sensor.
   * https://www.home-assistant.io/integrations/knx#state_address
   */
  state_address: GroupAddresses;

  /**
   * The State Class of the sensor.
   * https://www.home-assistant.io/integrations/knx#state_class
   */
  state_class?: StateClassesSensor;

  /**
   * Actively read the value from the bus.
   * https://www.home-assistant.io/integrations/knx#sync_state
   */
  sync_state?: boolean | string;

  /**
   * A type from the value types.
   * https://www.home-assistant.io/integrations/knx/#value-types
   */
  type: ValueType;
}

interface Switch {
  /**
   * KNX group address for switching the switch on/off. DPT 1
   * https://www.home-assistant.io/integrations/knx#address
   */
  address: GroupAddresses;

  /**
   * The category of the entity.
   * https://www.home-assistant.io/integrations/knx#entity_category
   */
  entity_category?: EntityCategory;

  /**
   * Sets the class of the device, changing the device state and icon that is displayed on the frontend.
   * https://www.home-assistant.io/integrations/knx#device_class
   */
  device_class?: DeviceClassesSwitch;

  /**
   * Invert the telegrams payload before processing or sending.
   * https://www.home-assistant.io/integrations/knx#invert
   */
  invert?: boolean;

  /**
   * A name for this device used within Home Assistant.
   * https://www.home-assistant.io/integrations/knx#name
   */
  name?: string;

  /**
   * Respond to GroupValueRead telegrams received to the configured `address`.
   * https://www.home-assistant.io/integrations/knx#respond_to_read
   */
  respond_to_read?: boolean;

  /**
   * Separate KNX group address for retrieving the switch state. DPT 1
   * https://www.home-assistant.io/integrations/knx#state_address
   */
  state_address?: GroupAddresses;
}

interface TextEntity {
  /**
   * KNX group address for sending a text.
   * https://www.home-assistant.io/integrations/knx#address
   */
  address: GroupAddresses;

  /**
   * The category of the entity.
   * https://www.home-assistant.io/integrations/knx#entity_category
   */
  entity_category?: EntityCategory;

  /**
   * Specifies the mode used in the UI.
   * https://www.home-assistant.io/integrations/knx#text
   */
  mode?: "text" | "password";

  /**
   * A name for this device used within Home Assistant.
   * https://www.home-assistant.io/integrations/knx#text
   */
  name?: string;

  /**
   * Respond to GroupValueRead telegrams received to the configured `address`.
   * https://www.home-assistant.io/integrations/knx#respond_to_read
   */
  respond_to_read?: boolean;

  /**
   * Group address for retrieving the state from the KNX bus.
   * https://www.home-assistant.io/integrations/knx#state_address
   */
  state_address?: GroupAddresses;

  /**
   * DPT to encode the text. Either `latin_1` for DPT 16.001 or `string` for DPT 16.000 (ASCII).
   * https://www.home-assistant.io/integrations/knx/#value-types
   */
  type: ValueType;
}

interface Weather {
  /**
   * KNX address reading current air pressure. DPT 9.006
   * https://www.home-assistant.io/integrations/knx#address_air_pressure
   */
  address_air_pressure?: GroupAddresses;

  /**
   * KNX group address for reading current brightness to east coordinate from KNX bus. DPT 9.004
   * https://www.home-assistant.io/integrations/knx#address_brightness_east
   */
  address_brightness_east?: GroupAddresses;

  /**
   * KNX group address for reading current brightness to north coordinate from KNX bus. DPT 9.004
   * https://www.home-assistant.io/integrations/knx#address_brightness_north
   */
  address_brightness_north?: GroupAddresses;

  /**
   * KNX group address for reading current brightness to south coordinate from KNX bus. DPT 9.004
   * https://www.home-assistant.io/integrations/knx#address_brightness_south
   */
  address_brightness_south?: GroupAddresses;

  /**
   * KNX group address for reading current brightness to west coordinate from KNX bus. DPT 9.004
   * https://www.home-assistant.io/integrations/knx#address_brightness_west
   */
  address_brightness_west?: GroupAddresses;

  /**
   * KNX group address for reading if it’s day/night.
   * https://www.home-assistant.io/integrations/knx#address_day_night
   */
  address_day_night?: GroupAddresses;

  /**
   * KNX group address for reading if frost alarm is on/off.
   * https://www.home-assistant.io/integrations/knx#address_frost_alarm
   */
  address_frost_alarm?: GroupAddresses;

  /**
   * KNX address for reading current humidity. DPT 9.007
   * https://www.home-assistant.io/integrations/knx#address_humidity
   */
  address_humidity?: GroupAddresses;

  /**
   * KNX group address for reading if rain alarm is on/off.
   * https://www.home-assistant.io/integrations/knx#address_rain_alarm
   */
  address_rain_alarm?: GroupAddresses;

  /**
   * KNX group address for reading if wind alarm is on/off.
   * https://www.home-assistant.io/integrations/knx#address_wind_alarm
   */
  address_wind_alarm?: GroupAddresses;

  /**
   * KNX group address for reading current wind bearing from KNX bus. DPT 5.003
   * https://www.home-assistant.io/integrations/knx#address_wind_bearing
   */
  address_wind_bearing?: GroupAddresses;

  /**
   * KNX group address for reading current wind speed from KNX bus. DPT 9.005
   * https://www.home-assistant.io/integrations/knx#address_wind_speed
   */
  address_wind_speed?: GroupAddresses;

  /**
   * The category of the entity.
   * https://www.home-assistant.io/integrations/knx#entity_category
   */
  entity_category?: EntityCategory;

  /**
   * A name for this device used within Home Assistant.
   * https://www.home-assistant.io/integrations/knx#name
   */
  name?: string;

  /**
   * Actively read the value from the bus. If false no GroupValueRead telegrams will be sent to the bus.
   * https://www.home-assistant.io/integrations/knx#sync_state
   */
  sync_state?: boolean | string;

  /**
   * KNX group address for reading current outside temperature from KNX bus. DPT 9.001
   * https://www.home-assistant.io/integrations/knx#temperature_address
   */
  address_temperature: GroupAddresses;
}
