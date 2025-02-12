export type Area = string;

/**
 * From: https://github.com/home-assistant/core/blob/dev/homeassistant/components/light/const.py
 */
export type ColorMode =
  | "unknown"
  | "onoff"
  | "brightness"
  | "color_temp"
  | "hs"
  | "xy"
  | "rgb"
  | "rgbw"
  | "rgbww"
  | "white";

export type Data = {
  [key: string]: any | Template;
};

/**
 * @TJS-pattern DEPRECATED^
 * @items.pattern DEPRECATED^
 */
export type Deprecated = any | any[];

/**
 * @TJS-pattern LEGACY_SYNTAX^
 * @items.pattern LEGACY_SYNTAX^
 */
export type LegacySyntax = any | any[];

export type DeviceClasses =
  | DeviceClassesBinarySensor
  | DeviceClassesCover
  | DeviceClassesMediaPlayer
  | DeviceClassesSensor
  | DeviceClassesSwitch;

/**
 * From: https://github.com/home-assistant/core/blob/dev/homeassistant/components/binary_sensor/__init__.py
 */
export type DeviceClassesBinarySensor =
  | "battery"
  | "battery_charging"
  | "carbon_monoxide"
  | "cold"
  | "connectivity"
  | "door"
  | "garage_door"
  | "gas"
  | "heat"
  | "light"
  | "lock"
  | "moisture"
  | "motion"
  | "moving"
  | "occupancy"
  | "opening"
  | "plug"
  | "power"
  | "presence"
  | "problem"
  | "running"
  | "safety"
  | "smoke"
  | "sound"
  | "tamper"
  | "update"
  | "vibration"
  | "window";

/**
 * From: https://github.com/home-assistant/core/blob/dev/homeassistant/components/cover/__init__.py
 */
export type DeviceClassesCover =
  | "awning"
  | "blind"
  | "curtain"
  | "damper"
  | "door"
  | "garage"
  | "gate"
  | "shade"
  | "shutter"
  | "window";

/**
 * From: https://github.com/home-assistant/core/blob/dev/homeassistant/components/media_player/__init__.py
 */
export type DeviceClassesMediaPlayer = "tv" | "speaker" | "receiver";

/**
 * From: https://github.com/home-assistant/core/blob/dev/homeassistant/components/sensor/const.py
 */
export type DeviceClassesSensor =
  | "apparent_power"
  | "aqi"
  | "area"
  | "atmospheric_pressure"
  | "battery"
  | "blood_glucose_concentration"
  | "carbon_dioxide"
  | "carbon_monoxide"
  | "conductivity"
  | "current"
  | "data_rate"
  | "data_size"
  | "date"
  | "distance"
  | "duration"
  | "energy"
  | "energy_distance"
  | "energy_storage"
  | "enum"
  | "frequency"
  | "gas"
  | "humidity"
  | "illuminance"
  | "irradiance"
  | "moisture"
  | "monetary"
  | "nitrogen_dioxide"
  | "nitrogen_monoxide"
  | "nitrous_oxide"
  | "ozone"
  | "ph"
  | "pm1"
  | "pm10"
  | "pm25"
  | "power_factor"
  | "power"
  | "precipitation_intensity"
  | "precipitation"
  | "pressure"
  | "reactive_power"
  | "signal_strength"
  | "sound_pressure"
  | "speed"
  | "sulphur_dioxide"
  | "temperature"
  | "timestamp"
  | "volatile_organic_compounds"
  | "volatile_organic_compounds_parts"
  | "voltage"
  | "volume"
  | "volume_flow_rate"
  | "volume_storage"
  | "water"
  | "weight"
  | "wind_speed";

/**
 * From: https://github.com/home-assistant/core/blob/dev/homeassistant/const.py
 */
export type EntityCategory = "config" | "diagnostic";

/**
 * From: https://github.com/home-assistant/core/blob/dev/homeassistant/components/sensor/const.py
 */
export type StateClassesSensor = "measurement" | "total" | "total_increasing";

/**
 * From: https://github.com/home-assistant/core/blob/dev/homeassistant/components/switch/__init__.py
 */
export type DeviceClassesSwitch = "outlet" | "switch";

/**
 * @TJS-pattern ^(?!.+__)(?!_)[\da-z_]+(?<!_)$
 */
export type Domain = string;

/**
 * @TJS-pattern ^(?!.+__)(?!_)[\da-z_]+(?<!_)$
 * @items.pattern ^(?!.+__)(?!_)[\da-z_]+(?<!_)$
 */
export type Domains = Domain[];

/**
 * @TJS-pattern ^(?!.+__)(?!_)[\da-z_]+(?<!_)\.(?!_)[\da-z_]+(?<!_)$
 */
export type Entity = string;

/**
 * @TJS-pattern ^(?!.+__)(?!_)[\da-z_]+(?<!_)\.(?!_)[\da-z_]+(?<!_)\s?(?:,\s?(?!.+__)(?!_)[\da-z_]+(?<!_)\.(?!_)[\da-z_]+(?<!_))*$
 * @items.pattern ^(?!.+__)(?!_)[\da-z_]+(?<!_)\.(?!_)[\da-z_]+(?<!_)$
 */
export type Entities = Entity | Entity[];

/**
 * @TJS-pattern ^alarm_control_panel\.(?!_)[\da-z_]+(?<!_)$
 */
export type AlarmControlPanelEntity = string;

/**
 * @TJS-pattern ^alarm_control_panel\.(?!_)[\da-z_]+(?<!_)\s?(?:,\s?alarm_control_panel\.(?!_)[\da-z_]+(?<!_))*$
 * @items.pattern ^alarm_control_panel\.(?!_)[\da-z_]+(?<!_)$
 */
export type AlarmControlPanelEntities =
  | AlarmControlPanelEntity
  | AlarmControlPanelEntity[];

/**
 * @TJS-pattern ^device_tracker\.(?!_)[\da-z_]+(?<!_)$
 */
export type DeviceTrackerEntity = string;

/**
 * @TJS-pattern ^device_tracker\.(?!_)[\da-z_]+(?<!_)\s?(?:,\s?device_tracker\.(?!_)[\da-z_]+(?<!_))*$
 * @items.pattern ^device_tracker\.(?!_)[\da-z_]+(?<!_)$
 */
export type DeviceTrackerEntities = DeviceTrackerEntity | DeviceTrackerEntity[];

/**
 * @TJS-pattern ^calendar\.(?!_)[\da-z_]+(?<!_)$
 */
export type CalendarEntity = string;

