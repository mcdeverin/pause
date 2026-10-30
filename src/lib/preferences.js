// Personalization preferences, persisted locally so they survive app launches.
// No account or subscription is required to change any of these.

const STORAGE_KEY = "pausePreferences";

export const DEFAULT_PREFERENCES = {
  visual: "orb",
  background: "classic",
  showTimer: true,
  showInstructions: true,
  showShortcuts: true,
  saveMoments: false,
};

export function loadPreferences() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return { ...DEFAULT_PREFERENCES, ...stored };
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