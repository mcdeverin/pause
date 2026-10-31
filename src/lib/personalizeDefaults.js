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

// Returns a draft with every visual setting back at its default, for every
// style — dropping all fine-tuning hands each one its own colours again. The
// style the user is looking at stays selected, so restoring is something they
// can watch happen on the Ring as easily as on the Original. It only ever
// touches the unsaved draft, so nothing is stored until Save My Pause.
export function restoreVisualDefaults(draft) {
  const restored = { ...draft, visualOptions: {} };
  VISUAL_KEYS.forEach((key) => {
    restored[key] = DEFAULT_PREFERENCES[key];
  });
  return restored;
}

// True when every style's fine-tuning, the background and its adjustments all
// already match their defaults.
export function visualSettingsAtDefaults(draft) {
  if (VISUAL_KEYS.some((key) => draft[key] !== DEFAULT_PREFERENCES[key])) return false;

  return VISUAL_STYLES.every((style) => {
    const current = resolveOptions(style.id, draft.visualOptions?.[style.id]);
    const defaults = resolveOptions(style.id, null);
    return Object.keys(defaults).every((key) => current[key] === defaults[key]);
  });
}