/**
 * @TJS-pattern ^calendar\.(?!_)[\da-z_]+(?<!_)\s?(?:,\s?calendar\.(?!_)[\da-z_]+(?<!_))*$
 * @items.pattern ^calendar\.(?!_)[\da-z_]+(?<!_)$
 */
export type CalendarEntities = CalendarEntity | CalendarEntity[];

/**
 * @TJS-pattern ^camera\.(?!_)[\da-z_]+(?<!_)$
 */
export type CameraEntity = string;

/**
 * @TJS-pattern ^camera\.(?!_)[\da-z_]+(?<!_)\s?(?:,\s?camera\.(?!_)[\da-z_]+(?<!_))*$
 * @items.pattern ^camera\.(?!_)[\da-z_]+(?<!_)$
 */
export type CameraEntities = CameraEntity | CameraEntity[];

/**
 * @TJS-pattern ^climate\.(?!_)[\da-z_]+(?<!_)$
 */
export type ClimateEntity = string;

/**
 * @TJS-pattern ^climate\.(?!_)[\da-z_]+(?<!_)\s?(?:,\s?climate\.(?!_)[\da-z_]+(?<!_))*$
 * @items.pattern ^climate\.(?!_)[\da-z_]+(?<!_)$
 */
export type ClimateEntities = ClimateEntity | ClimateEntity[];

export type Floor = string;

/**
 * @TJS-pattern ^geo_location\.(?!_)[\da-z_]+(?<!_)$
 */
export type GeoLocationEntity = string;

/**
 * @TJS-pattern ^geo_location\.(?!_)[\da-z_]+(?<!_)\s?(?:,\s?geo_location\.(?!_)[\da-z_]+(?<!_))*$
 * @items.pattern ^geo_location\.(?!_)[\da-z_]+(?<!_)$
 */
export type GeoLocationEntities = GeoLocationEntity | GeoLocationEntity[];

/**
 * @TJS-pattern ^humidifier\.(?!_)[\da-z_]+(?<!_)$
 */
export type HumidifierEntity = string;

/**
 * @TJS-pattern ^humidifier\.(?!_)[\da-z_]+(?<!_)\s?(?:,\s?humidifier\.(?!_)[\da-z_]+(?<!_))*$
 * @items.pattern ^humidifier\.(?!_)[\da-z_]+(?<!_)$
 */
export type HumidifierEntities = HumidifierEntity | HumidifierEntity[];

/**
 * @TJS-pattern ^input_(?:select|text|number|boolean|datetime)\.(?!_)[\da-z_]+(?<!_)$"
 */
export type InputEntity = string;

/**
 * @TJS-pattern ^input_(?:select|text|number|boolean|datetime)\.(?!_)[\da-z_]+(?<!_)\s?(?:,\s?input_(?:select|text|number|boolean|datetime)\.(?!_)[\da-z_]+(?<!_))*$
 * @items.pattern ^input_(?:select|text|number|boolean|datetime)\.(?!_)[\da-z_]+(?<!_)$
 */
export type InputEntities = InputEntity | InputEntity[];

/**
 * @TJS-pattern ^input_datetime\.(?!_)[\da-z_]+(?<!_)$
 */
export type InputDatetimeEntity = string;

/**
 * @TJS-pattern ^input_datetime\.(?!_)[\da-z_]+(?<!_)\s?(?:,\s?input_datetime\.(?!_)[\da-z_]+(?<!_))*$
 * @items.pattern ^input_datetime\.(?!_)[\da-z_]+(?<!_)$
 */
export type InputDatetimeEntities = InputDatetimeEntity | InputDatetimeEntity[];

/**
 * @TJS-pattern ^input_number\.(?!_)[\da-z_]+(?<!_)$
 */
export type InputNumberEntity = string;

/**
 * @TJS-pattern ^input_number\.(?!_)[\da-z_]+(?<!_)\s?(?:,\s?input_number\.(?!_)[\da-z_]+(?<!_))*$
 * @items.pattern ^input_number\.(?!_)[\da-z_]+(?<!_)$
 */
export type InputNumberEntities = InputNumberEntity | InputNumberEntity[];

export type Label = string;

/**
 * @TJS-pattern ^light\.(?!_)[\da-z_]+(?<!_)$
 */
export type LightEntity = string;

/**
 * @TJS-pattern ^light\.(?!_)[\da-z_]+(?<!_)\s?(?:,\s?light\.(?!_)[\da-z_]+(?<!_))*$
 * @items.pattern ^light\.(?!_)[\da-z_]+(?<!_)$
 */
export type LightEntities = LightEntity | LightEntity[];

/**
 * @TJS-pattern ^media_player\.(?!_)[\da-z_]+(?<!_)$
 */
export type MediaPlayerEntity = string;

/**
 * @TJS-pattern ^media_player\.(?!_)[\da-z_]+(?<!_)\s?(?:,\s?media_player\.(?!_)[\da-z_]+(?<!_))*$
 * @items.pattern ^media_player\.(?!_)[\da-z_]+(?<!_)$
 */
export type MediaPlayerEntities = MediaPlayerEntity | MediaPlayerEntity[];

/**
 * @TJS-pattern ^number\.(?!_)[\da-z_]+(?<!_)$
 */
export type NumberEntity = string;

/**
 * @TJS-pattern ^number\.(?!_)[\da-z_]+(?<!_)\s?(?:,\s?number\.(?!_)[\da-z_]+(?<!_))*$
 * @items.pattern ^number\.(?!_)[\da-z_]+(?<!_)$
 */
export type NumberEntities = NumberEntity | NumberEntity[];

/**
 * @TJS-pattern ^person\.(?!_)[\da-z_]+(?<!_)$
 */
export type PersonEntity = string;

/**
 * @TJS-pattern ^person\.(?!_)[\da-z_]+(?<!_)\s?(?:,\s?person\.(?!_)[\da-z_]+(?<!_))*$
 * @items.pattern ^person\.(?!_)[\da-z_]+(?<!_)$
 */
export type PersonEntities = PersonEntity | PersonEntity[];

/**
 * @TJS-pattern ^plant\.(?!_)[\da-z_]+(?<!_)$
 */
export type PlantEntity = string;

/**
 * @TJS-pattern ^plant\.(?!_)[\da-z_]+(?<!_)\s?(?:,\s?plant\.(?!_)[\da-z_]+(?<!_))*$
 * @items.pattern ^plant\.(?!_)[\da-z_]+(?<!_)$
 */
export type PlantEntities = PlantEntity | PlantEntity[];

