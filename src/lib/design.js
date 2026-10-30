// Shared visual language for Pause — typography, colour and background tokens.
// Every screen reads from here so the app stays visually consistent.

export const FONT = "'Nunito Sans', ui-sans-serif, system-ui, -apple-system, sans-serif";

export const BREATHING_VISUALS = [
  {
    id: "orb",
    label: "Organic Orb",
    description: "Pause's original soft, shifting form.",
  },
  {
    id: "ring",
    label: "Breathing Ring",
    description: "A clean ring that fills with your breath.",
  },
];

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
  ringFrom: "#7FB6C4",
  ringTo: "#9CC7B4",
  orbGradient:
    "radial-gradient(circle at 35% 35%, rgba(74, 91, 140, 0.9) 0%, rgba(155, 142, 196, 0.7) 60%, rgba(155, 142, 196, 0.5) 100%)",
};

export function getColors(theme) {
  return theme === "day" ? DAY : NIGHT;
}

export function getBackgroundStyle(id, theme) {
  const found = BACKGROUNDS.find((b) => b.id === id) || BACKGROUNDS[0];
  return { background: theme === "day" ? found.day : found.night };
}

export function getBackgroundLabel(id) {
  const found = BACKGROUNDS.find((b) => b.id === id) || BACKGROUNDS[0];
  return found.label;
}

export function getVisualLabel(id) {
  const found = BREATHING_VISUALS.find((v) => v.id === id) || BREATHING_VISUALS[0];
  return found.label;
}

export function formatClock(totalSeconds) {
  const safe = Math.max(0, Math.round(totalSeconds || 0));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}