/**
 * Documentation: https://jinja.palletsprojects.com/en/latest/templates/#jinja-globals.${global_name}
 */
export const BuiltinGlobals = ["range", "lipsum", "dict", "cycler", "joiner"];

/**
 * https://github.com/home-assistant/core/blob/dev/homeassistant/helpers/template.py
 */

export interface Globals {
  /**
   * `log(value, base, default)` will take the logarithm of the input. When the base is omitted, it defaults to `e` - the natural logarithm. If `value` or `base` can't be converted to a `float`, returns the `default` value, or if omitted `value`. Can also be used as a filter.
   */
  log?: string;

  /**
   * `sin(value, default)` will return the sine of the input. If `value` can't be converted to a `float`, returns the `default` value, or if omitted `value`. Can be used as a filter.
   */
  sin?: string;

  /**
   * `cos(value, default)` will return the cosine of the input. If `value` can't be converted to a `float`, returns the `default` value, or if omitted `value`. Can be used as a filter.
   */
  cos?: string;

  /**
   * `tan(value, default)` will return the tangent of the input. If `value` can't be converted to a `float`, returns the `default` value, or if omitted `value`. Can be used as a filter.
   */
  tan?: string;

  /**
   * `sqrt(value, default)` will return the square root of the input. If `value` can't be converted to a `float`, returns the `default` value, or if omitted `value`. Can be used as a filter.
   */
  sqrt?: string;

  /**
   * `pi` mathematical constant, approximately 3.14159.
   */
  pi?: string;

  /**
   * `tau` mathematical constant, approximately 6.28318.
   */
  tau?: string;

  /**
   * `e` mathematical constant, approximately 2.71828.
   */
  e?: string;

  /**
   * `asin(value, default)` will return the arcus sine of the input. If `value` can't be converted to a `float`, returns the `default` value, or if omitted `value`. Can be used as a filter.
   */
  asin?: string;

  /**
   * `acos(value, default)` will return the arcus cosine of the input. If `value` can't be converted to a `float`, returns the `default` value, or if omitted `value`. Can be used as a filter.
   */
  acos?: string;

  /**
   * `atan(value, default)` will return the arcus tangent of the input. If `value` can't be converted to a `float`, returns the `default` value, or if omitted `value`. Can be used as a filter.
   */
  atan?: string;

  /**
   * `atan2(y, x, default)` will return the four quadrant arcus tangent of y / x. If `y` or `x` can't be converted to a `float`, returns the `default` value, or if omitted `value`. Can be used as a filter.
   */
  atan2?: string;

  /**
   * `float(value, default)` function will attempt to convert the input to a `float`. If that fails, returns the `default` value, or if omitted `value`. " + "`float(default)` filter will attempt to convert the input to a `float`.  If that fails, returns the `default` value, or if omitted `0.0`.
   */
  float?: string;

  /**
   * `as_datetime()` converts a string containing a timestamp, or valid UNIX timestamp, to a datetime object.
   */
  as_datetime?: string;

  /**
   * `as_local()` converts datetime object to local time. This function also be used as a filter.
   */
  as_local?: string;

  /**
   * `as_timestamp(value, default)` converts datetime object or string to UNIX timestamp. If that fails, returns the `default` value, or if omitted `None`. This function also be used as a filter.
   */
  as_timestamp?: string;

  /**
   * `today_at(value)` converts a string containing a military time format to a datetime object with today's date in your time zone.
   */
  today_at?: string;

  /**
   * `relative_time` converts datetime object to its human-friendly “age” string. The age can be in second, minute, hour, day, month or year (but only the biggest unit is considered, e.g., if it's 2 days and 3 hours, “2 days” will be returned). Note that it only works for dates in the past.
   */
  relative_time?: string;

  /**
   * `timedelta` returns a timedelta object and accepts the same arguments as the Python `datetime.timedelta` function – days, seconds, microseconds, milliseconds, minutes, hours, weeks.
   */
  timedelta?: string;

  /**
   * `strptime(string, format)` parses a string based on a format and returns a datetime object. If that fails, returns the `default` value, or if omitted the unprocessed input value.
   */
  strptime?: string;

  /**
   * `ilter `urlencode` will convert an object to a percent-encoded ASCII text string (e.g., for HTTP requests using `application/x-www-form-urlencoded`).
   */
  urlencode?: string;

  /**
   * `ilter `[x, y, ...] | average` will return the average value of the sequence.
   */
  average?: string;

  /**
   * `ilter `[x, y, ...] | max` will obtain the largest item in a sequence.
   */
  max?: string;

  /**
   * `ilter `[x, y, ...] | min` will obtain the smallest item in a sequence.
   */
  min?: string;

