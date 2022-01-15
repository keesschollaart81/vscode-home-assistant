/**
 * https://jinja.palletsprojects.com/en/latest/templates/#list-of-builtin-filters
 *
 * Documentation: https://jinja.palletsprojects.com/en/latest/templates/#jinja-filters.${filter_name}
 */
export const BuiltinFilters = [
  "abs",
  "float",
  "lower",
  "round",
  "tojson",
  "attr",
  "forceescape",
  "map",
  "safe",
  "trim",
  "batch",
  "format",
  "max",
  "select",
  "truncate",
  "capitalize",
  "groupby",
  "min",
  "selectattr",
  "unique",
  "center",
  "indent",
  "pprint",
  "slice",
  "upper",
  "default",
  "int",
  "random",
  "sort",
  "urlencode",
  "dictsort",
  "join",
  "reject",
  "string",
  "urlize",
  "escape",
  "last",
  "rejectattr",
  "striptags",
  "wordcount",
  "filesizeformat",
  "length",
  "replace",
  "sum",
  "wordwrap",
  "first",
  "list",
  "reverse",
  "title",
  "xmlattr",
];

export interface Filter {
  /**
   * Filter `round(precision, method, default)` will convert the input to a number and round it to `precision` decimals. Round has four modes and the default mode (with no mode specified) will round-to-even. If the input value can't be converted to a `float`, returns the `default` value, or if omitted the input value.
   */
  round?: string;

  /**
   * Filter `multiply(value)` will multiply the input by the value.
   */
  multiply?: string;

  /**
   * `log(value, base, default)` will take the logarithm of the input. When the base is omitted, it defaults to `e` - the natural logarithm. If `value` or `base` can't be converted to a `float`, returns the `default` value, or if omitted `value`.
   */
  log?: string;

  /**
   * `sin(value, default)` will return the sine of the input. If `value` can't be converted to a `float`, returns the `default` value, or if omitted `value`.
   */
  sin?: string;

  /**
   * `cos(value, default)` will return the cosine of the input. If `value` can't be converted to a `float`, returns the `default` value, or if omitted `value`.
   */
  cos?: string;

  /**
   * `tan(value, default)` will return the tangent of the input. If `value` can't be converted to a `float`, returns the `default` value, or if omitted `value`.
   */
  tan?: string;

  /**
   * `asin(value, default)` will return the arcus sine of the input. If `value` can't be converted to a `float`, returns the `default` value, or if omitted `value`.
   */
  asin?: string;

  /**
   * `acos(value, default)` will return the arcus cosine of the input. If `value` can't be converted to a `float`, returns the `default` value, or if omitted `value`.
   */
  acos?: string;

  /**
   * `atan(value, default)` will return the arcus tangent of the input. If `value` can't be converted to a `float`, returns the `default` value, or if omitted `value`.
   */
  atan?: string;

  /**
   * `atan2(y, x, default)` will return the four quadrant arcus tangent of y / x. If `y` or `x` can't be converted to a `float`, returns the `default` value, or if omitted `value`.
   */
  atan2?: string;

  /**
   * `sqrt(value, default)` will return the square root of the input. If `value` can't be converted to a `float`, returns the `default` value, or if omitted `value`.
   */
  sqrt?: string;

  /**
   * `as_datetime()` converts a string containing a timestamp, or valid UNIX timestamp, to a datetime object.
   */
  as_datetime?: string;

  /**
   * `as_timestamp(value, default)` converts datetime object or string to UNIX timestamp. If that fails, returns the `default` value, or if omitted `None`.
   */
  as_timestamp?: string;

  /**
   * `today_at(value)` converts a string containing a military time format to a datetime object with today's date in your time zone.
   */
  today_at?: string;

  /**
   * `as_local()` converts datetime object to local time.
   */
  as_local?: string;

  /**
   * Filter `timestamp_custom(format_string, local_time=True, default)` converts an UNIX timestamp to its string representation based on a custom format, the use of a local timezone is default. If that fails, returns the `default` value, or if omitted the unprocessed input value. Supports the standard Python time formatting options.
   */
  timestamp_custom?: string;

  /**
   * Filter `timestamp_local(default)` converts a UNIX timestamp to the ISO format string representation as date/time in your local timezone. If that fails, returns the `default` value, or if omitted the unprocessed input value. If a custom string format is needed in the string, use `timestamp_custom` instead.
   */
  timestamp_local?: string;

  /**
   * Filter `timestamp_utc(default)` converts a UNIX timestamp to the ISO format string representation representation as date/time in UTC timezone. If that fails, returns the `default` value, or if omitted the unprocessed input value. If a custom string format is needed in the string, use `timestamp_custom` instead.
   */
  timestamp_utc?: string;

