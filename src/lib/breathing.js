// Maps a technique's phase label onto a breath direction.
// Used only for visualisation (ring fill) — never for session timing.

export function phaseKind(label) {
  const value = String(label || "").toLowerCase();

  if (value.includes("exhale") || value.includes("hum")) return "out";
  if (value.includes("hold") || value.includes("empty") || value.includes("retention"))
    return "hold";
  if (
    value.includes("inhale") ||
    value.includes("sniff") ||
    value === "belly" ||
    value === "chest" ||
    value === "collar"
  ) {
    return "in";
  }
  return "neutral";
}

// How full the visualisation should be (0 = empty lungs, 1 = full).
export function fillForPhase(label, phaseProgress, previousLabel) {
  const kind = phaseKind(label);
  const clamped = Math.min(Math.max(phaseProgress || 0, 0), 1);

  if (kind === "in") return clamped;
  if (kind === "out") return 1 - clamped;
  if (kind === "hold") return phaseKind(previousLabel) === "in" ? 1 : 0;
  return 0.5;
}