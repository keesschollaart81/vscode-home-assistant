/**
 * Modbus integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/modbus/
 * Documentation: https://www.home-assistant.io/integrations/modbus/
 */
import {
  DeviceClassesBinarySensor,
  DeviceClassesCover,
  DeviceClassesSensor,
  Integer,
  StateClassesSensor,
} from "../../types";

export type Domain = "modbus";

export type Schema = Item | Item[];

interface Item {
  /**
   * Name of this hub. Must be unique.
   * https://www.home-assistant.io/integrations/modbus/#name
   */
  name: string;

  /**
   * Type of modbus.
   * https://www.home-assistant.io/integrations/modbus/#type
   */
  type: "tcp" | "udp" | "rtuovertcp" | "serial";

  /**
   * Time to delay sending messages in seconds after connecting. Some modbus devices need a delay of typically 1-2 seconds after connection is established to prepare the communication. If a device does not respond to messages after connecting, then try this parameter. Remark: solely affect the first message.
   * https://www.home-assistant.io/integrations/modbus/#delay
   */
  delay?: Integer;

  /**
   * Time to wait in milliseconds between requests.
   * https://www.home-assistant.io/integrations/modbus/#message_wait_milliseconds
   */
  message_wait_milliseconds?: Integer;

  /**
   * Timeout while waiting for a response in seconds.
   * https://www.home-assistant.io/integrations/modbus/#timeout
   */
  timeout?: Integer;

  /**
   * IP address or name of your modbus device, e.g., 192.168.1.1. Required for tcp, rtuovertcp, and udp types.
   * https://www.home-assistant.io/integrations/modbus/#host
   */
  host?: string;

  /**
   * Network port for the communication. Required for tcp, rtuovertcp, and udp types.
   * https://www.home-assistant.io/integrations/modbus/#port
   */
  port?: Integer;

  /**
   * Serial port or USB device where your modbus device is connected to your Home Assistant host. Required for serial type.
   * https://www.home-assistant.io/integrations/modbus/#port-1
   */
  port_serial?: string;

  /**
   * Speed of the serial connection, higher speed gives better performance. Required for serial type.
   * https://www.home-assistant.io/integrations/modbus/#baudrate
   */
  baudrate?: Integer;

  /**
   * Data size in bits of each byte. Required for serial type.
   * https://www.home-assistant.io/integrations/modbus/#bytesize
   */
  bytesize?: 5 | 6 | 7 | 8;

  /**
   * Method of the connection to modbus. Required for serial type.
   * https://www.home-assistant.io/integrations/modbus/#method
   */
  method?: "rtu" | "ascii";

  /**
   * Parity of the data bytes. Required for serial type.
   * https://www.home-assistant.io/integrations/modbus/#parity
   */
  parity?: "E" | "O" | "N";

  /**
   * Stopbits of the data bytes. Required for serial type.
   * https://www.home-assistant.io/integrations/modbus/#stopbits
   */
  stopbits?: 1 | 2;

  /**
   * A list of all binary sensors configured for this connection.
   * https://www.home-assistant.io/integrations/modbus/#binary_sensors
   */
  binary_sensors?: BinarySensorItem | BinarySensorItem[];

  /**
   * A list of all climate entities in this modbus instance.
   * https://www.home-assistant.io/integrations/modbus/#climates
   */
  climates?: ClimateItem | ClimateItem[];

  /**
   * A list of all cover entities configured for this connection.
   * https://www.home-assistant.io/integrations/modbus/#covers
   */
  covers?: CoverItem | CoverItem[];

  /**
   * A list of all fan entities in this modbus instance.
   * https://www.home-assistant.io/integrations/modbus/#fans
   */
  fans?: FanItem | FanItem[];

  /**
   * A list of all light entities in this modbus instance.
   * https://www.home-assistant.io/integrations/modbus/#lights
   */
  lights?: LightItem | LightItem[];

  /**
   * A list of all sensors in this modbus instance.
   * https://www.home-assistant.io/integrations/modbus/#sensors
   */
  sensors?: SensorItem | SensorItem[];

  /**
   * A list of all switches in this modbus instance.
   * https://www.home-assistant.io/integrations/modbus/#switches
   */
  switches?: SwitchItem | SwitchItem[];
}