  /**
   * The `to_json` filter serializes an object to a JSON string. In some cases, it may be necessary to format a JSON string for use with a webhook, as a parameter for command-line utilities or any number of other applications. This can be complicated in a template, especially when dealing with escaping special characters. Using the `to_json` filter, this is handled automatically. " + "Similarly to the Python equivalent, the filter accepts an `ensure_ascii` parameter, defaulting to `True`. If `ensure_ascii` is `True`, the output is guaranteed to have all incoming non-ASCII characters escaped. If `ensure_ascii` is false, these characters will be output as-is.
   */
  to_json?: string;

  /**
   * The `from_json` filter de-serializes a JSON string back into an object.
   */
  from_json?: string;

  is_defined?: string;

  /**
   * Will return the average value of the sequence.
   */
  average?: string;

  /**
   * Will return a random value from the sequence.
   */
  random?: string;

  /**
   * Will return a base64 encoded string.
   */
  base64_encode?: string;

  /**
   * Will return a base64 decoded string.
   */
  base64_decode?: string;

  /**
   * Will return the ordinal representation of the number.
   */
  ordinal?: string;

  /**
   * Test `string is match(find, ignorecase=False)` will match the find expression at the beginning of the string using regex.
   */
  regex_match?: string;

  /**
   * Filter `string|regex_replace(find='', replace='', ignorecase=False)` will replace the find expression with the replace string using regex.
   */
  regex_replace?: string;

  /**
   * Test `string is search(find, ignorecase=True)` will match the find expression anywhere in the string using regex.
   */
  regex_search?: string;

  /**
   * Filter `value | regex_findall(find='', ignorecase=False)` will find all regex matches of the find expression in `value` and return the array of matches.
   */
  regex_findall?: string;

  /**
   * Filter `value | regex_findall_index(find='', index=0, ignorecase=False)` will do the same as `regex_findall` and return the match at index.
   */
  regex_findall_index?: string;

  /**
   * Filter `value_one|bitwise_and(value_two)` perform a bitwise and(&) operation with two values.
   */
  bitwise_and?: string;

  /**
   * Filter `value_one|bitwise_or(value_two)` perform a bitwise or(|) operation with two values.
   */
  bitwise_or?: string;

  /**
   * Filter `value | pack(format_string)` will convert a native type to a `bytes` type object. This will call function `struct.pack(format_string, value)`. Returns `None` if an error occurs or when `format_string` is invalid.
   */
  pack?: string;

  /**
   * Filter `value | unpack(format_string, offset=0)` will try to convert a `bytes` object into a native Python object. The `offset` parameter defines the offset position in bytes from the start of the input `bytes` based buffer. This will call function `struct.unpack_from(format_string, value, offset=offset)`. Returns `None` if an error occurs or when `format_string` is invalid.
   */
  unpack?: string;

  /**
   * Filter `ord` will return for a string of length one an integer representing the Unicode code point of the character when the argument is a Unicode object, or the value of the byte when the argument is an 8-bit string.
   */
  ord?: string;

  /**
   * '`is_number` will return `True` if the input can be parsed by Python\'s `float` function and the parsed input is not `inf` or `nan`, in all other cases returns `False`. Note that a Python `bool` will return `True` but the strings `"True"` and `"False"` will both return `False`.'
   */
  is_number: string;

  /**
   * Filter `float` will return the input as a `float`.
   */
  float?: string;

  /**
   * Filter `int` will return the input as an `int`.
   */
  int?: string;

  /**
   * Filter `relative_time` converts datetime object to its human-friendly “age” string.
   */
  relative_time?: string;
}

export interface HassFilters {
  /**
   * `device_entities(device_id)` returns a list of entities that are associated with a given device ID.
   */
  device_entities?: string;

  /**
   * `device_id(entity_id)` returns the device ID for a given entity ID or device name.
   */
  device_id?: string;

  /**
   * `area_id(lookup_value)` returns the area ID for a given device ID, entity ID, or area name.
   */
  area_id?: string;

  /**
   * `area_name(lookup_value)` returns the area name for a given device ID, entity ID, or area ID.
   */
  area_name?: string;

  /**
   * `area_entities(area_name_or_id)` returns the list of entity IDs tied to a given area ID or name.
   */
  area_entities?: string;

  /**
   * `area_devices(area_name_or_id)` returns the list of device IDs tied to a given area ID or name.
   */
  area_devices?: string;

  /**
   * `integration_entities(integration)` returns a list of entities that are associated with a given integration, such as `hue` or `zwave_js`." + "`integration_entities(title)` if you have multiple instances set-up for an integration, you can also use the title you've set for the integration in case you only want to target a specific device bridge.
   */
  integration_entities?: string;

  /**
   * `closest()` will find the closest entity.
   */
  closest?: string;

  /**
   * The `expand` function and filter can be used to sort entities and expand groups. It outputs a sorted array of entities with no duplicates.
   */
  expand?: string;
}