/**
 * @TJS-pattern ^scene\.(?!_)[\da-z_]+(?<!_)$
 */
export type SceneEntity = string;

/**
 * @TJS-pattern ^scene\.(?!_)[\da-z_]+(?<!_)\s?(?:,\s?scene\.(?!_)[\da-z_]+(?<!_))*$
 * @items.pattern ^scene\.(?!_)[\da-z_]+(?<!_)$
 */
export type SceneEntities = SceneEntity | SceneEntity[];

/**
 * @TJS-pattern ^sensor\.(?!_)[\da-z_]+(?<!_)$
 */
export type SensorEntity = string;

/**
 * @TJS-pattern ^sensor\.(?!_)[\da-z_]+(?<!_)\s?(?:,\s?sensor\.(?!_)[\da-z_]+(?<!_))*$
 * @items.pattern ^sensor\.(?!_)[\da-z_]+(?<!_)$
 */
export type SensorEntities = SensorEntity | SensorEntity[];

/**
 * @TJS-pattern ^weather\.(?!_)[\da-z_]+(?<!_)$
 */
export type WeatherEntity = string;

/**
 * @TJS-pattern ^weather\.(?!_)[\da-z_]+(?<!_)\s?(?:,\s?weather\.(?!_)[\da-z_]+(?<!_))*$
 * @items.pattern ^weather\.(?!_)[\da-z_]+(?<!_)$
 */
export type WeatherEntities = WeatherEntity | WeatherEntity[];

/**
 * @TJS-pattern ^zone\.(?!_)[\da-z_]+(?<!_)$
 */
export type ZoneEntity = string;

/**
 * @TJS-pattern ^zone\.(?!_)[\da-z_]+(?<!_)\s?(?:,\s?zone\.(?!_)[\da-z_]+(?<!_))*$
 * @items.pattern ^zone\.(?!_)[\da-z_]+(?<!_)$
 */
export type ZoneEntities = ZoneEntity | ZoneEntity[];

/**
 * @TJS-pattern ^\!include\s.+\.y?aml$
 */
export type Include = string;

/**
 * @TJS-pattern ^\!(include_dir(_merge)?_list\s.+(?<!\.yaml|\.yml)|include\s.+\.y?aml)$
 */
export type IncludeList = string;

/**
 * @TJS-pattern ^\!(include_dir(_merge)?_named\s.+(?<!\.yaml|\.yml)|include\s.+\.y?aml)$
 */
export type IncludeNamed = string;

/**
 * @TJS-type integer
 */
export type Integer = number;

/**
 * @TJS-type integer
 * @minimum 0
 */
export type PositiveInteger = number;

/**
 * @TJS-type integer
 * @minimum 1
 * @maximum 65535
 */
export type Port = number;

export type State = boolean | number | string;
export type Template = string;

/**
 * Dynamic template must contain Jinja
 *
 * @TJS-pattern \{(?:[%\{#])
 */
export type DynamicTemplate = string;

/**
 * @TJS-pattern ^(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)$
 */
export type Time = string;

/**
 * @TJS-pattern ^(?:[01]\d|2[0123]):(?:[012345]\d)(:(?:[012345]\d))?$
 * @items.pattern ^(?:[01]\d|2[0123]):(?:[012345]\d)(:(?:[012345]\d))?$
 */
export type Times = Time | Time[];

export type TimePeriod = string | TimePeriodSeconds | TimePeriodMap;

export interface TimePeriodMap {
  /**
   * Number of days. This must be a number.
   */
  days?: Integer | Template;
  /**
   * Number of hours. This must be a number.
   */
  hours?: Integer | Template;

  /**
   * Number of milliseconds. This must be a number.
   */
  milliseconds?: Integer | Template;

  /**
   * Number of minutes. This must be a number.
   */
  minutes?: Integer | Template;

  /**
   * Number of seconds. This must be a number.
   */
  seconds?: Integer | Template;
}

export type TimePeriodSeconds = number;

export type Currency =
  | "AED"
  | "AFN"
  | "ALL"
  | "AMD"
  | "ANG"
  | "AOA"
  | "ARS"
  | "AUD"
  | "AWG"
  | "AZN"
  | "BAM"
  | "BBD"
  | "BDT"
  | "BGN"
  | "BHD"
  | "BIF"
  | "BMD"
  | "BND"
  | "BOB"
  | "BRL"
  | "BSD"
  | "BTN"
  | "BWP"
  | "BYR"
  | "BZD"
  | "CAD"
  | "CDF"
  | "CHF"
  | "CLP"
  | "CNY"
  | "COP"
  | "CRC"
  | "CUP"
  | "CVE"
  | "CZK"
  | "DJF"
  | "DKK"
  | "DOP"
  | "DZD"
  | "EGP"
  | "ERN"
  | "ETB"
  | "EUR"
  | "FJD"
  | "FKP"
  | "GBP"
  | "GEL"
  | "GHS"
  | "GIP"
  | "GMD"
  | "GNF"
  | "GTQ"
  | "GYD"
  | "HKD"
  | "HNL"
  | "HRK"
  | "HTG"
  | "HUF"
  | "IDR"
  | "ILS"
  | "INR"
  | "IQD"
  | "IRR"
  | "ISK"
  | "JMD"
  | "JOD"
  | "JPY"
  | "KES"
  | "KGS"
  | "KHR"
  | "KMF"
  | "KPW"
  | "KRW"
  | "KWD"
  | "KYD"
  | "KZT"
  | "LAK"
  | "LBP"
  | "LKR"
  | "LRD"
  | "LSL"
  | "LTL"
  | "LYD"
  | "MAD"
  | "MDL"
  | "MGA"
  | "MKD"
  | "MMK"
  | "MNT"
  | "MOP"
  | "MRO"
  | "MUR"
  | "MVR"
  | "MWK"
  | "MXN"
  | "MYR"
  | "MZN"
  | "NAD"
  | "NGN"
  | "NIO"
  | "NOK"
  | "NPR"
  | "NZD"
  | "OMR"
  | "PAB"
  | "PEN"
  | "PGK"
  | "PHP"
  | "PKR"
  | "PLN"
  | "PYG"
  | "QAR"
  | "RON"
  | "RSD"
  | "RUB"
  | "RWF"
  | "SAR"
  | "SBD"
  | "SCR"
  | "SDG"
  | "SEK"
  | "SGD"
  | "SHP"
  | "SLL"
  | "SOS"
  | "SRD"
  | "SSP"
  | "STD"
  | "SYP"
  | "SZL"
  | "THB"
  | "TJS"
  | "TMT"
  | "TND"
  | "TOP"
  | "TRY"
  | "TTD"
  | "TWD"
  | "TZS"
  | "UAH"
  | "UGX"
  | "USD"
  | "UYU"
  | "UZS"
  | "VEF"
  | "VND"
  | "VUV"
  | "WST"
  | "XAF"
  | "XCD"
  | "XOF"
  | "XPF"
  | "YER"
  | "ZAR"
  | "ZMK"
  | "ZWL";

