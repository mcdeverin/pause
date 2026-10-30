// The breathing visual collection: five galleries, each style with its own
// material and its own fine-tuning controls. Everything here is data only — the
// shared breathing clock stays the single source of breathing progress.

export const COLLECTIONS = [
  { id: "classics", label: "Classics" },
  { id: "nature", label: "Nature" },
  { id: "botanical", label: "Botanical" },
  { id: "atmospheric", label: "Atmospheric" },
  { id: "sports", label: "Sports & Focus" },
];

// Collections the gallery offers right now. The remaining styles stay in the
// registry above, so nothing saved breaks — they just aren't selectable until
// their collection is added back here.
const VISIBLE_COLLECTIONS = ["classics"];

export const PALETTES = {
  bubble: {
    options: [
      {
        id: "default",
        label: "Default",
        rim: ["#A8DCEA", "#C9B8EC", "#F5C8DA", "#BCE9CE", "#A9C9F0", "#E9D3F5"],
        tint: "#EAF7FB",
      },
      {
        id: "pastel",
        label: "Pastel",
        rim: ["#DFF1F7", "#E8E0F7", "#FAE6EE", "#E4F5E8", "#E2ECFA", "#F3E8FA"],
        tint: "#F6FBFD",
      },
      {
        id: "sunset",
        label: "Sunset",
        rim: ["#F6B49C", "#F3A0B8", "#E7A6D4", "#F7C98B", "#F0B5A0", "#EBB6C8"],
        tint: "#FDF1EA",
      },
      {
        id: "ocean",
        label: "Ocean",
        rim: ["#8FD3E8", "#7FB8E0", "#9FD9D0", "#6FA8D6", "#A9E0E8", "#86C4DE"],
        tint: "#ECF7FB",
      },
      {
        id: "lavender",
        label: "Lavender",
        rim: ["#C3B4F0", "#D5C6F5", "#B9A8E6", "#E0D3F7", "#C9BEF2", "#AFA0E0"],
        tint: "#F4F1FC",
      },
      {
        id: "citrus",
        label: "Citrus",
        rim: ["#F2E39A", "#C9E8A8", "#F6D98F", "#BDE4C4", "#F0E0A8", "#D8E9A0"],
        tint: "#FBFBEC",
      },
    ],
  },
  crystal: {
    options: [
      { id: "clear", label: "Clear", tint: "#DCE9F5", rim: "#FFFFFF", edge: "#9FB6C9" },
      { id: "cool", label: "Cool", tint: "#CFE3F7", rim: "#EDF6FF", edge: "#8FAAC6" },
      { id: "amber", label: "Amber", tint: "#F4E4CE", rim: "#FFF6E8", edge: "#C2A681" },
      { id: "rose", label: "Rose", tint: "#F6DEE6", rim: "#FFF1F5", edge: "#C6A2AE" },
      { id: "sage", label: "Sage", tint: "#DFEDE2", rim: "#F3FBF5", edge: "#9DB4A4" },
    ],
  },
  glass: {
    options: [
      { id: "clear", label: "Clear", tint: "#E2EEF4", rim: "#FFFFFF", edge: "#96AFC0" },
      { id: "cool", label: "Cool", tint: "#CEE4F7", rim: "#F4FAFF", edge: "#82A6C6" },
      { id: "smoke", label: "Smoke", tint: "#D6DAE0", rim: "#F8F9FB", edge: "#8C96A4" },
      { id: "rose", label: "Rose", tint: "#F6DEE8", rim: "#FFF4F8", edge: "#C6A2AE" },
      { id: "sage", label: "Sage", tint: "#DCEEE2", rim: "#F6FDF8", edge: "#9DB4A4" },
    ],
  },
  aurora: {
    options: [
      { id: "aurora", label: "Aurora", colours: ["#5FD3C4", "#6FA8F0", "#B79CF0", "#8FE3D0"], haze: "#0E2230" },
      { id: "boreal", label: "Boreal", colours: ["#3FB59F", "#4A8FD6", "#9C7FE0", "#5FC9B4"], haze: "#0B1E2A" },
      { id: "rose", label: "Rose", colours: ["#F0A6BE", "#C9A6F0", "#F5C1A8", "#E8B4E0"], haze: "#221726" },
      { id: "polar", label: "Polar", colours: ["#9FE8F0", "#B8C8F5", "#D3C6F5", "#A8F0DC"], haze: "#111E2C" },
    ],
  },
  bloom: {
    options: [
      { id: "blush", label: "Blush", outer: "#F7D6DF", inner: "#FBEAEF", centre: "#E9C27A" },
      { id: "ivory", label: "Ivory", outer: "#F6F0E4", inner: "#FDFAF2", centre: "#DCC79A" },
      { id: "lavender", label: "Lavender", outer: "#DCD3F5", inner: "#EFEAFB", centre: "#C9B98F" },
      { id: "sage", label: "Sage", outer: "#D6E8DA", inner: "#EDF6EF", centre: "#D9C79A" },
      { id: "apricot", label: "Apricot", outer: "#F7DFC8", inner: "#FCEFE2", centre: "#D8A96B" },
    ],
  },
  leaves: {
    options: [
      { id: "sage", label: "Sage", from: "#8FBFA8", to: "#D6EBDB", vein: "#5E8B74" },
      { id: "fern", label: "Fern", from: "#6FA882", to: "#C6E2C8", vein: "#43704F" },
      { id: "olive", label: "Olive", from: "#A3AE6F", to: "#DCE0B6", vein: "#6E7745" },
      { id: "autumn", label: "Autumn", from: "#C98B5E", to: "#EFD3B4", vein: "#8A5A38" },
    ],
  },
};

