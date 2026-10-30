// The visual half of the personalization draft — the canvas only. Interface
// appearance and the "During your session" preferences are deliberately left
// out, so restoring visuals never flips someone's light/dark choice.
import { DEFAULT_PREFERENCES } from "./preferences";
import { resolveOptions, VISUAL_STYLES } from "./visuals";

const VISUAL_KEYS = [
  "background",
  "backgroundDim",
  "backgroundBlur",
  "customColor",
  "gradientFrom",
  "gradientTo",
  "photoId",
  "photoZoom",
  "photoOffsetX",
  "photoOffsetY",
];

// Returns a draft with every visual setting back at its default. It only ever
// touches the unsaved draft, so nothing is stored until Save My Pause.
export function restoreVisualDefaults(draft) {
  const restored = { ...draft, visual: DEFAULT_PREFERENCES.visual, visualOptions: {} };
  VISUAL_KEYS.forEach((key) => {
    restored[key] = DEFAULT_PREFERENCES[key];
  });
  return restored;
}

// True when the chosen visual, its fine-tuning, the background and its
// adjustments all already match their defaults.
export function visualSettingsAtDefaults(draft) {
  if (draft.visual !== DEFAULT_PREFERENCES.visual) return false;
  if (VISUAL_KEYS.some((key) => draft[key] !== DEFAULT_PREFERENCES[key])) return false;

  return VISUAL_STYLES.every((style) => {
    const current = resolveOptions(style.id, draft.visualOptions?.[style.id]);
    const defaults = resolveOptions(style.id, null);
    return Object.keys(defaults).every((key) => current[key] === defaults[key]);
  });
}