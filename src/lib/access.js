// The single source of truth for what Always Pause+ unlocks.
//
// Gating is by identity only — nothing here touches an exercise's category,
// phases, labels or blurb, so the library itself stays exactly as it is.
// A verified RevenueCat entitlement is the only thing that turns these off.

import { CUSTOM_GRADIENT_ID } from "./design";
import { isGalleryPhotoId } from "./backgroundGallery";

// The three starter exercises, by their stored record ids.
export const FREE_TECHNIQUE_IDS = [
  "69ca561206566afe944a443d", // Box Breathing — Calm, 4·4·4·4
  "69ca561206566afe944a443e", // 4-7-8 Breathing — Calm, 4·7·8
  "69ca561206566afe944a4458", // Equal Breathing (Sama Vritti) — Sleep, 5·5
];

// Original only.
export const FREE_VISUAL_IDS = ["orb"];

// Three starter photographs: nature, warm and evening.
export const FREE_PHOTO_BACKGROUND_IDS = [
  "nature-mountain-lake",
  "nature-dune-at-dusk",
  "nature-under-the-stars",
];

// One personal photo on the free tier; it can be replaced as often as they like.
export const FREE_PHOTO_SLOTS = 1;

export function isFreeTechnique(technique) {
  return Boolean(technique && FREE_TECHNIQUE_IDS.includes(technique.id));
}

export function isPremiumVisual(id) {
  return !FREE_VISUAL_IDS.includes(id);
}

// Premium backgrounds: the curated photographs beyond the three starters, and
// the two-colour gradient. Solid colours, the tone presets and your own photo
// stay free.
export function isPremiumBackground(id) {
  if (id === CUSTOM_GRADIENT_ID) return true;
  if (isGalleryPhotoId(id)) return !FREE_PHOTO_BACKGROUND_IDS.includes(id);
  return false;
}