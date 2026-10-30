// Shared visual language for Pause — typography, colour and background tokens.
// Every screen reads from here so the app stays visually consistent.

import { getStyleLabel } from "./visuals";

export const FONT = "'Nunito Sans', ui-sans-serif, system-ui, -apple-system, sans-serif";

export const BACKGROUNDS = [
  {
    id: "classic",
    label: "Classic",
    description: "Clean and distraction free.",
    day: "#FAFAF8",
    night: "#0D1117",
  },
  {
    id: "sage",
    label: "Sage Mist",
    description: "Soft, grounded and calm.",
    day: "linear-gradient(180deg, #F9FBF7 0%, #EDF3EC 55%, #E3EDE6 100%)",
    night: "linear-gradient(180deg, #0E1512 0%, #142019 60%, #17261E 100%)",
  },
  {
    id: "blue",
    label: "Blue Hour",
    description: "Cool, airy and quiet.",
    day: "linear-gradient(180deg, #F7FAFC 0%, #E9F0F6 55%, #DDE7F1 100%)",
    night: "linear-gradient(180deg, #0B1220 0%, #101D2E 60%, #14273E 100%)",
  },
  {
    id: "lavender",
    label: "Lavender Dusk",
    description: "Gentle and restorative.",
    day: "linear-gradient(180deg, #FBF9FC 0%, #F0ECF6 55%, #E6E0F0 100%)",
    night: "linear-gradient(180deg, #100E18 0%, #181427 60%, #1F1933 100%)",
  },
  {
    id: "first-light",
    label: "First Light",
    description: "Warm and unhurried.",
    day: "linear-gradient(180deg, #FDF7EF 0%, #F8E9DC 50%, #F2DFD4 100%)",
    night: "linear-gradient(180deg, #18120E 0%, #231A15 55%, #2B201A 100%)",
  },
  {
    id: "slow-sunday",
    label: "Slow Sunday",
    description: "Cream, sage and nothing urgent.",
    day: "linear-gradient(180deg, #FBF8F1 0%, #F3EFE2 50%, #E8EFE7 100%)",
    night: "linear-gradient(180deg, #13120F 0%, #1B1D17 55%, #1F241C 100%)",
  },
  {
    id: "stillwater",
    label: "Stillwater",
    description: "One steady, even tone.",
    day: "#DFE8E6",
    night: "#101A1C",
  },
  {
    id: "nightfall",
    label: "Nightfall",
    description: "Deep and enclosing.",
    day: "linear-gradient(180deg, #F0F2F8 0%, #E4E8F1 55%, #D8DEEB 100%)",
    night: "linear-gradient(180deg, #090D17 0%, #111A2B 55%, #17243A 100%)",
  },
];

const DAY = {
  text: "#222222",
  secondary: "#444444",
  tertiary: "#565656",
  accent: "#3F7D7A",
  accentAlt: "#4A7FA6",
  accentSoft: "rgba(91, 158, 154, 0.14)",
  border: "rgba(34, 34, 34, 0.10)",
  track: "rgba(34, 34, 34, 0.10)",
  glass: "rgba(255, 255, 255, 0.82)",
  glassBorder: "rgba(34, 34, 34, 0.07)",
  scrim: "rgba(24, 24, 24, 0.26)",
  sheet: "#FFFFFF",
  pill: "rgba(255, 255, 255, 0.50)",
  pillBorder: "rgba(0, 0, 0, 0.12)",
  pillText: "#9A9A9A",
  sage: "#E9F2EC",
  sageBorder: "rgba(91, 158, 154, 0.30)",
  heat: ["rgba(91, 158, 154, 0.28)", "rgba(91, 158, 154, 0.55)", "rgba(91, 158, 154, 0.85)"],
  heatEmpty: "rgba(34, 34, 34, 0.06)",
  momentTints: {
    calm: "#E1F0E7",
    focus: "#E0EBF5",
    wind_down: "#EFE8F7",
    reset: "#FFF0D9",
  },
  momentInk: {
    calm: "#39705F",
    focus: "#3E6A94",
    wind_down: "#63548F",
    reset: "#9A6A29",
  },
  ringFrom: "#5B9E9A",
  ringTo: "#8FBFA8",
  orbGradient:
    "radial-gradient(circle at 35% 35%, #4A7FA6 0%, #6BA888 100%)",
};