interface BaseEntityItem {
  /**
   * Name of the entity which must be unique within the entity type.
   * https://www.home-assistant.io/integrations/modbus/#name-1
   */
  name: string;

  /**
   * Address of coil/register. Note that this can also be specified in Hex. For example: 0x789A
   * https://www.home-assistant.io/integrations/modbus/#address
   */
  address: Integer | string;

  /**
   * Update interval in seconds. scan_interval = 0 for no polling. Entities are read shortly after startup and then according to scan_interval. Remark, when restarting HA the last known value is restored.
   * https://www.home-assistant.io/integrations/modbus/#scan_interval
   */
  scan_interval?: Integer;

  /**
   * Id of the device. Used to address multiple devices on a rs485 bus or devices connected to a modbus repeater. 0 is the broadcast id.
   * https://www.home-assistant.io/integrations/modbus/#device_address
   */
  device_address?: Integer;

  /**
   * Identical to device_address.
   * https://www.home-assistant.io/integrations/modbus/#slave
   */
  slave?: Integer;

  /**
   * ID that uniquely identifies this entity. Slaves will be given a unique_id of <<unique_id>>_<<slave_index>>. If two entities have the same unique ID, Home Assistant will raise an exception.
   * https://www.home-assistant.io/integrations/modbus/#unique_id
   */
  unique_id?: string;
}

interface BinarySensorItem extends BaseEntityItem {
  /**
   * The type/class to be used for the UI.
   * https://www.home-assistant.io/integrations/modbus/#device_class
   */
  device_class?: DeviceClassesBinarySensor;

  /**
   * Type of request discrete_input, coil, holding or input.
   * https://www.home-assistant.io/integrations/modbus/#input_type
   */
  input_type?: "discrete_input" | "coil" | "holding" | "input";

  /**
   * Generate count+1 binary sensors (master + slaves). Addresses are automatically incremented. The parameter simplifies configuration and provides a much better performance by not using count+1 requests but a single request.
   * https://www.home-assistant.io/integrations/modbus/#virtual_count
   */
  virtual_count?: Integer;

  /**
   * Identical to virtual_count.
   * https://www.home-assistant.io/integrations/modbus/#slave_count
   */
  slave_count?: Integer;
}

interface ClimateItem extends BaseEntityItem {
  /**
   * Temperature unit: C or F.
   * https://www.home-assistant.io/integrations/modbus/#temperature_unit
   */
  temperature_unit?: "C" | "F";

  /**
   * Number of valid decimals for temperature.
   * https://www.home-assistant.io/integrations/modbus/#precision
   */
  precision?: Integer;

  /**
   * Step size target temperature.
   * https://www.home-assistant.io/integrations/modbus/#temp_step
   */
  temp_step?: number;

  /**
   * Maximum setpoint for target temperature.
   * https://www.home-assistant.io/integrations/modbus/#max_temp
   */
  max_temp?: Integer;

  /**
   * Minimum setpoint for target temperature.
   * https://www.home-assistant.io/integrations/modbus/#min_temp
   */
  min_temp?: Integer;

  /**
   * Number of registers to read to fetch the current temperature. Only valid for data_type: custom and data_type: string, for other data types count is automatically calculated.
   * https://www.home-assistant.io/integrations/modbus/#count
   */
  count?: Integer;

  /**
   * Response representation when reading the current temperature register(s).
   * https://www.home-assistant.io/integrations/modbus/#data_type
   */
  data_type?:
    | "custom"
    | "float16"
    | "float32"
    | "float64"
    | "int"
    | "int16"
    | "int32"
    | "int64"
    | "string"
    | "uint"
    | "uint16"
    | "uint32"
    | "uint64";

  /**
   * Modbus register type for current temperature.
   * https://www.home-assistant.io/integrations/modbus/#input_type-1
   */
  input_type?: "holding" | "input";

  /**
   * Final offset for current temperature (output = scale * value + offset).
   * https://www.home-assistant.io/integrations/modbus/#offset
   */
  offset?: number;

  /**
   * Register address for target temperature (Setpoint). Using a list, it is possible to define one register for each of the available HVAC Modes.
   * https://www.home-assistant.io/integrations/modbus/#target_temp_register
   */
  target_temp_register: Integer | Integer[];

