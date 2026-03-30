import { base44 } from "@/api/base44Client";

let cachedTechniques = null;
let lastTechnique = null;

export async function loadTechniques() {
  if (cachedTechniques) return cachedTechniques;

  const records = await base44.entities.Technique.list();
  
  cachedTechniques = records.map((record) => {
    const phaseDurations = record.phases.split(",").map((d) => parseInt(d.trim()));
    const phaseLabels = record.phaseLabels ? record.phaseLabels.split(",").map((l) => l.trim()) : phaseDurations.map(() => "hold");

    return {
      name: record.name,
      science: record.science,
      category: record.category,
      difficulty: record.difficulty,
      phases: phaseDurations.map((duration, idx) => ({
        label: phaseLabels[idx] || "hold",
        duration,
      })),
    };
  });

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