const NIGHT = {
  text: "#F5F5F2",
  secondary: "#C9C9C4",
  tertiary: "#AEAEA8",
  accent: "#8FBFA8",
  accentAlt: "#8FB6D6",
  accentSoft: "rgba(143, 191, 168, 0.16)",
  border: "rgba(245, 245, 242, 0.16)",
  track: "rgba(245, 245, 242, 0.16)",
  glass: "rgba(22, 30, 42, 0.78)",
  glassBorder: "rgba(245, 245, 242, 0.12)",
  scrim: "rgba(6, 10, 16, 0.52)",
  sheet: "#131A23",
  pill: "rgba(255, 255, 255, 0.08)",
  pillBorder: "rgba(255, 255, 255, 0.18)",
  pillText: "#B4B4AF",
  sage: "rgba(143, 191, 168, 0.12)",
  sageBorder: "rgba(143, 191, 168, 0.30)",
  heat: ["rgba(143, 191, 168, 0.25)", "rgba(143, 191, 168, 0.50)", "rgba(143, 191, 168, 0.80)"],
  heatEmpty: "rgba(245, 245, 242, 0.08)",
  momentTints: {
    calm: "rgba(143, 191, 168, 0.16)",
    focus: "rgba(143, 182, 214, 0.16)",
    wind_down: "rgba(167, 150, 214, 0.16)",
    reset: "rgba(214, 170, 110, 0.16)",
  },
  momentInk: {
    calm: "#A9D3C0",
    focus: "#A9C6E2",
    wind_down: "#BDB0E4",
    reset: "#E3BE86",
  },
  ringFrom: "#7FB6C4",
  ringTo: "#9CC7B4",
  orbGradient:
    "radial-gradient(circle at 35% 35%, rgba(74, 91, 140, 0.9) 0%, rgba(155, 142, 196, 0.7) 60%, rgba(155, 142, 196, 0.5) 100%)",
};

export function getColors(theme) {
  return theme === "day" ? DAY : NIGHT;
}

// Backgrounds come from three places: a curated preset, any colour the user
// picks, or their own photo. Presets are starting points, never limits.
export const CUSTOM_COLOR_ID = "custom";
export const CUSTOM_GRADIENT_ID = "custom-gradient";
export const MY_PHOTO_ID = "photo";
export const DEFAULT_CUSTOM_COLOR = "#E7EDEA";
export const DEFAULT_GRADIENT_FROM = "#E9F2EC";
export const DEFAULT_GRADIENT_TO = "#DCE7F1";

const BASE_TONE = { day: "#FAFAF8", night: "#0D1117" };

export function getBackgroundOption(id) {
  return BACKGROUNDS.find((option) => option.id === id) || null;
}

export function isPhotoBackground(id) {
  return id === MY_PHOTO_ID;
}

// A flat colour has nothing to soften, so blur is switched off for it.
export function isSolidBackground(id, theme) {
  if (id === MY_PHOTO_ID) return false;
  if (id === CUSTOM_GRADIENT_ID) return false;
  if (id === CUSTOM_COLOR_ID) return true;
  const preset = getBackgroundOption(id) || BACKGROUNDS[0];
  const value = theme === "day" ? preset.day : preset.night;
  return !String(value).includes("gradient");
}

// `palette` carries the user's own colour choices: { customColor, gradientFrom,
// gradientTo }. Anything missing falls back to the curated default.
export function getBackgroundTone(id, theme, palette = {}) {
  if (id === CUSTOM_GRADIENT_ID) {
    const from = palette.gradientFrom || DEFAULT_GRADIENT_FROM;
    const to = palette.gradientTo || DEFAULT_GRADIENT_TO;
    return `linear-gradient(180deg, ${from} 0%, ${to} 100%)`;
  }
  if (id === CUSTOM_COLOR_ID) return palette.customColor || DEFAULT_CUSTOM_COLOR;
  if (id === MY_PHOTO_ID) return theme === "day" ? BASE_TONE.day : BASE_TONE.night;
  const preset = getBackgroundOption(id) || BACKGROUNDS[0];
  return theme === "day" ? preset.day : preset.night;
}

export function getBackgroundStyle(id, theme, customColor) {
  return { background: getBackgroundTone(id, theme, customColor) };
}

export function getBackgroundLabel(id, customColor) {
  if (id === CUSTOM_COLOR_ID) return customColor ? `Custom ${customColor}` : "Custom Color";
  if (id === CUSTOM_GRADIENT_ID) return "Custom Gradient";
  if (id === MY_PHOTO_ID) return "Your Photos";
  const found = getBackgroundOption(id) || BACKGROUNDS[0];
  return found.label;
}

export function getVisualLabel(id) {
  return getStyleLabel(id);
}

export function formatClock(totalSeconds) {
  const safe = Math.max(0, Math.round(totalSeconds || 0));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}