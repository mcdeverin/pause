// Shared breathing maths — one plan, one progress model.
//
// `breath` is lung fullness on a 0..1 scale (0 = empty, 1 = full) and is the
// single value both visualisations render: the ring uses it as its fill and the
// orb derives its scale from it. Nothing here runs a timer — the session clock
// in useBreathingClock supplies elapsed time and calls these pure helpers.

const IN_WORDS = ["inhale", "sniff", "sip", "belly", "chest", "collar"];
const OUT_WORDS = ["exhale", "hum"];
const EMPTY_WORDS = ["empty", "rest", "retention", "suspend"];
const HOLD_WORDS = ["hold", "pause", "still"];

// Maps a phase label onto a breath direction.
// "in" rises, "out" falls, "hold" holds whatever level the breath is at,
// "holdEmpty" is a hold with empty lungs. An unrecognised cue is treated as a
// hold so the visuals never invent a movement the technique doesn't ask for.
export function phaseKind(label) {
  const value = String(label || "").toLowerCase();
  if (!value) return "hold";
  if (EMPTY_WORDS.some((word) => value.includes(word))) return "holdEmpty";
  if (OUT_WORDS.some((word) => value.includes(word))) return "out";
  if (IN_WORDS.some((word) => value.includes(word))) return "in";
  if (HOLD_WORDS.some((word) => value.includes(word))) return "hold";
  return "hold";
}

// Builds one breath cycle. Each segment keeps its own duration, label and
// start time (so cues stay per-phase), while the breath levels account for
// multi-stage inhales (belly → chest → collar) and repeated inhales
// (inhale → inhale again) as one continuous movement.
export function buildBreathPlan(phases, labels) {
  const cleaned = (Array.isArray(phases) ? phases : [])
    .map((duration) => Number(duration))
    .filter((duration) => Number.isFinite(duration) && duration > 0);

  const segments = cleaned.map((duration, index) => ({
    duration,
    label: (labels && labels[index]) || "",
    kind: phaseKind(labels && labels[index]),
  }));

  if (segments.length === 0) {
    return { segments: [], duration: 0 };
  }

  // Consecutive segments moving the same way become one run.
  const runs = [];
  segments.forEach((segment, index) => {
    const previous = runs[runs.length - 1];
    if (
      previous &&
      (segment.kind === "in" || segment.kind === "out") &&
      previous.kind === segment.kind
    ) {
      previous.duration += segment.duration;
      previous.indices.push(index);
    } else {
      runs.push({ kind: segment.kind, duration: segment.duration, indices: [index] });
    }
  });

  // A cycle starts empty, unless it opens by breathing out (lungs full) or by
  // holding after a cycle that ends on an inhale (lungs full).
  const first = runs[0];
  const last = runs[runs.length - 1];
  let level = 0;
  if (first.kind === "out") level = 1;
  else if (first.kind === "hold" && last.kind === "in") level = 1;

  let clock = 0;
  const planned = segments.map((segment) => ({ ...segment, startTime: 0, from: 0, to: 0 }));

  runs.forEach((run) => {
    const from = level;
    let to = level;
    if (run.kind === "in") to = 1;
    else if (run.kind === "out") to = 0;
    else if (run.kind === "holdEmpty") to = 0;
    level = to;

    let runClock = clock;
    let segmentLevel = from;

    run.indices.forEach((index, position) => {
      const segment = segments[index];
      const isLast = position === run.indices.length - 1;
      const travel = (runClock + segment.duration - clock) / run.duration;
      const nextLevel = isLast ? to : from + (to - from) * travel;

      planned[index].startTime = runClock;
      planned[index].from = segmentLevel;
      planned[index].to = nextLevel;

      segmentLevel = nextLevel;
      runClock += segment.duration;
    });

    clock += run.duration;
  });

  return { segments: planned, duration: clock };
}

// Normalised phase progress and breath at a point inside one cycle.
export function breathAt(plan, seconds) {
  const { segments, duration } = plan;
  if (!segments || segments.length === 0 || duration <= 0) {
    return {
      index: 0,
      label: "",
      phaseProgress: 0,
      phaseElapsed: 0,
      phaseRemaining: 0,
      breath: 0,
    };
  }

  const cycleTime = ((seconds % duration) + duration) % duration;

  let index = segments.length - 1;
  for (let i = 0; i < segments.length; i += 1) {
    if (cycleTime < segments[i].startTime + segments[i].duration) {
      index = i;
      break;
    }
  }

  const segment = segments[index];
  const phaseProgress = Math.min(
    Math.max((cycleTime - segment.startTime) / segment.duration, 0),
    1
  );
  const breath = segment.from + (segment.to - segment.from) * phaseProgress;

  return {
    index,
    label: segment.label,
    phaseProgress,
    phaseElapsed: phaseProgress * segment.duration,
    phaseRemaining: segment.duration * (1 - phaseProgress),
    breath: Math.min(Math.max(breath, 0), 1),
  };
}

// Everything the session UI shows, at a given elapsed time.
export function sessionStateAt(plan, cycles, elapsed) {
  const cycleCount = Math.max(1, cycles);
  const total = plan.duration * cycleCount;
  const clamped = Math.min(Math.max(elapsed, 0), total);
  // At the very end stay on the last phase so the final cue doesn't snap back.
  const cycleTime = clamped >= total ? Math.max(plan.duration - 1e-6, 0) : clamped % plan.duration;
  const phase = breathAt(plan, cycleTime);

  return {
    ...phase,
    elapsed: clamped,
    totalDuration: total,
    timeRemaining: Math.max(total - clamped, 0),
    progress: total > 0 ? Math.min(clamped / total, 1) : 1,
  };
}