const SLIDER = (key, label, def, hint, min = 0, max = 100) => ({
  key,
  type: "slider",
  label,
  min,
  max,
  default: def,
  hint,
});

const PALETTE = (key, label, palette, def) => ({
  key,
  type: "palette",
  label,
  palette,
  default: def,
});

// Only styles listed here are selectable — nothing unfinished is offered.
export const VISUAL_STYLES = [
  {
    id: "orb",
    label: "Original",
    collection: "classics",
    description: "The original shifting orb.",
    controls: [],
  },
  {
    id: "ring",
    label: "Ring",
    collection: "classics",
    description: "A ring that fills with your breath.",
    controls: [],
  },
  {
    id: "bubble",
    label: "Bubble",
    collection: "classics",
    description: "Iridescent soap bubble.",
    controls: [
      SLIDER("transparency", "Transparency", 60, "Higher keeps the centre clearer."),
      SLIDER("rim", "Rim intensity", 55, "How defined the bubble's edge is."),
      SLIDER("iridescence", "Iridescence", 70, "Strength of the shifting pastel rim."),
      SLIDER("glow", "Soft glow", 35, "A gentle halo around the bubble."),
      PALETTE("palette", "Color palette", "bubble", "default"),
    ],
  },
  {
    id: "crystal",
    label: "Crystal",
    collection: "classics",
    description: "Faceted glass sphere.",
    controls: [
      SLIDER("transparency", "Transparency", 55, "Higher keeps the background visible."),
      SLIDER("outline", "Outline intensity", 60, "How luminous the rim reads."),
      PALETTE("tint", "Glass tint", "crystal", "clear"),
      SLIDER("glow", "Soft glow", 30, "A soft light around the sphere."),
    ],
  },
  {
    id: "glass",
    label: "Glass",
    collection: "classics",
    description: "Liquid glass that bends the light.",
    controls: [
      SLIDER("transparency", "Transparency", 55, "Higher keeps what's behind it visible."),
      SLIDER("rim", "Rim intensity", 65, "How bright the wet edge reads."),
      SLIDER("glow", "Soft glow", 30, "A gentle light spilling past the glass."),
      PALETTE("tint", "Glass tint", "glass", "clear"),
    ],
  },
  {
    id: "leaves",
    label: "Leaves",
    collection: "nature",
    description: "Leaves that spread as you inhale.",
    controls: [
      PALETTE("palette", "Color palette", "leaves", "sage"),
      SLIDER("movement", "Movement intensity", 45, "How far the leaves open."),
    ],
  },
  {
    id: "branches",
    label: "Branches",
    collection: "nature",
    description: "Fine branches in a loose ring.",
    controls: [],
  },
  {
    id: "ripple",
    label: "Ripple",
    collection: "nature",
    description: "Concentric water rings.",
    controls: [],
  },
  {
    id: "bloom",
    label: "Bloom",
    collection: "botanical",
    description: "A flower that opens and settles.",
    controls: [
      PALETTE("palette", "Color palette", "bloom", "blush"),
      SLIDER("movement", "Movement intensity", 50, "How far the petals unfold."),
    ],
  },
  {
    id: "aurora",
    label: "Aurora",
    collection: "atmospheric",
    description: "Ribbons of northern light.",
    controls: [
      PALETTE("palette", "Color palette", "aurora", "aurora"),
      SLIDER("intensity", "Color intensity", 65, "Depth of the ribbon colour."),
      SLIDER("flow", "Flow intensity", 55, "How much the ribbons drift."),
      SLIDER("glow", "Soft glow", 40, "A soft halo around the orb."),
    ],
  },
  {
    id: "basketball",
    label: "Basketball",
    collection: "sports",
    description: "Warm leather with real seams.",
    controls: [
      SLIDER("size", "Size", 100, "Resting size of the ball.", 85, 115),
      SLIDER("texture", "Surface texture", 55, "Amount of leather grain."),
    ],
  },
];

