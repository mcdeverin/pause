// Shared configuration and backdrop artwork for the Crystal Comparison Studio.
// Development-only: nothing in here is imported by the breathing experience.

export const BACKGROUND_MODES = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "test", label: "Refraction" },
];

// Matches the WebGL backdrop closely so no seam shows while a canvas resizes.
export const BACKGROUND_CSS = {
  light: "linear-gradient(180deg, #fdfcfa 0%, #f1eef6 55%, #e2dcec 100%)",
  dark: "radial-gradient(circle at 50% 42%, #3a414f 0%, #20242e 62%, #101216 100%)",
  test: "linear-gradient(180deg, #f3f0f6 0%, #ece7f2 100%)",
};

export const STUDIO_UI = {
  page: "#F7F5F1",
  card: "#FFFFFF",
  border: "#E6E1D9",
  text: "#2C302E",
  muted: "#6E746F",
  accent: "#8B7CC0",
  accentSoft: "#EEE9F8",
  track: "#E4DFD6",
};

export const PRISMATIC_DEFAULTS = {
  tint: "#f7fbff",
  facets: 4,
  transmission: 1,
  ior: 1.52,
  thickness: 2.4,
  dispersion: 0.34,
  roughness: 0.02,
  reflection: 1.5,
  environment: 1.1,
  iridescence: 0.18,
  edges: 0.55,
  key: 2.6,
  fill: 1.1,
  lightAngle: 128,
  rotation: 0.22,
  float: 0.07,
  size: 1,
  breathStrength: 0.19,
  breath: 0.35,
};

export const PRISMATIC_CONTROLS = [
  { group: "Appearance", key: "tint", label: "Glass tint", type: "color" },
  { group: "Appearance", key: "transmission", label: "Transparency", min: 0.4, max: 1, step: 0.01 },
  { group: "Appearance", key: "ior", label: "Refraction index (IOR)", min: 1, max: 2.2, step: 0.01 },
  { group: "Appearance", key: "thickness", label: "Glass thickness", min: 0.2, max: 6, step: 0.1 },
  { group: "Appearance", key: "dispersion", label: "Dispersion", min: 0, max: 1, step: 0.01 },
  { group: "Appearance", key: "roughness", label: "Surface roughness", min: 0, max: 0.6, step: 0.01 },
  { group: "Appearance", key: "reflection", label: "Reflection intensity", min: 0, max: 3, step: 0.05 },
  { group: "Appearance", key: "iridescence", label: "Rainbow glints", min: 0, max: 0.8, step: 0.01 },
  { group: "Appearance", key: "edges", label: "Edge reflection", min: 0, max: 1.6, step: 0.02 },
  { group: "Appearance", key: "facets", label: "Facet density", min: 1, max: 5, step: 1, integer: true },
  { group: "Lighting", key: "key", label: "Key light", min: 0, max: 6, step: 0.05 },
  { group: "Lighting", key: "fill", label: "Fill light", min: 0, max: 4, step: 0.05 },
  { group: "Lighting", key: "environment", label: "Environment brightness", min: 0, max: 3, step: 0.05 },
  { group: "Lighting", key: "lightAngle", label: "Light direction", min: 0, max: 360, step: 1, unit: "°" },
  { group: "Animation", key: "rotation", label: "Rotation speed", min: 0, max: 1, step: 0.01 },
  { group: "Animation", key: "float", label: "Floating intensity", min: 0, max: 0.3, step: 0.005 },
  { group: "Animation", key: "size", label: "Crystal size", min: 0.6, max: 1.4, step: 0.01 },
  { group: "Animation", key: "breathStrength", label: "Breathing expansion", min: 0, max: 0.4, step: 0.01 },
  { group: "Animation", key: "breath", label: "Manual breath", min: 0, max: 1, step: 0.01 },
];

