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
  const script = parseNarrationScript(technique?.narrationScript);
  if (!script) return null;
  const cues = Array.isArray(script.cues) ? script.cues : Array.isArray(script.phase_cues) ? script.phase_cues : [];
  const matches = cues.filter((cue) => Number(cue.phase ?? cue.phaseIndex) === phaseIndex);
  const chosen = matches.find((cue) => Number(cue.cycle ?? cue.cycleIndex) === cycleIndex)
    || matches.find((cue) => cue.cycle == null && cue.cycleIndex == null);
  return typeof chosen?.text === "string" ? chosen.text.trim() : null;
}

// A recording is only publishable if it fits within its assigned phase.
// Duration metadata must come from the actual generated audio, not estimated
// from the text or the ElevenLabs request.
export function cueFitsPhase(audioDurationMs, phaseSeconds, bufferMs = 250) {
  return Number.isFinite(audioDurationMs) && Number.isFinite(phaseSeconds)
    && audioDurationMs > 0 && audioDurationMs + bufferMs <= phaseSeconds * 1000;
}