export function getStyle(id) {
  return VISUAL_STYLES.find((style) => style.id === id) || VISUAL_STYLES[0];
}

export function getStyleLabel(id) {
  return getStyle(id).label;
}

export function stylesInCollection(collectionId) {
  return VISUAL_STYLES.filter((style) => style.collection === collectionId);
}

export function collectionForStyle(id) {
  return getStyle(id).collection;
}

export function isCollectionVisible(collectionId) {
  return VISIBLE_COLLECTIONS.includes(collectionId);
}

export function availableCollections() {
  return COLLECTIONS.filter((entry) => isCollectionVisible(entry.id));
}

// A style is only offered while its collection is visible.
export function isStyleSelectable(id) {
  const style = VISUAL_STYLES.find((entry) => entry.id === id);
  return Boolean(style && isCollectionVisible(style.collection));
}

export function paletteOption(paletteId, optionId) {
  const palette = PALETTES[paletteId];
  if (!palette) return null;
  return palette.options.find((option) => option.id === optionId) || palette.options[0];
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(Math.max(number, min), max);
}

// Stored options of one style, filled in with defaults and clamped, so a saved
// session from any build always renders with valid values.
export function resolveOptions(styleId, raw) {
  const style = getStyle(styleId);
  const source = raw && typeof raw === "object" ? raw : {};
  const resolved = {};

  style.controls.forEach((control) => {
    if (control.type === "palette") {
      resolved[control.key] = paletteOption(control.palette, source[control.key])
        ? (paletteOption(control.palette, source[control.key]).id)
        : control.default;
    } else {
      resolved[control.key] = Math.round(
        clampNumber(source[control.key], control.min, control.max, control.default)
      );
    }
  });

  return resolved;
}

// The whole saved map, normalised for every style that still exists.
export function normalizeVisualOptions(stored) {
  const source = stored && typeof stored === "object" ? stored : {};
  const normalized = {};
  VISUAL_STYLES.forEach((style) => {
    if (style.controls.length > 0) {
      normalized[style.id] = resolveOptions(style.id, source[style.id]);
    }
  });
  return normalized;
}

export function hasFineTuning(styleId) {
  return getStyle(styleId).controls.length > 0;
}