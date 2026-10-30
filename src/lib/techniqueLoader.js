import { base44 } from "@/api/base44Client";

let cachedTechniques = null;
let lastTechnique = null;

export async function loadTechniques() {
  if (cachedTechniques) return cachedTechniques;

  const records = await base44.entities.Technique.list();

  cachedTechniques = records.map((record) => ({
    id: record.id,
    name: record.name,
    scienceBlurb: record.scienceBlurb,
    scienceBlurbSource: record.scienceBlurbSource,
    scienceBlurbSourceUrl: record.scienceBlurbSourceUrl,
    category: record.category,
    difficulty: record.difficulty,
    phases: record.phases,
    phaseLabels: record.phaseLabels,
  }));

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