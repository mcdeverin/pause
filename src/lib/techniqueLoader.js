import { base44 } from "@/api/base44Client";
import BUNDLED_TECHNIQUES from "@/data/techniques.json";

// The exercise library ships inside the app, so breathing works with no
// connection at all. When the device is online, the app quietly asks Base44 for
// the latest records and keeps them for next time; edits made in Base44 still
// reach people, they just never block a session.
const CACHE_KEY = "pauseTechniquesCache";

let cachedTechniques = null;
let refreshStarted = false;
let lastTechnique = null;

function normalize(record) {
  return {
    id: record.id,
    name: record.name,
    scienceBlurb: record.scienceBlurb,
    scienceBlurbSource: record.scienceBlurbSource,
    scienceBlurbSourceUrl: record.scienceBlurbSourceUrl,
    category: record.category,
    difficulty: record.difficulty,
    phases: record.phases,
    phaseLabels: record.phaseLabels,
  };
}

function isUsableList(records) {
  return Array.isArray(records) && records.length > 0 && records.every((r) => r && r.id && r.name && r.phases);
}

function readCache() {
  try {
    const stored = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    return isUsableList(stored) ? stored : null;
  } catch {
    return null;
  }
}

function writeCache(records) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(records));
  } catch {
    // Storage unavailable — the bundled library is still there next launch.
  }
}

// Fire-and-forget: a slow or failed request never affects the current session.
function refreshFromBase44() {
  if (refreshStarted) return;
  refreshStarted = true;
  Promise.resolve()
    .then(() => base44.entities.Technique.list())
    .then((records) => {
      const fresh = (records || []).map(normalize);
      if (!isUsableList(fresh)) return;
      writeCache(fresh);
      cachedTechniques = fresh;
    })
    .catch(() => {
      // Offline or Base44 unavailable: keep using what is on the device.
    });
}

export async function loadTechniques() {
  if (!cachedTechniques) {
    cachedTechniques = readCache() || BUNDLED_TECHNIQUES.map(normalize);
  }
  refreshFromBase44();
  return cachedTechniques;
}

export function getRandomTechnique(techniques) {
  if (!techniques || techniques.length === 0) return null;

  let technique;
  do {
    technique = techniques[Math.floor(Math.random() * techniques.length)];
  } while (technique === lastTechnique && techniques.length > 1);

  lastTechnique = technique;
  return technique;
}
