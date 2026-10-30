// Colours of the two customisable breathing visuals. They belong to the visual
// alone: neither the chosen background nor the Light / Dark appearance changes
// them, and a visual keeps its own pair until the user changes it.

export const DEFAULT_VISUAL_COLORS = {
  orb: { colorFrom: "#4A7FA6", colorTo: "#6BA888" },
  ring: { colorFrom: "#5B9E9A", colorTo: "#8FBFA8" },
};

// Every colour the spectrum produces shares one saturation and lightness, so the
// track and the handle always agree.
const SATURATION = 58;
const LIGHTNESS = 55;

export function isHexColor(value) {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value.trim());
}

export function hslToHex(hue, saturation = SATURATION, lightness = LIGHTNESS) {
  const alpha = (saturation / 100) * Math.min(lightness / 100, 1 - lightness / 100);
  const channel = (offset) => {
    const k = (offset + hue / 30) % 12;
    const amount = lightness / 100 - alpha * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(amount * 255)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${channel(0)}${channel(8)}${channel(4)}`.toUpperCase();
}

export function hueFromHex(hex) {
  const value = isHexColor(hex) ? hex.trim() : "#808080";
  const r = parseInt(value.slice(1, 3), 16) / 255;
  const g = parseInt(value.slice(3, 5), 16) / 255;
  const b = parseInt(value.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const delta = max - Math.min(r, g, b);
  if (delta === 0) return 0;
  let hue;
  if (max === r) hue = ((g - b) / delta) % 6;
  else if (max === g) hue = (b - r) / delta + 2;
  else hue = (r - g) / delta + 4;
  return Math.round((((hue * 60) % 360) + 360) % 360);
}

export function colorFromHue(hue) {
  const clamped = Math.min(Math.max(Number(hue) || 0, 0), 360);
  return hslToHex(clamped);
}

// The slider's track is drawn in a dustier version of the same hues, so it reads
// as a soft spectrum instead of a bright rainbow. Only the track changes: the
// handle and the swatch keep showing the exact colour a drag produces.
const MUTED_SATURATION = 34;
const MUTED_LIGHTNESS = 58;

// Dusty rose → soft ochre → sage green → seafoam → muted blue → lavender → mauve,
// placed at their own hue positions so the track stays continuous and every hue
// keeps its place on the slider.
const MUTED_STOPS = [348, 38, 110, 168, 212, 258, 305];

const mutedColor = (hue) => hslToHex(hue, MUTED_SATURATION, MUTED_LIGHTNESS);

export const MUTED_SPECTRUM_GRADIENT = `linear-gradient(90deg, ${[
  ...MUTED_STOPS.map((hue) => `${mutedColor(hue)} ${(hue / 360) * 100}%`),
  `${mutedColor(MUTED_STOPS[0])} 100%`,
].join(", ")})`;