  /**
   * If true use write_registers for target temperature (target_temp_register), else use write_register.
   * https://www.home-assistant.io/integrations/modbus/#target_temp_write_registers
   */
  target_temp_write_registers?: boolean;

  /**
   * Scale factor (output = scale * value + offset) for setting target temperature.
   * https://www.home-assistant.io/integrations/modbus/#scale
   */
  scale?: number;

  /**
   * If data_type: custom is specified a double-quoted Python struct is expected, to format the string to unpack the value. See Python documentation for details. Example: >i.
   * https://www.home-assistant.io/integrations/modbus/#structure
   */
  structure?: string;

  /**
   * Swap the order of bytes/words, not valid with custom and datatype: string when setting target temperature.
   * https://www.home-assistant.io/integrations/modbus/#swap
   */
  swap?: "byte" | "word" | "word_byte";

  /**
   * Configuration of register for HVAC action.
   * https://www.home-assistant.io/integrations/modbus/#hvac_action_register
   */
  hvac_action_register?: {
    /**
     * Address of HVAC action register.
     * https://www.home-assistant.io/integrations/modbus/#address-1
     */
    address: Integer;

    /**
     * Type of register, either holding or input.
     * https://www.home-assistant.io/integrations/modbus/#input_type-2
     */
    input_type?: "holding" | "input";

    /**
     * Mapping between the register values and HVAC actions.
     * https://www.home-assistant.io/integrations/modbus/#values
     */
    values: {
      /**
       * Value corresponding to HVAC Off action.
       * https://www.home-assistant.io/integrations/modbus/#action_off
       */
      action_off?: Integer | Integer[];

      /**
       * Value corresponding to HVAC Cooling action.
       * https://www.home-assistant.io/integrations/modbus/#action_cooling
       */
      action_cooling?: Integer | Integer[];

      /**
       * Value corresponding to HVAC Defrosting action.
       * https://www.home-assistant.io/integrations/modbus/#action_defrosting
       */
      action_defrosting?: Integer | Integer[];

      /**
       * Value corresponding to HVAC Drying action.
       * https://www.home-assistant.io/integrations/modbus/#action_drying
       */
      action_drying?: Integer | Integer[];

      /**
       * Value corresponding to HVAC Fan action.
       * https://www.home-assistant.io/integrations/modbus/#action_fan
       */
      action_fan?: Integer | Integer[];

      /**
       * Value corresponding to HVAC Heating action.
       * https://www.home-assistant.io/integrations/modbus/#action_heating
       */
      action_heating?: Integer | Integer[];

      /**
       * Value corresponding to HVAC Idle action.
       * https://www.home-assistant.io/integrations/modbus/#action_idle
       */
      action_idle?: Integer | Integer[];

      /**
       * Value corresponding to HVAC Preheating action.
       * https://www.home-assistant.io/integrations/modbus/#action_preheating
       */
      action_preheating?: Integer | Integer[];
    };
  };

  /**
   * Configuration of register for HVAC mode.
   * https://www.home-assistant.io/integrations/modbus/#hvac_mode_register
   */
  hvac_mode_register?: {
    /**
     * Address of HVAC mode register.
     * https://www.home-assistant.io/integrations/modbus/#address-2
     */
    address: Integer;

    /**
     * Request type for setting HVAC mode, use write_registers if true else write_register. If more than one value is specified for a specific mode, only the first one is used for writing to the register.
     * https://www.home-assistant.io/integrations/modbus/#write_registers
     */
    write_registers?: boolean;

    /**
     * Mapping between the register values and HVAC modes.
     * https://www.home-assistant.io/integrations/modbus/#values-1
     */
    values: {
      /**
       * Value corresponding to HVAC Off mode. If the On/Off state handled on a different address and/or register the state_off state should be omitted from your configuration.
       * https://www.home-assistant.io/integrations/modbus/#state_off
       */
      state_off?: Integer | Integer[];

      /**
       * Value corresponding to HVAC Heat mode.
       * https://www.home-assistant.io/integrations/modbus/#state_heat
       */
      state_heat?: Integer | Integer[];

      /**
       * Value corresponding to HVAC Cool mode.
       * https://www.home-assistant.io/integrations/modbus/#state_cool
       */
      state_cool?: Integer | Integer[];

      /**
       * Value corresponding to HVAC Auto mode.
       * https://www.home-assistant.io/integrations/modbus/#state_auto
       */
      state_auto?: Integer | Integer[];

      /**
       * Value corresponding to HVAC Dry mode.
       * https://www.home-assistant.io/integrations/modbus/#state_dry
       */
      state_dry?: Integer | Integer[];

      /**
       * Value corresponding to HVAC Fan only mode.
       * https://www.home-assistant.io/integrations/modbus/#state_fan_only
       */
      state_fan_only?: Integer | Integer[];

      /**
       * Value corresponding to HVAC Heat/Cool mode.
       * https://www.home-assistant.io/integrations/modbus/#state_heat_cool
       */
      state_heat_cool?: Integer | Integer[];
    };
  };

