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
// Prefer an exact technique/position match. Fall back to a generic phase cue
// only when the manifest has no more specific cue for this technique.
export function findLaurenClip(library, technique, position, phaseSeconds) {
  const name = normalize(technique?.name);
  const phase = normalize(position);
  const candidates = [];
  for (const record of library?.recordings || []) {
    for (const use of record.used_by || []) {
      if (normalize(use.technique) !== name) continue;
      const target = normalize(use.position);
      const exact = target === phase;
      const generic = !["intro", "closing"].includes(phase) &&
        (target.startsWith(phase + " ") || phase.startsWith(target + " "));
      if (exact || generic) candidates.push({ record, exact });
    }
  }
  candidates.sort((a, b) => Number(b.exact) - Number(a.exact));
  const match = candidates.find(({ record }) => {
    const seconds = library?.durations?.[record.clip_id];
    return Number.isFinite(seconds) && seconds > 0 &&
      (phaseSeconds == null || seconds + 0.35 <= phaseSeconds);
  });
  if (!match) return null;
  const record = match.record;
  return {
    ...record,
    seconds: library.durations[record.clip_id],
    url: `/audio/lauren/${record.clip_id}.mp3`,
  };
}

export function phasePosition(label) {
  const raw = normalize(label);
  if (raw.includes("breathe in")) return "inhale";
  if (raw.includes("breathe out")) return "exhale";
  if (raw.includes("hum") && raw.includes("exhale")) return "hum exhale";
  return raw;
}

// Playback failure must not strand a user on the waiting screen. The watchdog
// is a failure fallback, not a substitute for the actual 'ended' event.
export function playLaurenClip(clip, onEnded) {
  const audio = new Audio(clip.url);
  audio.preload = "auto";
  let stopped = false;
  let timeout;
  const done = () => {
    if (stopped) return;
    stopped = true;
    window.clearTimeout(timeout);
    audio.pause();
    onEnded?.();
  };
  audio.addEventListener("ended", done, { once: true });
  audio.addEventListener("error", done, { once: true });
  timeout = window.setTimeout(done, Math.max(3000, (clip.seconds || 0) * 1000 + 2500));
  try {
    Promise.resolve(audio.play()).catch(done);
  } catch {
    done();
  }
  return () => {
    stopped = true;
    window.clearTimeout(timeout);
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
  };
}