export type LanguageTags =
  | "af"
  | "ar"
  | "bg"
  | "bn"
  | "bs"
  | "ca"
  | "cs"
  | "cy"
  | "da"
  | "de"
  | "el"
  | "en"
  | "en-GB"
  | "eo"
  | "es"
  | "es-419"
  | "et"
  | "eu"
  | "fa"
  | "fi"
  | "fr"
  | "fy"
  | "gl"
  | "gsw"
  | "he"
  | "hi"
  | "hr"
  | "hu"
  | "hy"
  | "id"
  | "is"
  | "it"
  | "ja"
  | "ka"
  | "ko"
  | "lb"
  | "lt"
  | "lv"
  | "ml"
  | "nb"
  | "nl"
  | "nn"
  | "pl"
  | "pt"
  | "pt-BR"
  | "ro"
  | "ru"
  | "sk"
  | "sl"
  | "sr"
  | "sr-Latn"
  | "sv"
  | "ta"
  | "te"
  | "th"
  | "tr"
  | "uk"
  | "ur"
  | "vi"
  | "zh-Hans"
  | "zh-Hant";

export type CountryTags =
  | "AD"
  | "AE"
  | "AF"
  | "AG"
  | "AI"
  | "AL"
  | "AM"
  | "AO"
  | "AQ"
  | "AR"
  | "AS"
  | "AT"
  | "AU"
  | "AW"
  | "AX"
  | "AZ"
  | "BA"
  | "BB"
  | "BD"
  | "BE"
  | "BF"
  | "BG"
  | "BH"
  | "BI"
  | "BJ"
  | "BL"
  | "BM"
  | "BN"
  | "BO"
  | "BQ"
  | "BR"
  | "BS"
  | "BT"
  | "BV"
  | "BW"
  | "BY"
  | "BZ"
  | "CA"
  | "CC"
  | "CD"
  | "CF"
  | "CG"
  | "CH"
  | "CI"
  | "CK"
  | "CL"
  | "CM"
  | "CN"
  | "CO"
  | "CR"
  | "CU"
  | "CV"
  | "CW"
  | "CX"
  | "CY"
  | "CZ"
  | "DE"
  | "DJ"
  | "DK"
  | "DM"
  | "DO"
  | "DZ"
  | "EC"
  | "EE"
  | "EG"
  | "EH"
  | "ER"
  | "ES"
  | "ET"
  | "FI"
  | "FJ"
  | "FK"
  | "FM"
  | "FO"
  | "FR"
  | "GA"
  | "GB"
  | "GD"
  | "GE"
  | "GF"
  | "GG"
  | "GH"
  | "GI"
  | "GL"
  | "GM"
  | "GN"
  | "GP"
  | "GQ"
  | "GR"
  | "GS"
  | "GT"
  | "GU"
  | "GW"
  | "GY"
  | "HK"
  | "HM"
  | "HN"
  | "HR"
  | "HT"
  | "HU"
  | "ID"
  | "IE"
  | "IL"
  | "IM"
  | "IN"
  | "IO"
  | "IQ"
  | "IR"
  | "IS"
  | "IT"
  | "JE"
  | "JM"
  | "JO"
  | "JP"
  | "KE"
  | "KG"
  | "KH"
  | "KI"
  | "KM"
  | "KN"
  | "KP"
  | "KR"
  | "KW"
  | "KY"
  | "KZ"
  | "LA"
  | "LB"
  | "LC"
  | "LI"
  | "LK"
  | "LR"
  | "LS"
  | "LT"
  | "LU"
  | "LV"
  | "LY"
  | "MA"
  | "MC"
  | "MD"
  | "ME"
  | "MF"
  | "MG"
  | "MH"
  | "MK"
  | "ML"
  | "MM"
  | "MN"
  | "MO"
  | "MP"
  | "MQ"
  | "MR"
  | "MS"
  | "MT"
  | "MU"
  | "MV"
  | "MW"
  | "MX"
  | "MY"
  | "MZ"
  | "NA"
  | "NC"
  | "NE"
  | "NF"
  | "NG"
  | "NI"
  | "NL"
  | "NO"
  | "NP"
  | "NR"
  | "NU"
  | "NZ"
  | "OM"
  | "PA"
  | "PE"
  | "PF"
  | "PG"
  | "PH"
  | "PK"
  | "PL"
  | "PM"
  | "PN"
  | "PR"
  | "PS"
  | "PT"
  | "PW"
  | "PY"
  | "QA"
  | "RE"
  | "RO"
  | "RS"
  | "RU"
  | "RW"
  | "SA"
  | "SB"
  | "SC"
  | "SD"
  | "SE"
  | "SG"
  | "SH"
  | "SI"
  | "SJ"
  | "SK"
  | "SL"
  | "SM"
  | "SN"
  | "SO"
  | "SR"
  | "SS"
  | "ST"
  | "SV"
  | "SX"
  | "SY"
  | "SZ"
  | "TC"
  | "TD"
  | "TF"
  | "TG"
  | "TH"
  | "TJ"
  | "TK"
  | "TL"
  | "TM"
  | "TN"
  | "TO"
  | "TR"
  | "TT"
  | "TV"
  | "TW"
  | "TZ"
  | "UA"
  | "UG"
  | "UM"
  | "US"
  | "UY"
  | "UZ"
  | "VA"
  | "VC"
  | "VE"
  | "VG"
  | "VI"
  | "VN"
  | "VU"
  | "WF"
  | "WS"
  | "YE"
  | "YT"
  | "ZA"
  | "ZM"
  | "ZW";