  /**
   * Configuration of register for Fan mode.
   * https://www.home-assistant.io/integrations/modbus/#fan_mode_register
   */
  fan_mode_register?: {
    /**
     * Address of Fan mode register. (int to call write_register, list of 1 int to call write_registers).
     * https://www.home-assistant.io/integrations/modbus/#address-3
     */
    address: Integer | Integer[];

    /**
     * Mapping between the register values and Fan modes. This is typically used to control one of: Speed, Direction or On/Off state.
     * https://www.home-assistant.io/integrations/modbus/#values-2
     */
    values: {
      /**
       * Value corresponding to Fan On mode.
       * https://www.home-assistant.io/integrations/modbus/#state_fan_on
       */
      state_fan_on?: Integer;

      /**
       * Value corresponding to Fan Off mode.
       * https://www.home-assistant.io/integrations/modbus/#state_fan_off
       */
      state_fan_off?: Integer;

      /**
       * Value corresponding to Fan Low mode.
       * https://www.home-assistant.io/integrations/modbus/#state_fan_low
       */
      state_fan_low?: Integer;

      /**
       * Value corresponding to Fan Medium mode.
       * https://www.home-assistant.io/integrations/modbus/#state_fan_medium
       */
      state_fan_medium?: Integer;

      /**
       * Value corresponding to Fan High mode.
       * https://www.home-assistant.io/integrations/modbus/#state_fan_high
       */
      state_fan_high?: Integer;

      /**
       * Value corresponding to Fan Auto mode.
       * https://www.home-assistant.io/integrations/modbus/#state_fan_auto
       */
      state_fan_auto?: Integer;

      /**
       * Value corresponding to Fan Top mode.
       * https://www.home-assistant.io/integrations/modbus/#state_fan_top
       */
      state_fan_top?: Integer;

      /**
       * Value corresponding to Fan Middle mode.
       * https://www.home-assistant.io/integrations/modbus/#state_fan_middle
       */
      state_fan_middle?: Integer;

      /**
       * Value corresponding to Fan Focus mode.
       * https://www.home-assistant.io/integrations/modbus/#state_fan_focus
       */
      state_fan_focus?: Integer;

      /**
       * Value corresponding to Fan Diffuse mode.
       * https://www.home-assistant.io/integrations/modbus/#state_fan_diffuse
       */
      state_fan_diffuse?: Integer;
    };
  };

  /**
   * Address of On/Off state. Only use this setting if your On/Off state is not handled as a HVAC mode. When zero is read from this coil, the HVAC state is set to Off, otherwise the hvac_mode_register dictates the state of the HVAC. If no such coil is defined, it defaults to Auto. When the HVAC mode is set to Off, the value 0 is written to the coil, otherwise the value 1 is written. Cannot be used with hvac_onoff_register.
   * https://www.home-assistant.io/integrations/modbus/#hvac_onoff_coil
   */
  hvac_onoff_coil?: Integer;

  /**
   * Address of On/Off state. Only use this setting if your On/Off state is not handled as a HVAC mode. When zero is read from this register, the HVAC state is set to Off, otherwise the hvac_mode_register dictates the state of the HVAC. If no such register is defined, it defaults to Auto. When the HVAC mode is set to Off, the value 0 is written to the register, otherwise the value 1 is written.
   * https://www.home-assistant.io/integrations/modbus/#hvac_onoff_register
   */
  hvac_onoff_register?: Integer;