  /**
   * `is_number` will return `True` if the input can be parsed by Python\'s `float` function and the parsed input is not `inf` or `nan`, in all other cases returns `False`. Note that a Python `bool` will return `True` but the strings `"True"` and `"False"` will both return `False`. Can be used as a filter.
   */
  is_number?: string;

  /**
   * ,
   */
  int?: string;

  /**
   * `unction `pack(value, format_string)` will convert a native type to a `bytes` type object. This will call function `struct.pack(format_string, value)`. Returns `None` if an error occurs or when `format_string` is invalid.
   */
  pack?: string;

  /**
   * `unction `unpack(value, format_string, offset=0)` will try to convert a `bytes` object into a native Python object. The `offset` parameter defines the offset position in bytes from the start of the input `bytes` based buffer. This will call function `struct.unpack_from(format_string, value, offset=offset)`. Returns `None` if an error occurs or when `format_string` is invalid.
   */
  unpack?: string;
}

export const tests = ["match", "search"];

export interface HassGlobals {
  // DEVICES
  /**
   * `device_entities(device_id)` returns a list of entities that are associated with a given device ID. Can also be used as a filter.
   */
  device_entities?: string;

  /**
   * `device_attr(device_or_entity_id, attr_name)` returns the value of attr_name for the given device or entity ID. Not supported in limited templates.
   */
  device_attr?: string;

  /**
   * `is_device_attr(device_or_entity_id, attr_name, attr_value)` returns whether the value of `attr_name` for the given device or entity ID matches `attr_value`. Not supported in limited templates.
   */
  is_device_attr?: string;

  /**
   * `device_id(entity_id)` returns the device ID for a given entity ID or device name. Can also be used as a filter.
   */
  device_id?: string;

  // AREAS
  /**
   * `area_id(lookup_value)` returns the area ID for a given device ID, entity ID, or area name. Can also be used as a filter.
   */
  area_id?: string;

  /**
   * `area_name(lookup_value)` returns the area name for a given device ID, entity ID, or area ID. Can also be used as a filter.
   */
  area_name?: string;

  /**
   * `area_entities(area_name_or_id)` returns the list of entity IDs tied to a given area ID or name. Can also be used as a filter.
   */
  area_entities?: string;

  /**
   * `area_devices(area_name_or_id)` returns the list of device IDs tied to a given area ID or name. Can also be used as a filter.
   */
  area_devices?: string;

  // INTEGRATIONS
  /**
   * `integration_entities(integration)` returns a list of entities that are associated with a given integration, such as `hue` or `zwave_js`." + "`integration_entities(title)` if you have multiple instances set-up for an integration, you can also use the title you've set for the integration in case you only want to target a specific device bridge.
   */
  integration_entities?: string;

  /**
   * `he `expand` function and filter can be used to sort entities and expand groups. It outputs a sorted array of entities with no duplicates.
   */
  expand?: string;

  // DISTANCE
  /**
   * `closest()` will find the closest entity.
   */
  closest?: string;

  /**
   * `distance()` will measure the distance in kilometers between home, entity, coordinates.
   */
  distance?: string;

  /**
   * `is_state('device_tracker.paulus', 'home')` will test if the given entity is the specified state.
   */
  is_state?: string;

  /**
   * `is_state_attr('device_tracker.paulus', 'battery', 40)` will test if the given entity attribute is the specified state (in this case, a numeric value). Note that the attribute can be `None` and you want to check if it is `None`, you need to use `state_attr('sensor.my_sensor', 'attr') == None`.
   */
  is_state_attr?: string;

  /**
   * `state_attr('device_tracker.paulus', 'battery')` will return the value of the attribute or None if it doesn't exist.
   */
  state_attr?: string;

  /**
   * `terating `states` will yield each state sorted alphabetically by entity ID.
   */
  states?: string;

  /**
   * `utcnow()` returns a datetime object of the current time in the UTC timezone.
   */
  utcnow?: string;

  /**
   * `now()` returns a datetime object that represents the current time in your time zone.
   */
  now?: string;

  /**
   * The incoming value parsed as JSON.
   */
  value_json?: string;

  /**
   * The incoming value.
   */
  value?: string;
}

export const hassGlobalsUnsupportedInLimited = [
  "closest",
  "distance",
  "expand",
  "is_state",
  "is_state_attr",
  "state_attr",
  "states",
  "utcnow",
  "now",
  "device_attr",
  "is_device_attr",
  "device_id",
  "area_id",
  "area_name",
];

export const hassFiltersUnsupportedInLimited = [
  "closest",
  "expand",
  "device_id",
  "area_id",
  "area_name",
];