export type TimeZone =
  | "Africa/Abidjan"
  | "Africa/Accra"
  | "Africa/Addis_Ababa"
  | "Africa/Algiers"
  | "Africa/Asmara"
  | "Africa/Asmera"
  | "Africa/Bamako"
  | "Africa/Bangui"
  | "Africa/Banjul"
  | "Africa/Bissau"
  | "Africa/Blantyre"
  | "Africa/Brazzaville"
  | "Africa/Bujumbura"
  | "Africa/Cairo"
  | "Africa/Casablanca"
  | "Africa/Ceuta"
  | "Africa/Conakry"
  | "Africa/Dakar"
  | "Africa/Dar_es_Salaam"
  | "Africa/Djibouti"
  | "Africa/Douala"
  | "Africa/El_Aaiun"
  | "Africa/Freetown"
  | "Africa/Gaborone"
  | "Africa/Harare"
  | "Africa/Johannesburg"
  | "Africa/Juba"
  | "Africa/Kampala"
  | "Africa/Khartoum"
  | "Africa/Kigali"
  | "Africa/Kinshasa"
  | "Africa/Lagos"
  | "Africa/Libreville"
  | "Africa/Lome"
  | "Africa/Luanda"
  | "Africa/Lubumbashi"
  | "Africa/Lusaka"
  | "Africa/Malabo"
  | "Africa/Maputo"
  | "Africa/Maseru"
  | "Africa/Mbabane"
  | "Africa/Mogadishu"
  | "Africa/Monrovia"
  | "Africa/Nairobi"
  | "Africa/Ndjamena"
  | "Africa/Niamey"
  | "Africa/Nouakchott"
  | "Africa/Ouagadougou"
  | "Africa/Porto-Novo"
  | "Africa/Sao_Tome"
  | "Africa/Timbuktu"
  | "Africa/Tripoli"
  | "Africa/Tunis"
  | "Africa/Windhoek"
  | "America/Adak"
  | "America/Anchorage"
  | "America/Anguilla"
  | "America/Antigua"
  | "America/Araguaina"
  | "America/Argentina/Buenos_Aires"
  | "America/Argentina/Catamarca"
  | "America/Argentina/ComodRivadavia"
  | "America/Argentina/Cordoba"
  | "America/Argentina/Jujuy"
  | "America/Argentina/La_Rioja"
  | "America/Argentina/Mendoza"
  | "America/Argentina/Rio_Gallegos"
  | "America/Argentina/Salta"
  | "America/Argentina/San_Juan"
  | "America/Argentina/San_Luis"
  | "America/Argentina/Tucuman"
  | "America/Argentina/Ushuaia"
  | "America/Aruba"
  | "America/Asuncion"
  | "America/Atikokan"
  | "America/Atka"
  | "America/Bahia"
  | "America/Bahia_Banderas"
  | "America/Barbados"
  | "America/Belem"
  | "America/Belize"
  | "America/Blanc-Sablon"
  | "America/Boa_Vista"
  | "America/Bogota"
  | "America/Boise"
  | "America/Buenos_Aires"
  | "America/Cambridge_Bay"
  | "America/Campo_Grande"
  | "America/Cancun"
  | "America/Caracas"
  | "America/Catamarca"
  | "America/Cayenne"
  | "America/Cayman"
  | "America/Chicago"
  | "America/Chihuahua"
  | "America/Coral_Harbour"
  | "America/Cordoba"
  | "America/Costa_Rica"
  | "America/Creston"
  | "America/Cuiaba"
  | "America/Curacao"
  | "America/Danmarkshavn"
  | "America/Dawson"
  | "America/Dawson_Creek"
  | "America/Denver"
  | "America/Detroit"
  | "America/Dominica"
  | "America/Edmonton"
  | "America/Eirunepe"
  | "America/El_Salvador"
  | "America/Ensenada"
  | "America/Fort_Nelson"
  | "America/Fort_Wayne"
  | "America/Fortaleza"
  | "America/Glace_Bay"
  | "America/Godthab"
  | "America/Goose_Bay"
  | "America/Grand_Turk"
  | "America/Grenada"
  | "America/Guadeloupe"
  | "America/Guatemala"
  | "America/Guayaquil"
  | "America/Guyana"
  | "America/Halifax"
  | "America/Havana"
  | "America/Hermosillo"
  | "America/Indiana/Indianapolis"
  | "America/Indiana/Knox"
  | "America/Indiana/Marengo"
  | "America/Indiana/Petersburg"
  | "America/Indiana/Tell_City"
  | "America/Indiana/Vevay"
  | "America/Indiana/Vincennes"
  | "America/Indiana/Winamac"
  | "America/Indianapolis"
  | "America/Inuvik"
  | "America/Iqaluit"
  | "America/Jamaica"
  | "America/Jujuy"
  | "America/Juneau"
  | "America/Kentucky/Louisville"
  | "America/Kentucky/Monticello"
  | "America/Knox_IN"
  | "America/Kralendijk"
  | "America/La_Paz"
  | "America/Lima"
  | "America/Los_Angeles"
  | "America/Louisville"
  | "America/Lower_Princes"
  | "America/Maceio"
  | "America/Managua"
  | "America/Manaus"
  | "America/Marigot"
  | "America/Martinique"
  | "America/Matamoros"
  | "America/Mazatlan"
  | "America/Mendoza"
  | "America/Menominee"
  | "America/Merida"
  | "America/Metlakatla"
  | "America/Mexico_City"
  | "America/Miquelon"
  | "America/Moncton"
  | "America/Monterrey"
  | "America/Montevideo"
  | "America/Montreal"
  | "America/Montserrat"
  | "America/Nassau"
  | "America/New_York"
  | "America/Nipigon"
  | "America/Nome"
  | "America/Noronha"
  | "America/North_Dakota/Beulah"
  | "America/North_Dakota/Center"
  | "America/North_Dakota/New_Salem"
  | "America/Ojinaga"
  | "America/Panama"
  | "America/Pangnirtung"
  | "America/Paramaribo"
  | "America/Phoenix"
  | "America/Port-au-Prince"
  | "America/Port_of_Spain"
  | "America/Porto_Acre"
  | "America/Porto_Velho"
  | "America/Puerto_Rico"
  | "America/Punta_Arenas"
  | "America/Rainy_River"
  | "America/Rankin_Inlet"
  | "America/Recife"
  | "America/Regina"
  | "America/Resolute"
  | "America/Rio_Branco"
  | "America/Rosario"
  | "America/Santa_Isabel"
  | "America/Santarem"
  | "America/Santiago"
  | "America/Santo_Domingo"
  | "America/Sao_Paulo"
  | "America/Scoresbysund"
  | "America/Shiprock"
  | "America/Sitka"
  | "America/St_Barthelemy"
  | "America/St_Johns"
  | "America/St_Kitts"
  | "America/St_Lucia"
  | "America/St_Thomas"
  | "America/St_Vincent"
  | "America/Swift_Current"
  | "America/Tegucigalpa"
  | "America/Thule"
  | "America/Thunder_Bay"
  | "America/Tijuana"
  | "America/Toronto"
  | "America/Tortola"
  | "America/Vancouver"
  | "America/Virgin"
  | "America/Whitehorse"
  | "America/Winnipeg"
  | "America/Yakutat"
  | "America/Yellowknife"
  | "Antarctica/Casey"
  | "Antarctica/Davis"
  | "Antarctica/DumontDUrville"
  | "Antarctica/Macquarie"
  | "Antarctica/Mawson"
  | "Antarctica/McMurdo"
  | "Antarctica/Palmer"
  | "Antarctica/Rothera"
  | "Antarctica/South_Pole"
  | "Antarctica/Syowa"
  | "Antarctica/Troll"
  | "Antarctica/Vostok"
  | "Arctic/Longyearbyen"
  | "Asia/Aden"
  | "Asia/Almaty"
  | "Asia/Amman"
  | "Asia/Anadyr"
  | "Asia/Aqtau"
  | "Asia/Aqtobe"
  | "Asia/Ashgabat"
  | "Asia/Ashkhabad"
  | "Asia/Atyrau"
  | "Asia/Baghdad"
  | "Asia/Bahrain"
  | "Asia/Baku"
  | "Asia/Bangkok"
  | "Asia/Barnaul"
  | "Asia/Beirut"
  | "Asia/Bishkek"
  | "Asia/Brunei"
  | "Asia/Calcutta"
  | "Asia/Chita"
  | "Asia/Choibalsan"
  | "Asia/Chongqing"
  | "Asia/Chungking"
  | "Asia/Colombo"
  | "Asia/Dacca"
  | "Asia/Damascus"
  | "Asia/Dhaka"
  | "Asia/Dili"
  | "Asia/Dubai"
  | "Asia/Dushanbe"
  | "Asia/Famagusta"
  | "Asia/Gaza"
  | "Asia/Harbin"
  | "Asia/Hebron"
  | "Asia/Ho_Chi_Minh"
  | "Asia/Hong_Kong"
  | "Asia/Hovd"
  | "Asia/Irkutsk"
  | "Asia/Istanbul"
  | "Asia/Jakarta"
  | "Asia/Jayapura"
  | "Asia/Jerusalem"
  | "Asia/Kabul"
  | "Asia/Kamchatka"
  | "Asia/Karachi"
  | "Asia/Kashgar"
  | "Asia/Kathmandu"
  | "Asia/Katmandu"
  | "Asia/Khandyga"
  | "Asia/Kolkata"
  | "Asia/Krasnoyarsk"
  | "Asia/Kuala_Lumpur"
  | "Asia/Kuching"
  | "Asia/Kuwait"
  | "Asia/Macao"
  | "Asia/Macau"
  | "Asia/Magadan"
  | "Asia/Makassar"
  | "Asia/Manila"
  | "Asia/Muscat"
  | "Asia/Nicosia"
  | "Asia/Novokuznetsk"
  | "Asia/Novosibirsk"
  | "Asia/Omsk"
  | "Asia/Oral"
  | "Asia/Phnom_Penh"
  | "Asia/Pontianak"
  | "Asia/Pyongyang"
  | "Asia/Qatar"
  | "Asia/Qyzylorda"
  | "Asia/Rangoon"
  | "Asia/Riyadh"
  | "Asia/Saigon"
  | "Asia/Sakhalin"
  | "Asia/Samarkand"
  | "Asia/Seoul"
  | "Asia/Shanghai"
  | "Asia/Singapore"
  | "Asia/Srednekolymsk"
  | "Asia/Taipei"
  | "Asia/Tashkent"
  | "Asia/Tbilisi"
  | "Asia/Tehran"
  | "Asia/Tel_Aviv"
  | "Asia/Thimbu"
  | "Asia/Thimphu"
  | "Asia/Tokyo"
  | "Asia/Tomsk"
  | "Asia/Ujung_Pandang"
  | "Asia/Ulaanbaatar"
  | "Asia/Ulan_Bator"
  | "Asia/Urumqi"
  | "Asia/Ust-Nera"
  | "Asia/Vientiane"
  | "Asia/Vladivostok"
  | "Asia/Yakutsk"
  | "Asia/Yangon"
  | "Asia/Yekaterinburg"
  | "Asia/Yerevan"
  | "Atlantic/Azores"
  | "Atlantic/Bermuda"
  | "Atlantic/Canary"
  | "Atlantic/Cape_Verde"
  | "Atlantic/Faeroe"
  | "Atlantic/Faroe"
  | "Atlantic/Jan_Mayen"
  | "Atlantic/Madeira"
  | "Atlantic/Reykjavik"
  | "Atlantic/South_Georgia"
  | "Atlantic/St_Helena"
  | "Atlantic/Stanley"
  | "Australia/ACT"
  | "Australia/Adelaide"
  | "Australia/Brisbane"
  | "Australia/Broken_Hill"
  | "Australia/Canberra"
  | "Australia/Currie"
  | "Australia/Darwin"
  | "Australia/Eucla"
  | "Australia/Hobart"
  | "Australia/LHI"
  | "Australia/Lindeman"
  | "Australia/Lord_Howe"
  | "Australia/Melbourne"
  | "Australia/NSW"
  | "Australia/North"
  | "Australia/Perth"
  | "Australia/Queensland"
  | "Australia/South"
  | "Australia/Sydney"
  | "Australia/Tasmania"
  | "Australia/Victoria"
  | "Australia/West"
  | "Australia/Yancowinna"
  | "Brazil/Acre"
  | "Brazil/DeNoronha"
  | "Brazil/East"
  | "Brazil/West"
  | "CET"
  | "CST6CDT"
  | "Canada/Atlantic"
  | "Canada/Central"
  | "Canada/Eastern"
  | "Canada/Mountain"
  | "Canada/Newfoundland"
  | "Canada/Pacific"
  | "Canada/Saskatchewan"
  | "Canada/Yukon"
  | "Chile/Continental"
  | "Chile/EasterIsland"
  | "Cuba"
  | "EET"
  | "EST"
  | "EST5EDT"
  | "Egypt"
  | "Eire"
  | "Etc/GMT"
  | "Etc/GMT+0"
  | "Etc/GMT+1"
  | "Etc/GMT+10"
  | "Etc/GMT+11"
  | "Etc/GMT+12"
  | "Etc/GMT+2"
  | "Etc/GMT+3"
  | "Etc/GMT+4"
  | "Etc/GMT+5"
  | "Etc/GMT+6"
  | "Etc/GMT+7"
  | "Etc/GMT+8"
  | "Etc/GMT+9"
  | "Etc/GMT-0"
  | "Etc/GMT-1"
  | "Etc/GMT-10"
  | "Etc/GMT-11"
  | "Etc/GMT-12"
  | "Etc/GMT-13"
  | "Etc/GMT-14"
  | "Etc/GMT-2"
  | "Etc/GMT-3"
  | "Etc/GMT-4"
  | "Etc/GMT-5"
  | "Etc/GMT-6"
  | "Etc/GMT-7"
  | "Etc/GMT-8"
  | "Etc/GMT-9"
  | "Etc/GMT0"
  | "Etc/Greenwich"
  | "Etc/UCT"
  | "Etc/UTC"
  | "Etc/Universal"
  | "Etc/Zulu"
  | "Europe/Amsterdam"
  | "Europe/Andorra"
  | "Europe/Astrakhan"
  | "Europe/Athens"
  | "Europe/Belfast"
  | "Europe/Belgrade"
  | "Europe/Berlin"
  | "Europe/Bratislava"
  | "Europe/Brussels"
  | "Europe/Bucharest"
  | "Europe/Budapest"
  | "Europe/Busingen"
  | "Europe/Chisinau"
  | "Europe/Copenhagen"
  | "Europe/Dublin"
  | "Europe/Gibraltar"
  | "Europe/Guernsey"
  | "Europe/Helsinki"
  | "Europe/Isle_of_Man"
  | "Europe/Istanbul"
  | "Europe/Jersey"
  | "Europe/Kaliningrad"
  | "Europe/Kiev"
  | "Europe/Kirov"
  | "Europe/Lisbon"
  | "Europe/Ljubljana"
  | "Europe/London"
  | "Europe/Luxembourg"
  | "Europe/Madrid"
  | "Europe/Malta"
  | "Europe/Mariehamn"
  | "Europe/Minsk"
  | "Europe/Monaco"
  | "Europe/Moscow"
  | "Europe/Nicosia"
  | "Europe/Oslo"
  | "Europe/Paris"
  | "Europe/Podgorica"
  | "Europe/Prague"
  | "Europe/Riga"
  | "Europe/Rome"
  | "Europe/Samara"
  | "Europe/San_Marino"
  | "Europe/Sarajevo"
  | "Europe/Saratov"
  | "Europe/Simferopol"
  | "Europe/Skopje"
  | "Europe/Sofia"
  | "Europe/Stockholm"
  | "Europe/Tallinn"
  | "Europe/Tirane"
  | "Europe/Tiraspol"
  | "Europe/Ulyanovsk"
  | "Europe/Uzhgorod"
  | "Europe/Vaduz"
  | "Europe/Vatican"
  | "Europe/Vienna"
  | "Europe/Vilnius"
  | "Europe/Volgograd"
  | "Europe/Warsaw"
  | "Europe/Zagreb"
  | "Europe/Zaporozhye"
  | "Europe/Zurich"
  | "GB"
  | "GB-Eire"
  | "GMT"
  | "GMT+0"
  | "GMT-0"
  | "GMT0"
  | "Greenwich"
  | "HST"
  | "Hongkong"
  | "Iceland"
  | "Indian/Antananarivo"
  | "Indian/Chagos"
  | "Indian/Christmas"
  | "Indian/Cocos"
  | "Indian/Comoro"
  | "Indian/Kerguelen"
  | "Indian/Mahe"
  | "Indian/Maldives"
  | "Indian/Mauritius"
  | "Indian/Mayotte"
  | "Indian/Reunion"
  | "Iran"
  | "Israel"
  | "Jamaica"
  | "Japan"
  | "Kwajalein"
  | "Libya"
  | "MET"
  | "MST"
  | "MST7MDT"
  | "Mexico/BajaNorte"
  | "Mexico/BajaSur"
  | "Mexico/General"
  | "NZ"
  | "NZ-CHAT"
  | "Navajo"
  | "PRC"
  | "PST8PDT"
  | "Pacific/Apia"
  | "Pacific/Auckland"
  | "Pacific/Bougainville"
  | "Pacific/Chatham"
  | "Pacific/Chuuk"
  | "Pacific/Easter"
  | "Pacific/Efate"
  | "Pacific/Enderbury"
  | "Pacific/Fakaofo"
  | "Pacific/Fiji"
  | "Pacific/Funafuti"
  | "Pacific/Galapagos"
  | "Pacific/Gambier"
  | "Pacific/Guadalcanal"
  | "Pacific/Guam"
  | "Pacific/Honolulu"
  | "Pacific/Johnston"
  | "Pacific/Kiritimati"
  | "Pacific/Kosrae"
  | "Pacific/Kwajalein"
  | "Pacific/Majuro"
  | "Pacific/Marquesas"
  | "Pacific/Midway"
  | "Pacific/Nauru"
  | "Pacific/Niue"
  | "Pacific/Norfolk"
  | "Pacific/Noumea"
  | "Pacific/Pago_Pago"
  | "Pacific/Palau"
  | "Pacific/Pitcairn"
  | "Pacific/Pohnpei"
  | "Pacific/Ponape"
  | "Pacific/Port_Moresby"
  | "Pacific/Rarotonga"
  | "Pacific/Saipan"
  | "Pacific/Samoa"
  | "Pacific/Tahiti"
  | "Pacific/Tarawa"
  | "Pacific/Tongatapu"
  | "Pacific/Truk"
  | "Pacific/Wake"
  | "Pacific/Wallis"
  | "Pacific/Yap"
  | "Poland"
  | "Portugal"
  | "ROC"
  | "ROK"
  | "Singapore"
  | "Turkey"
  | "UCT"
  | "US/Alaska"
  | "US/Aleutian"
  | "US/Arizona"
  | "US/Central"
  | "US/East-Indiana"
  | "US/Eastern"
  | "US/Hawaii"
  | "US/Indiana-Starke"
  | "US/Michigan"
  | "US/Mountain"
  | "US/Pacific"
  | "US/Pacific-New"
  | "US/Samoa"
  | "UTC"
  | "Universal"
  | "W-SU"
  | "WET"
  | "Zulu";

