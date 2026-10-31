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

// Returns a draft back at the app's original look: the first breathing visual
// (the moving blue-and-green orb) with its own default colours, the off-white
// Classic background and no adjustment on it. Any fine-tuning is dropped, so
// every style hands its colours back. Interface appearance and the "During your
// session" preferences are left alone, and only the unsaved draft changes — so
// nothing is stored until Save My Pause.
export function restoreVisualDefaults(draft) {
  const restored = {
    ...draft,
    visual: DEFAULT_PREFERENCES.visual,
    visualOptions: {},
  };
  VISUAL_KEYS.forEach((key) => {
    restored[key] = DEFAULT_PREFERENCES[key];
  });
  return restored;
}

// True when the chosen visual, every style's fine-tuning, the background and its
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