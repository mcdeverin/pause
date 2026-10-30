// Ink for text and controls that sit straight on the chosen background.
// The saved appearance is the starting point; the canvas decides whether the ink
// has to flip so those elements stay readable. Nothing here alters the
// background or the dimming the user chose — only the interface drawn on top.

import { clampDim } from "./background";
import { getBackgroundTone, getColors } from "./design";

const HEX_PATTERN = /#([0-9a-f]{3}|[0-9a-f]{6})\b/gi;
const LIGHT_CANVAS = 0.45;

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

// How light the canvas actually reads, 0 (black) to 1 (white). A photo's own
// brightness is unknown, so photos keep the appearance's ink and rely on the
// soft shadow below instead.
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

export function getCanvasInk(theme, settings = {}, { hasPhoto = false } = {}) {
  if (hasPhoto) {
    // A photo's own brightness can't be read, so the dimming the user chose is
    // the signal: a heavily dimmed photo reads as a dark canvas.
    const inkTheme = clampDim(settings.backgroundDim) >= 55 ? "night" : theme;
    return {
      ...getColors(inkTheme),
      shadow:
        inkTheme === "day"
          ? "0 1px 12px rgba(255, 255, 255, 0.70)"
          : "0 1px 14px rgba(0, 0, 0, 0.60)",
    };
  }

  const lightCanvas = canvasLightness(settings) >= LIGHT_CANVAS;
  return {
    ...getColors(lightCanvas ? "day" : "night"),
    shadow: lightCanvas
      ? "0 1px 12px rgba(255, 255, 255, 0.60)"
      : "0 1px 14px rgba(0, 0, 0, 0.50)",
  };
}