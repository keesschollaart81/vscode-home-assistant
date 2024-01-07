/**
 * Update integration
 * Source: https://github.com/home-assistant/core/blob/dev/homeassistant/components/update/__init__.py
 */

export type Domain = "update";
export type SupportedFeature =
  | "update.UpdateEntityFeature.INSTALL"
  | "update.UpdateEntityFeature.SPECIFIC_VERSION"
  | "update.UpdateEntityFeature.PROGRESS"
  | "update.UpdateEntityFeature.BACKUP"
  | "update.UpdateEntityFeature.RELEASE_NOTES";