  /**
   * The value that will be written to the hvac_onoff_register to turn the HVAC system on. If not specified, the default value is 1.
   * https://www.home-assistant.io/integrations/modbus/#hvac_on_value
   */
  hvac_on_value?: Integer;

  /**
   * The value that will be written to the hvac_onoff_register to turn the HVAC system off. If not specified, the default value is 0.
   * https://www.home-assistant.io/integrations/modbus/#hvac_off_value
   */
  hvac_off_value?: Integer;

  /**
   * Configuration of the register for swing mode.
   * https://www.home-assistant.io/integrations/modbus/#swing_mode_register
   */
  swing_mode_register?: {
    /**
     * Address of swing mode register. (int to call write_register, list of 1 int to call write_registers). - Reading done through holding register.
     * https://www.home-assistant.io/integrations/modbus/#address-4
     */
    address: Integer | Integer[];

    /**
     * Mapping between the register values and swing modes.
     * https://www.home-assistant.io/integrations/modbus/#values-3
     */
    values: {
      /**
       * Value corresponding to swing mode on.
       * https://www.home-assistant.io/integrations/modbus/#swing_mode_state_on
       */
      swing_mode_state_on?: Integer;

      /**
       * Value corresponding to swing mode off.
       * https://www.home-assistant.io/integrations/modbus/#swing_mode_state_off
       */
      swing_mode_state_off?: Integer;

      /**
       * Value corresponding to swing mode horizontal.
       * https://www.home-assistant.io/integrations/modbus/#swing_mode_state_horizontal
       */
      swing_mode_state_horizontal?: Integer;

      /**
       * Value corresponding to swing mode vertical.
       * https://www.home-assistant.io/integrations/modbus/#swing_mode_state_vertical
       */
      swing_mode_state_vertical?: Integer;

      /**
       * Value corresponding to Swing mode both.
       * https://www.home-assistant.io/integrations/modbus/#swing_mode_state_both
       */
      swing_mode_state_both?: Integer;
    };
  };

  /**
   * If true use write_registers to control the On/Off state (hvac_onoff_register), else use write_register. Note that it is not yet possible to control the On/Off state via a coil.
   * https://www.home-assistant.io/integrations/modbus/#write_registers-1
   */
  write_registers?: boolean;
}

interface CoverItem extends BaseEntityItem {
  /**
   * The type/class of the cover to set the icon in the frontend.
   * https://www.home-assistant.io/integrations/modbus/#device_class-1
   */
  device_class?: DeviceClassesCover;

  /**
   * Cover register type.
   * https://www.home-assistant.io/integrations/modbus/#input_type-3
   */
  input_type?: "holding" | "input";

  /**
   * A value in status_register or register representing an open cover. If your configuration uses the register attribute, this value will be written into the holding register to open the cover.
   * https://www.home-assistant.io/integrations/modbus/#state_open
   */
  state_open?: Integer;

  /**
   * A value in status_register or register representing a closed cover. If your configuration uses the register attribute, this value will be written into the holding register to close the cover.
   * https://www.home-assistant.io/integrations/modbus/#state_closed
   */
  state_closed?: Integer;

  /**
   * A value in status_register or register representing an opening cover. Note that this state should be also supported on your connected Modbus cover. If it won't report the state, this state won't be detected.
   * https://www.home-assistant.io/integrations/modbus/#state_opening
   */
  state_opening?: Integer;

  /**
   * A value in status_register or register representing a closing cover. Note that this state should be also supported on your connected Modbus cover. If it will not report the state, this state won't be detected.
   * https://www.home-assistant.io/integrations/modbus/#state_closing
   */
  state_closing?: Integer;

  /**
   * Address of register, from which all the cover states will be read. If you specified register attribute, and not status_register attribute, your main register will also be used as a status register.
   * https://www.home-assistant.io/integrations/modbus/#status_register
   */
  status_register?: Integer;

  /**
   * Cover status register type (holding, input), default holding.
   * https://www.home-assistant.io/integrations/modbus/#status_register_type
   */
  status_register_type?: "holding" | "input";
}

