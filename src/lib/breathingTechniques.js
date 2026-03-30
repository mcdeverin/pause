const techniques = [
  {
    name: "Box Breathing",
    description: "4 counts each: inhale, hold, exhale, hold",
    science: "Used by Navy SEALs to control the autonomic nervous system under extreme stress in seconds.",
    description: "Inhale 4, hold 7, exhale 8",
    science: "Developed by Dr. Andrew Weil. Activates the parasympathetic nervous system and drops cortisol within 60 seconds.",
    phases: [
      { label: "inhale", duration: 4000 },
      { label: "hold", duration: 7000 },
      { label: "exhale", duration: 8000 },
    ],
  },
  {
    name: "Physiological Sigh",
    description: "Double inhale through nose, long slow exhale through mouth",
    science: "Stanford neuroscientists found this is the fastest known way to reduce stress in real time — faster than any other breathing pattern.",
    phases: [
      { label: "inhale", duration: 2500 },
      { label: "inhale", duration: 1500 },
      { label: "exhale", duration: 6000 },
    ],
  },
  {
    name: "Resonance Breathing",
    description: "Inhale 5.5 seconds, exhale 5.5 seconds",
    science: "Breathing at exactly 5.5 breaths per minute is the mathematical resonance frequency of the human cardiovascular system, maximizing heart rate variability.",
    phases: [
      { label: "inhale", duration: 5500 },
      { label: "exhale", duration: 5500 },
    ],
  },
  {
    name: "Extended Exhale",
    description: "Inhale 4, exhale 8",
    science: "Doubling exhale length directly stimulates the vagus nerve, shifting your body from fight-or-flight to rest-and-digest instantly."
    phases: [
      { label: "inhale", duration: 4000 },
      { label: "exhale", duration: 8000 },
    ],
  },
];

export function getRandomTechnique() {
  return techniques[Math.floor(Math.random() * techniques.length)];
}

export function getTotalCycleDuration(technique) {
  return technique.phases.reduce((sum, p) => sum + p.duration, 0);
}