// Narration is an optional layer over the existing technique clock.
// Scripts may be authored alongside technique data or imported as a static JSON
// manifest later; they must never redefine the orb's phase durations.
export function parseNarrationScript(value) {
  if (!value) return null;
  try {
    const script = typeof value === "string" ? JSON.parse(value) : value;
    return script && typeof script === "object" ? script : null;
  } catch {
    return null;
  }
}

export function narrationCueForPhase(technique, phaseIndex, cycleIndex = 0) {
  const script = parseNarrationScript(technique?.narrationScript) || getBundledNarration(technique);
  if (!script) return null;
  const cues = Array.isArray(script.cues) ? script.cues : Array.isArray(script.phase_cues) ? script.phase_cues : [];
  const matches = cues.filter((cue) => Number(cue.phase ?? cue.phaseIndex ?? cue.phase_index) === phaseIndex);
  const chosen = matches.find((cue) => Number(cue.cycle ?? cue.cycleIndex) === cycleIndex)
    || matches.find((cue) => cue.cycle == null && cue.cycleIndex == null);
  return typeof (chosen?.text ?? chosen?.spoken_text) === "string" ? (chosen.text ?? chosen.spoken_text).trim() : null;
}

// A recording is only publishable if it fits within its assigned phase.
// Duration metadata must come from the actual generated audio, not estimated
// from the text or the ElevenLabs request.
export function cueFitsPhase(audioDurationMs, phaseSeconds, bufferMs = 250) {
  return Number.isFinite(audioDurationMs) && Number.isFinite(phaseSeconds)
    && audioDurationMs > 0 && audioDurationMs + bufferMs <= phaseSeconds * 1000;
}

// A bundled manifest can be loaded once at startup; it does not modify Base44.
let bundledNarration = new Map();
export function registerNarrationManifest(manifest) {
  const records = Array.isArray(manifest) ? manifest : manifest?.techniques;
  if (!Array.isArray(records)) return 0;
  bundledNarration = new Map();
  for (const record of records) {
    if (record.technique_id) bundledNarration.set(String(record.technique_id), record);
    if (record.technique_name) bundledNarration.set(String(record.technique_name).toLowerCase(), record);
  }
  return records.length;
}
export function getBundledNarration(technique) {
  return bundledNarration.get(String(technique?.id || "")) || bundledNarration.get(String(technique?.name || "").toLowerCase()) || null;
}
export async function loadNarrationManifest() {
  try {
    const response = await fetch("/narration/always_pause_50_narration_scripts.json");
    if (!response.ok) return 0;
    return registerNarrationManifest(await response.json());
  } catch { return 0; }
}
