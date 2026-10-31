// Turns a saved personalization choice into the few categorical facts analytics
// is allowed to know about it.
//
// A saved background is reduced to its collection and, for curated images, its
// preset id. A personally chosen colour becomes a yes/no — the hex value is never
// sent — and a personal photograph is reported as "your photos" with no photo id
// and no URL.

import { CUSTOM_COLOR_ID, CUSTOM_GRADIENT_ID, MY_PHOTO_ID } from "./design";
import { getGalleryCategory } from "./backgroundGallery";

export function describeSavedBackground(preferences = {}) {
  const id = String(preferences.background || "classic");
  const usesCustomColor = id === CUSTOM_COLOR_ID;
  const usesCustomGradient = id === CUSTOM_GRADIENT_ID;
  const usesOwnPhoto = id === MY_PHOTO_ID;
  const custom = usesCustomColor || usesCustomGradient;

  let category = "presets";
  if (usesOwnPhoto) category = "photos";
  else if (custom) category = "color";
  else category = getGalleryCategory(id) || "presets";

  return {
    category,
    preset_background_id: custom || usesOwnPhoto ? null : id,
    uses_custom_color: usesCustomColor,
    uses_custom_gradient: usesCustomGradient,
    uses_own_photo: usesOwnPhoto,
  };
}

export function describeVisual(preferences = {}) {
  return String(preferences.visual || "orb");
}