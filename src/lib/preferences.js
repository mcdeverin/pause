// Personalization preferences, persisted locally so they survive app launches.
// No account or subscription is required to change any of these.

import { clampBlur, clampDim, clampPhotoOffset, clampPhotoZoom, sanitizeHex } from "./background";
import { DEFAULT_CUSTOM_COLOR, DEFAULT_GRADIENT_FROM, DEFAULT_GRADIENT_TO } from "./design";
import { isStyleSelectable, normalizeVisualOptions } from "./visuals";

const STORAGE_KEY = "pausePreferences";

export const DEFAULT_PREFERENCES = {
  visual: "orb",
  // Per-style fine-tuning, keyed by visual id. Styles keep their defaults until
  // the user changes them.
  visualOptions: {},
  background: "classic",
  // Background adjustments — applied to the background layer only.
  backgroundDim: 0,
  backgroundBlur: 0,
  customColor: DEFAULT_CUSTOM_COLOR,
  // A two-colour gradient the user builds themselves.
  gradientFrom: DEFAULT_GRADIENT_FROM,
  gradientTo: DEFAULT_GRADIENT_TO,
  // Which of the locally stored photos is in use.
  photoId: null,
  photoZoom: 1,
  photoOffsetX: 0,
  photoOffsetY: 0,
  showTimer: true,
  showInstructions: true,
  showShortcuts: true,
  saveMoments: false,
};

// Settings saved before backgrounds became customizable simply arrive without
// the newer keys, so they keep their old choices and pick up these defaults.
export function loadPreferences() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const merged = { ...DEFAULT_PREFERENCES, ...stored };
    return {
      ...merged,
      backgroundDim: clampDim(merged.backgroundDim),
      backgroundBlur: clampBlur(merged.backgroundBlur),
      photoZoom: clampPhotoZoom(merged.photoZoom),
      photoOffsetX: clampPhotoOffset(merged.photoOffsetX),
      photoOffsetY: clampPhotoOffset(merged.photoOffsetY),
      customColor:
        typeof merged.customColor === "string" && merged.customColor
          ? merged.customColor
          : DEFAULT_CUSTOM_COLOR,
      gradientFrom: sanitizeHex(merged.gradientFrom) || DEFAULT_GRADIENT_FROM,
      gradientTo: sanitizeHex(merged.gradientTo) || DEFAULT_GRADIENT_TO,
      photoId: typeof merged.photoId === "string" ? merged.photoId : null,
      // Selections saved before the collection existed simply have no options.
      visualOptions: normalizeVisualOptions(merged.visualOptions),
      // A style whose collection isn't offered right now falls back to Original.
      visual: isStyleSelectable(merged.visual) ? merged.visual : DEFAULT_PREFERENCES.visual,
    };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export function savePreferences(preferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Storage unavailable (private mode) — preferences simply stay in memory.
  }
}