// The baseline keeps the prototype's own keys untouched — only the ones its
// renderer already reads are exposed here.
export const BASELINE_CONTROLS = [
  { group: "Gemstone", key: "tint", label: "Gemstone colour", type: "color" },
  { group: "Gemstone", key: "edge", label: "Facet edge colour", type: "color" },
  { group: "Gemstone", key: "facets", label: "Facet complexity", min: 0, max: 2, step: 1, integer: true },
  { group: "Gemstone", key: "transmission", label: "Glass transmission", min: 0, max: 1, step: 0.01 },
  { group: "Gemstone", key: "dispersion", label: "Rainbow dispersion", min: 0, max: 1, step: 0.01 },
  { group: "Gemstone", key: "ior", label: "Refraction index", min: 1, max: 2.4, step: 0.01 },
  { group: "Gemstone", key: "thickness", label: "Glass thickness", min: 0.1, max: 6, step: 0.1 },
  { group: "Gemstone", key: "edges", label: "Facet outline", min: 0, max: 0.5, step: 0.01 },
  { group: "Gemstone", key: "roughness", label: "Surface roughness", min: 0, max: 1, step: 0.01 },
  { group: "Gemstone", key: "metalness", label: "Reflective metalness", min: 0, max: 1, step: 0.01 },
  { group: "Lighting", key: "light", label: "Key light", min: 0, max: 5, step: 0.05 },
  { group: "Animation", key: "rotation", label: "Rotation speed", min: 0, max: 1.5, step: 0.01 },
  { group: "Animation", key: "size", label: "Crystal size", min: 0.55, max: 1.4, step: 0.01 },
  { group: "Animation", key: "breathStrength", label: "Breathing expansion", min: 0, max: 0.45, step: 0.01 },
  { group: "Animation", key: "breath", label: "Manual breath", min: 0, max: 1, step: 0.01 },
];

// The artwork is drawn into a canvas that becomes a plane inside the WebGL
// scene, behind the crystal, so the transmission pass can genuinely refract it.
// A CSS background behind the canvas would never be refracted.
export function drawBackdrop(mode, size = 1024) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  if (mode === "dark") {
    const grad = ctx.createRadialGradient(size * 0.5, size * 0.42, size * 0.05, size * 0.5, size * 0.5, size * 0.78);
    grad.addColorStop(0, "#3a414f");
    grad.addColorStop(0.6, "#20242e");
    grad.addColorStop(1, "#101216");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    return canvas;
  }

  if (mode === "test") {
    ctx.fillStyle = "#f3f0f6";
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = "#b5a9c9";
    ctx.lineWidth = size * 0.0032;
    for (let x = -size; x < size * 2; x += size * 0.055) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + size, size);
      ctx.stroke();
    }

    const bars = ["#e8b4c8", "#b4d8e8", "#c8e8b4", "#e8dcb4", "#c7b4e8"];
    bars.forEach((color, index) => {
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.6;
      ctx.fillRect(size * 0.06, size * 0.2 + index * size * 0.075, size * 0.13, size * 0.05);
    });
    ctx.globalAlpha = 1;

    ctx.strokeStyle = "#8d80a8";
    ctx.lineWidth = size * 0.004;
    ctx.beginPath();
    ctx.arc(size * 0.5, size * 0.52, size * 0.3, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(size * 0.5, size * 0.24);
    ctx.lineTo(size * 0.76, size * 0.76);
    ctx.lineTo(size * 0.24, size * 0.76);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = "#4a4257";
    ctx.textAlign = "center";
    ctx.font = `700 ${Math.round(size * 0.075)}px sans-serif`;
    ctx.fillText("ALWAYS PAUSE", size * 0.5, size * 0.34);
    ctx.font = `400 ${Math.round(size * 0.033)}px sans-serif`;
    ctx.fillText("GLASS REFRACTION TEST", size * 0.5, size * 0.64);
    ctx.font = `400 ${Math.round(size * 0.019)}px monospace`;
    ctx.fillText("fine text should distort inside the glass", size * 0.5, size * 0.69);
    return canvas;
  }

  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0, "#fdfcfa");
  grad.addColorStop(0.55, "#f1eef6");
  grad.addColorStop(1, "#e2dcec");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}