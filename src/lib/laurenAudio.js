import narrationMap from "./laurenNarrationMap.json";

const AUDIO_BASE = "/audio/lauren";
const normalize = (value) => String(value ?? "").trim().toLowerCase();

export function laurenTechnique(technique) {
  if (!technique) return null;
  const byName = narrationMap.techniques[technique.name];
  if (byName) return byName;
  return Object.values(narrationMap.techniques).find(
    (entry) => entry.techniqueId === technique.id
  ) ?? null;
}

export function laurenPhaseClip(technique, phaseIndex, phaseLabel, phaseSeconds) {
  const entry = laurenTechnique(technique)?.phases?.[phaseIndex];
  if (!entry?.clipId) return null;
  // Do not give instructions for the wrong phase if Base44 technique data changes.
  if (normalize(entry.expectedLabel) !== normalize(phaseLabel)) return null;
  // Use the live breathing clock's duration, not a duration from the audio plan.
  const phaseMs = Number(phaseSeconds) * 1000;
  if (!Number.isFinite(phaseMs) || entry.audioMs + 50 > phaseMs) return null;
  return entry.clipId;
}

export function createLaurenPlayer() {
  let audio = null;
  let generation = 0;

  const stop = () => {
    generation += 1;
    if (!audio) return;
    audio.pause();
    audio.onended = null;
    audio.onerror = null;
    try { audio.currentTime = 0; } catch { /* no loaded metadata yet */ }
  };

  const play = (clipId, { onError, onEnded } = {}) => {
    if (!clipId || typeof Audio === "undefined") return false;
    stop();
    const current = generation;
    if (!audio) audio = new Audio();
    audio.preload = "auto";
    audio.src = `${AUDIO_BASE}/${clipId}.mp3`;
    audio.onended = () => { if (current === generation) onEnded?.(); };
    audio.onerror = () => { if (current === generation) onError?.(); };
    const result = audio.play();
    result?.catch?.(() => { if (current === generation) onError?.(); });
    return true;
  };

  return { play, stop };
}