interface FanItem extends BaseEntityItem {
  /**
   * Value to write to turn on the fan.
   * https://www.home-assistant.io/integrations/modbus/#command_on
   */
  command_on?: Integer;

  /**
   * Value to write to turn off the fan.
   * https://www.home-assistant.io/integrations/modbus/#command_off
   */
  command_off?: Integer;

  /**
   * Type of write request.
   * https://www.home-assistant.io/integrations/modbus/#write_type
   */
  write_type?: "holding" | "holdings" | "coil" | "coils";

  /**
   * Read from Modbus device to verify fan. If used without attributes, it uses the toggle register configuration. If omitted, no verification is done, but the state of the fan is set with each toggle.
   * https://www.home-assistant.io/integrations/modbus/#verify
   */
  verify?: {
    /**
     * Address to read from.
     * https://www.home-assistant.io/integrations/modbus/#address-5
     */
    address?: Integer;

    /**
     * Delay between write and verify.
     * https://www.home-assistant.io/integrations/modbus/#delay-1
     */
    delay?: Integer;

    /**
     * Type of address.
     * https://www.home-assistant.io/integrations/modbus/#input_type-4
     */
    input_type?: "coil" | "discrete" | "holding" | "input";

    /**
     * Value when the fan is on.
     * https://www.home-assistant.io/integrations/modbus/#state_on
     */
    state_on?: Integer;

    /**
     * Value when the fan is off.
     * https://www.home-assistant.io/integrations/modbus/#state_off-1
     */
    state_off?: Integer;
  };
}

interface LightItem extends BaseEntityItem {
  /**
   * Value to write to turn on the light.
   * https://www.home-assistant.io/integrations/modbus/#command_on-1
   */
  command_on?: Integer;

  /**
   * Value to write to turn off the light.
   * https://www.home-assistant.io/integrations/modbus/#command_off-1
   */
  command_off?: Integer;

  /**
   * Type of write request.
   * https://www.home-assistant.io/integrations/modbus/#write_type-1
   */
  write_type?: "holding" | "holdings" | "coil" | "coils";

  /**
   * Read from Modbus device to verify the light. If used without attributes, it uses the toggle register configuration. If omitted no verification, is done, but the state of the light is set with each toggle.
   * https://www.home-assistant.io/integrations/modbus/#verify-1
   */
  verify?: {
    /**
     * Address to read from.
     * https://www.home-assistant.io/integrations/modbus/#address-6
     */
    address?: Integer;

    /**
     * Delay between write and verify.
     * https://www.home-assistant.io/integrations/modbus/#delay-2
     */
    delay?: Integer;

    /**
     * Type of address (holding/coil/discrete/input).
     * https://www.home-assistant.io/integrations/modbus/#input_type-5
     */
    input_type?: "coil" | "discrete" | "holding" | "input";

    /**
     * Value when the light is on.
     * https://www.home-assistant.io/integrations/modbus/#state_on-1
     */
    state_on?: Integer;

    /**
     * Value when the light is off.
     * https://www.home-assistant.io/integrations/modbus/#state_off-2
     */
    state_off?: Integer;
  };
}

interface SensorItem extends BaseEntityItem {
  /**
   * Number of registers to read. Only valid for data_type: custom and data_type: string, for other data types count is automatically calculated.
   * https://www.home-assistant.io/integrations/modbus/#count-1
   */
  count?: Integer;

  /**
   * Response representation.
   * https://www.home-assistant.io/integrations/modbus/#data_type-1
   */
  data_type?:
    | "custom"
    | "float16"
    | "float32"
    | "float64"
    | "int"
    | "int16"
    | "int32"
    | "int64"
    | "string"
    | "uint"
    | "uint16"
    | "uint32"
    | "uint64";

  /**
   * The type/class of the sensor to set the icon in the frontend.
   * https://www.home-assistant.io/integrations/modbus/#device_class-2
   */
  device_class?: DeviceClassesSensor;

  /**
   * Modbus register type for sensor.
   * https://www.home-assistant.io/integrations/modbus/#input_type-6
   */
  input_type?: "holding" | "input";

  /**
   * The minimum allowed value of a sensor. If value < min_value –> min_value. Can be float or integer.
   * https://www.home-assistant.io/integrations/modbus/#min_value
   */
  min_value?: number;

