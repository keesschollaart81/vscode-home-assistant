/**
 * Support for custom Lovelace cards.
 *
 * By catching all `custom:*` and allowing additional properties, this
 * schema will match any custom card.
 */

/**
 * @TJS-additionalProperties true
 */
export interface Schema {
  /**
   * @TJS-pattern custom:(.*)$
   */
  type: string;
}
