// Personalization preferences, persisted locally so they survive app launches.
// No account or subscription is required to change any of these.

import { clampBlur, clampDim, clampPhotoOffset, clampPhotoZoom } from "./background";
import { DEFAULT_CUSTOM_COLOR } from "./design";

const STORAGE_KEY = "pausePreferences";

export const DEFAULT_PREFERENCES = {
  visual: "orb",
  background: "classic",
  // Background adjustments — applied to the background layer only.
  backgroundDim: 0,
  backgroundBlur: 0,
  customColor: DEFAULT_CUSTOM_COLOR,
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