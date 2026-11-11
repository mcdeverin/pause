// Lauren's recordings are optional companions to the existing breathing clock.
// The technique is always chosen by the user's need, never by audio availability.
let libraryPromise;
const normalize = value => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
export const isVideoFirst = (library, technique) => (library?.video_first || []).some(name => normalize(name) === normalize(technique?.name));
export async function loadLaurenLibrary() {
  if (!libraryPromise) libraryPromise = Promise.all([
    fetch("/audio/lauren/manifest.json").then(r => { if (!r.ok) throw Error("Lauren manifest missing"); return r.json(); }),
    fetch("/audio/lauren/durations.json").then(r => { if (!r.ok) throw Error("Lauren durations missing"); return r.json(); }),
  ]).then(([manifest, durations]) => ({ ...manifest, durations })).catch(error => { libraryPromise = null; throw error; });
  return libraryPromise;
}
export function findLaurenClip(library, technique, position, phaseSeconds) {
  const name = normalize(technique?.name);
  const phase = normalize(position);
  const matches = (library?.recordings || []).filter(record =>
    (record.used_by || []).some(use => normalize(use.technique) === name && normalize(use.position) === phase)
  );
  const eligible = matches.find(record => {
    const seconds = library.durations?.[record.clip_id];
    return phaseSeconds == null || (Number.isFinite(seconds) && seconds + 0.35 <= phaseSeconds);
  });
  return eligible ? { ...eligible, seconds: library.durations[eligible.clip_id], url: `/audio/lauren/${eligible.clip_id}.mp3` } : null;
}
export function phasePosition(label) {
  const raw = normalize(label);
  if (raw.includes("inhale") || raw.includes("breathe in")) return "inhale";
  if (raw.includes("exhale") || raw.includes("breathe out")) return "exhale";
  if (raw.includes("hold")) return "hold";
  return raw;
}
export function playLaurenClip(clip, onEnded) {
  const audio = new Audio(clip.url);
  audio.preload = "auto";
  let stopped = false;
  const done = () => { if (!stopped) onEnded?.(); };
  audio.addEventListener("ended", done, { once: true });
  audio.addEventListener("error", done, { once: true });
  const result = audio.play();
  result?.catch(done);
  return () => { stopped = true; audio.pause(); audio.removeAttribute("src"); audio.load(); };
}