export type UnitSystem = "metric" | "imperial";

/**
 * From: https://github.com/home-assistant/core/blob/dev/homeassistant/const.py
 */
export type TemperatureUnit = "°C" | "°F" | "K";

/**
 * From: https://github.com/home-assistant/core/blob/dev/homeassistant/const.py
 */
export type PressureUnit =
  | "Pa"
  | "hPa"
  | "kPa"
  | "bar"
  | "cbar"
  | "mbar"
  | "mmHg"
  | "inHg"
  | "psi";
export type WindSpeedUnit = "m/s" | "km/h" | "mph" | "mm/d" | "in/d" | "in/h";
export type VisibilityUnit =
  | "km"
  | "mi"
  | "ft"
  | "m"
  | "cm"
  | "mm"
  | "in"
  | "yd";
export type PrecipitationUnit =
  | "km"
  | "mi"
  | "ft"
  | "m"
  | "cm"
  | "mm"
  | "in"
  | "yd";

export type SupportedFeature =
  | SupportedFeatureAlarmControlPanel
  | SupportedFeatureCamera
  | SupportedFeatureClimate
  | SupportedFeatureCover
  | SupportedFeatureFan
  | SupportedFeatureLight
  | SupportedFeatureLock
  | SupportedFeatureUpdate
  | SupportedFeatureVacuum
  | SupportedFeatureWeather;

