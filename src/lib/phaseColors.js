// The two colours a visual is currently using, so the breathing cue can be
// written in the very colours the user picked. Only the styles that expose a
// colour pair return them; everything else keeps the adaptive canvas ink.
import { DEFAULT_VISUAL_COLORS, isHexColor } from "./visualColors";

export function getVisualPair(styleId, options) {
  const defaults = DEFAULT_VISUAL_COLORS[styleId];
  if (!defaults) return null;
  const source = options && typeof options === "object" ? options : {};
  return {
    from: isHexColor(source.colorFrom) ? source.colorFrom : defaults.colorFrom,
    to: isHexColor(source.colorTo) ? source.colorTo : defaults.colorTo,
  };
}