  /**
   * The maximum allowed value of a sensor. If value > max_value –> max_value. Can be float or integer.
   * https://www.home-assistant.io/integrations/modbus/#max_value
   */
  max_value?: number;

  /**
   * If a Modbus sensor has a defined NaN value, this value can be set as a hex string starting with 0x containing one or more bytes (for example, 0xFFFF or 0x80000000) or provided as an integer directly. If triggered, the sensor becomes unavailable. Please note that the hex to int conversion for nan_value does currently not obey home-assistants Modbus encoding using the data_type, structure, or swap arguments.
   * https://www.home-assistant.io/integrations/modbus/#nan_value
   */
  nan_value?: string | Integer;

  /**
   * Suppress values close to zero. If -zero_suppress <= value <= +zero_suppress –> 0. Can be float or integer.
   * https://www.home-assistant.io/integrations/modbus/#zero_suppress
   */
  zero_suppress?: number;

  /**
   * Final offset (output = scale * value + offset).
   * https://www.home-assistant.io/integrations/modbus/#offset-1
   */
  offset?: number;

  /**
   * Number of valid decimals.
   * https://www.home-assistant.io/integrations/modbus/#precision-1
   */
  precision?: Integer;

  /**
   * Scale factor (output = scale * value + offset).
   * https://www.home-assistant.io/integrations/modbus/#scale-1
   */
  scale?: number;

  /**
   * Identical to virtual_count.
   * https://www.home-assistant.io/integrations/modbus/#slave_count-1
   */
  slave_count?: Integer;

  /**
   * Generates x-1 slave sensors, allowing read of multiple registers with a single read message.
   * https://www.home-assistant.io/integrations/modbus/#virtual_count-1
   */
  virtual_count?: Integer;

  /**
   * The state_class of the sensor.
   * https://www.home-assistant.io/integrations/modbus/#state_class
   */
  state_class?: StateClassesSensor;

  /**
   * If data_type: custom is specified a double-quoted Python struct is expected, to format the string to unpack the value. See Python documentation for details. Example: >i.
   * https://www.home-assistant.io/integrations/modbus/#structure-1
   */
  structure?: string;

  /**
   * Swap the order of bytes/words, not valid with custom and datatype: string.
   * https://www.home-assistant.io/integrations/modbus/#swap-1
   */
  swap?: "byte" | "word" | "word_byte";

  /**
   * Unit to attach to value.
   * https://www.home-assistant.io/integrations/modbus/#unit_of_measurement
   */
  unit_of_measurement?: string;
}

interface SwitchItem extends BaseEntityItem {
  /**
   * Value to write to turn on the switch.
   * https://www.home-assistant.io/integrations/modbus/#command_on-2
   */
  command_on?: Integer;

  /**
   * Value to write to turn off the switch.
   * https://www.home-assistant.io/integrations/modbus/#command_off-2
   */
  command_off?: Integer;

  /**
   * Type of write request.
   * https://www.home-assistant.io/integrations/modbus/#write_type-2
   */
  write_type?: "holding" | "holdings" | "coil" | "coils";

  /**
   * Read from Modbus device to verify switch. If used without attributes, it uses the toggle register configuration. If omitted, no verification is done, but the state of the switch is set with each toggle.
   * https://www.home-assistant.io/integrations/modbus/#verify-2
   */
  verify?: {
    /**
     * Address to read from.
     * https://www.home-assistant.io/integrations/modbus/#address-7
     */
    address?: Integer;

    /**
     * Delay between write and verify.
     * https://www.home-assistant.io/integrations/modbus/#delay-3
     */
    delay?: Integer;

    /**
     * Type of address.
     * https://www.home-assistant.io/integrations/modbus/#input_type-7
     */
    input_type?: "coil" | "discrete" | "holding" | "input";

    /**
     * Value(s) when switch is on. The value must be an integer or a list of integers.
     * https://www.home-assistant.io/integrations/modbus/#state_on-2
     */
    state_on?: Integer | Integer[];

    /**
     * Value(s) when switch is off. The value must be an integer or a list of integers.
     * https://www.home-assistant.io/integrations/modbus/#state_off-3
     */
    state_off?: Integer | Integer[];
  };
}