/**
 * From: https://github.com/home-assistant/core/blob/dev/homeassistant/components/alarm_control_panel/const.py
 */
export type SupportedFeatureAlarmControlPanel =
  | "camera.AlarmControlPanelEntityFeature.ARM_HOME"
  | "camera.AlarmControlPanelEntityFeature.ARM_AWAY"
  | "camera.AlarmControlPanelEntityFeature.ARM_NIGHT"
  | "camera.AlarmControlPanelEntityFeature.TRIGGER"
  | "camera.AlarmControlPanelEntityFeature.ARM_CUSTOM_BYPASS"
  | "camera.AlarmControlPanelEntityFeature.ARM_VACATION";

/**
 * From: https://github.com/home-assistant/core/blob/dev/homeassistant/components/camera/__init__.py
 */
export type SupportedFeatureCamera =
  | "camera.CameraEntityFeature.ON_OFF"
  | "camera.CameraEntityFeature.STREAM";

/**
 * From: https://github.com/home-assistant/core/blob/dev/homeassistant/components/climate/const.py
 */
export type SupportedFeatureClimate =
  | "climate.ClimateEntityFeature.TARGET_TEMPERATURE"
  | "climate.ClimateEntityFeature.TARGET_TEMPERATURE_RANGE"
  | "climate.ClimateEntityFeature.TARGET_HUMIDITY"
  | "climate.ClimateEntityFeature.FAN_MODE"
  | "climate.ClimateEntityFeature.PRESET_MODE"
  | "climate.ClimateEntityFeature.SWING_MODE"
  | "climate.ClimateEntityFeature.AUX_HEAT"
  | "climate.ClimateEntityFeature.TURN_OFF"
  | "climate.ClimateEntityFeature.TURN_ON"
  | "climate.ClimateEntityFeature.SWING_HORIZONTAL_MODE";

