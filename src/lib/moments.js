// "Your Moments" — local-only session history.
// Everything here stays on the device (localStorage, which the Capacitor iOS
// app persists across launches). This history is never sent to Base44, ad
// services or third-party analytics — if someone opts in to anonymous usage
// counts, only a completed flag and a rounded duration leave the device.

const STORAGE_KEY = "pauseMoments";
const MAX_RECORDS = 1000;

// Explicit shortcut choices. A session started from the orb has moment: null
// and is never attributed to a shortcut.
export const MOMENTS = [
  { id: "calm", label: "Feel calmer", categories: ["Calm"] },
  { id: "focus", label: "Find focus", categories: ["Focus"] },
  { id: "wind_down", label: "Wind down", categories: ["Sleep"] },
  { id: "reset", label: "Reset", categories: ["Stress Relief"] },
];

export const PERIODS = [
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "all", label: "All Time" },
];

function readAll() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(raw) ? raw.filter((record) => record && record.completed_at) : [];
  } catch {
    return [];
  }
}

export function loadMoments() {
  return readAll();
}

// Appends one session. Duplicate ids are ignored so a repeated callback or a
// re-render can never record the same pause twice.
export function addMoment(entry) {
  const all = readAll();
  if (all.some((record) => record.id === entry.id)) return all;
  const next = [...all, entry].slice(-MAX_RECORDS);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable — history simply isn't kept.
  }
  return next;
}

export function clearMoments() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}

function startOfDay(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function periodStart(period, now = new Date()) {
  const today = startOfDay(now);
  if (period === "week") {
    const sunday = new Date(today);
    sunday.setDate(sunday.getDate() - sunday.getDay());
    return sunday;
  }
  if (period === "month") {
    return new Date(today.getFullYear(), today.getMonth(), 1);
  }
  return null;
}

export function dayKey(value) {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

export function periodLabel(period, now = new Date()) {
  if (period === "month") {
    return now.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  }
  if (period === "week") {
    const start = periodStart("week", now);
    const format = (date) => date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return `${format(start)} – ${format(now)}`;
  }
  return "All your pauses";
}

export function formatDuration(totalSeconds) {
  const seconds = Math.max(0, Math.round(totalSeconds || 0));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
}

// Completed sessions only. Durations are the real elapsed breathing time.
export function getStats(moments, period, now = new Date()) {
  const start = periodStart(period, now);
  const completed = moments.filter((record) => {
    if (!record.completed) return false;
    const at = new Date(record.completed_at);
    if (Number.isNaN(at.getTime()) || at > now) return false;
    return !start || at >= start;
  });

  const byMoment = { calm: 0, focus: 0, wind_down: 0, reset: 0 };
  const days = new Set();
  let seconds = 0;
  let quick = 0;

  completed.forEach((record) => {
    seconds += Math.max(0, Math.round(record.duration_seconds || 0));
    days.add(dayKey(record.completed_at));
    if (record.moment && byMoment[record.moment] !== undefined) {
      byMoment[record.moment] += 1;
    } else {
      quick += 1;
    }
  });

  return { pauses: completed.length, seconds, daysUsed: days.size, byMoment, quick };
}

const REFLECTIONS = {
  calm: "You most often reached for a calming pause",
  focus: "Finding focus was your most common reason to pause",
  wind_down: "You made the most space for winding down",
  reset: "A quick reset was your most frequent pause",
};

export function getReflection(stats, period) {
  const when = period === "week" ? " this week" : period === "month" ? " this month" : "";
  const counts = MOMENTS.map((moment) => ({
    id: moment.id,
    count: stats.byMoment[moment.id] || 0,
  }));
  const highest = Math.max(...counts.map((entry) => entry.count));

  if (highest === 0) {
    return "Your moments will show up here once you've completed a pause or two.";
  }

  const leaders = counts.filter((entry) => entry.count === highest);
  if (leaders.length > 1) {
    return `You made space for a mix of different pauses${when}.`;
  }

  return `${REFLECTIONS[leaders[0].id]}${when}.`;
}

// One entry per calendar day that has already happened — never future days,
// so an empty square only ever means "no pause", not "you missed a day".
export function getActivity(moments, period, now = new Date()) {
  const today = startOfDay(now);
  let first;

  if (period === "week") {
    first = periodStart("week", now);
  } else if (period === "month") {
    first = new Date(today.getFullYear(), today.getMonth(), 1);
  } else {
    first = new Date(today);
    first.setDate(first.getDate() - 83);
  }

  const counts = {};
  moments
    .filter((record) => record.completed && record.completed_at)
    .forEach((record) => {
      const key = dayKey(record.completed_at);
      counts[key] = (counts[key] || 0) + 1;
    });

  const days = [];
  const cursor = new Date(first);
  while (cursor <= today) {
    days.push({ key: dayKey(cursor), date: new Date(cursor), count: counts[dayKey(cursor)] || 0 });
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export function groupIntoWeeks(days) {
  if (days.length === 0) return [];
  const weeks = [];
  let week = new Array(days[0].date.getDay()).fill(null);

  days.forEach((day) => {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  });

  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  return weeks;
}