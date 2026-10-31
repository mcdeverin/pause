// Ink for text and controls that sit straight on the chosen background.
// The saved appearance is the starting point; the canvas decides whether the ink
// has to flip so those elements stay readable. Nothing here alters the
// background or the dimming the user chose — only the interface drawn on top.

import { clampDim } from "./background";
import { getBackgroundTone, getColors } from "./design";

const HEX_PATTERN = /#([0-9a-f]{3}|[0-9a-f]{6})\b/gi;
const LIGHT_CANVAS = 0.45;

// Breathing cues and their supporting text use a softer editorial palette than
// the rest of the interface: no near-black, no pure white.
const BREATHING_INK = {
  day: {
    text: "#454C49",
    secondary: "#666F6B",
    tertiary: "#7C837E",
  },
  night: {
    text: "#F5F3EF",
    secondary: "#DAD7CF",
    tertiary: "#B7B3AA",
  },
};

// A photo's ink is decided from the dimming the user chose, because its own
// brightness can't be read. A lightly dimmed photo still reads as a light
// canvas, so the cues keep enough contrast on bright imagery too.
const PHOTO_DIM_THRESHOLD = 55;
const BREATHING_PHOTO_DIM_THRESHOLD = 45;

function channelToLinear(value) {
  const channel = value / 255;
  return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function hexLuminance(hex) {
  const raw = hex.replace("#", "");
  const full = raw.length === 3 ? raw.split("").map((char) => char + char).join("") : raw;
  const channels = [0, 2, 4].map((index) => parseInt(full.slice(index, index + 2), 16));
  if (channels.some(Number.isNaN)) return null;
  const [r, g, b] = channels.map(channelToLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// How light the canvas actually reads, 0 (black) to 1 (white). Dimming is part
// of the calculation, so darkening a background correctly flips the ink.
function canvasLightness(settings) {
  const tone = getBackgroundTone(settings.background, {
    customColor: settings.customColor,
    gradientFrom: settings.gradientFrom,
    gradientTo: settings.gradientTo,
  });
  const values = (String(tone).match(HEX_PATTERN) || [])
    .map(hexLuminance)
    .filter((value) => value !== null);
  if (values.length === 0) return 1;
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  return average * (1 - clampDim(settings.backgroundDim) / 100);
}

function resolveInk(theme, settings, { hasPhoto = false, photoDimThreshold }) {
  const inkTheme = hasPhoto
    ? clampDim(settings.backgroundDim) >= photoDimThreshold
      ? "night"
      : theme
    : canvasLightness(settings) >= LIGHT_CANVAS
      ? "day"
      : "night";

  // A soft halo instead of a hard outline: it lifts the text off busy imagery
  // without reading as a shadow the user could notice.
  const shadow =
    inkTheme === "day"
      ? `0 1px 12px rgba(255, 255, 255, ${hasPhoto ? 0.70 : 0.60})`
      : `0 1px 14px rgba(0, 0, 0, ${hasPhoto ? 0.60 : 0.50})`;

  return { inkTheme, shadow };
}

export function getCanvasInk(theme, settings = {}, { hasPhoto = false } = {}) {
  const { inkTheme, shadow } = resolveInk(theme, settings, {
    hasPhoto,
    photoDimThreshold: PHOTO_DIM_THRESHOLD,
  });
  return { ...getColors(inkTheme), shadow };
}

// Used only by the breathing cue and its supporting text (sessions and the live
// preview), so the rest of the interface keeps its own palette.
export function getBreathingInk(theme, settings = {}, { hasPhoto = false } = {}) {
  const { inkTheme, shadow } = resolveInk(theme, settings, {
    hasPhoto,
    photoDimThreshold: BREATHING_PHOTO_DIM_THRESHOLD,
  });
  return { ...getColors(inkTheme), ...BREATHING_INK[inkTheme], shadow };
}