/**
 * From: https://github.com/home-assistant/core/blob/dev/homeassistant/components/cover/__init__.py
 */
export type SupportedFeatureCover =
  | "cover.CoverEntityFeature.OPEN"
  | "cover.CoverEntityFeature.CLOSE"
  | "cover.CoverEntityFeature.SET_POSITION"
  | "cover.CoverEntityFeature.STOP"
  | "cover.CoverEntityFeature.OPEN_TILT"
  | "cover.CoverEntityFeature.CLOSE_TILT"
  | "cover.CoverEntityFeature.STOP_TILT"
  | "cover.CoverEntityFeature.SET_TILT_POSITION";

/**
 * From: https://github.com/home-assistant/core/blob/dev/homeassistant/components/fan/__init__.py
 */
export type SupportedFeatureFan =
  | "fan.FanEntityFeature.SET_SPEED"
  | "fan.FanEntityFeature.OSCILLATE"
  | "fan.FanEntityFeature.DIRECTION"
  | "fan.FanEntityFeature.PRESET_MODE"
  | "fan.FanEntityFeature.TURN_OFF"
  | "fan.FanEntityFeature.TURN_ON";

/**
 * From: https://github.com/home-assistant/core/blob/dev/homeassistant/components/light/const.py
 */
export type SupportedFeatureLight =
  | "light.LightEntityFeature.EFFECT"
  | "light.LightEntityFeature.FLASH"
  | "light.LightEntityFeature.TRANSITION";

/**
 * From: https://github.com/home-assistant/core/blob/dev/homeassistant/components/lock/__init__.py
 */
export type SupportedFeatureLock = "lock.LockEntityFeature.OPEN";

/**
 * From: https://github.com/home-assistant/core/blob/dev/homeassistant/components/update/const.py
 */
export type SupportedFeatureUpdate =
  | "update.UpdateEntityFeature.INSTALL"
  | "update.UpdateEntityFeature.SPECIFIC_VERSION"
  | "update.UpdateEntityFeature.PROGRESS"
  | "update.UpdateEntityFeature.BACKUP"
  | "update.UpdateEntityFeature.RELEASE_NOTES";

/**
 * From: https://github.com/home-assistant/core/blob/dev/homeassistant/components/vacuum/__init__.py
 */
export type SupportedFeatureVacuum =
  | "vacuum.VacuumEntityFeature.TURN_ON" /**@deprecated not supported by StateVacuumEntity */
  | "vacuum.VacuumEntityFeature.TURN_OFF" /**@deprecated not supported by StateVacuumEntity */
  | "vacuum.VacuumEntityFeature.PAUSE"
  | "vacuum.VacuumEntityFeature.STOP"
  | "vacuum.VacuumEntityFeature.RETURN_HOME"
  | "vacuum.VacuumEntityFeature.FAN_SPEED"
  | "vacuum.VacuumEntityFeature.BATTERY"
  | "vacuum.VacuumEntityFeature.STATUS" /**@deprecated not supported by StateVacuumEntity */
  | "vacuum.VacuumEntityFeature.SEND_COMMAND"
  | "vacuum.VacuumEntityFeature.LOCATE"
  | "vacuum.VacuumEntityFeature.CLEAN_SPOT"
  | "vacuum.VacuumEntityFeature.MAP"
  | "vacuum.VacuumEntityFeature.STATE"
  | "vacuum.VacuumEntityFeature.START";

/**
 * From: https://github.com/home-assistant/core/blob/dev/homeassistant/components/weather/const.py
 */
export type SupportedFeatureWeather =
  | "weather.WeatherEntityFeature.FORECAST_DAILY"
  | "weather.WeatherEntityFeature.FORECAST_HOURLY"
  | "weather.WeatherEntityFeature.FORECAST_TWICE_DAILY";
