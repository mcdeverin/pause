const techniques = [
  {
    name: "Box Breathing",
    science: "Used by Navy SEALs to maintain calm and performance under extreme stress. Resets the autonomic nervous system within 60 seconds.",
    phases: [
      { label: "inhale", duration: 4 },
      { label: "hold", duration: 4 },
      { label: "exhale", duration: 4 },
      { label: "hold2", duration: 4 },
    ],
  },
  {
    name: "4-7-8 Breathing",
    science: "Developed by Dr. Andrew Weil. Activates the parasympathetic nervous system and lowers cortisol within 60 seconds.",
    phases: [
      { label: "inhale", duration: 4 },
      { label: "hold", duration: 7 },
      { label: "exhale", duration: 8 },
    ],
  },
  {
    name: "Physiological Sigh",
    science: "Stanford neuroscientists found this is the fastest known way to reduce stress in real time — faster than any other breathing pattern.",
    phases: [
      { label: "inhale", duration: 2 },
      { label: "inhale2", duration: 1 },
      { label: "exhale", duration: 6 },
    ],
  },
  {
    name: "Resonance Breathing",
    science: "Breathing at 5.5 breaths per minute is the mathematical resonance frequency of the human cardiovascular system, maximizing HRV.",
    phases: [
      { label: "inhale", duration: 6 },
      { label: "exhale", duration: 6 },
    ],
  },
  {
    name: "Extended Exhale",
    science: "Doubling exhale length directly stimulates the vagus nerve, shifting the body from fight-or-flight to rest-and-digest.",
    phases: [
      { label: "inhale", duration: 4 },
      { label: "exhale", duration: 8 },
    ],
  },
  {
    name: "2-1-4-1 Breathing",
    science: "A gentle entry-level technique that introduces breath control without strain. Ideal for beginners or moments of acute anxiety.",
    phases: [
      { label: "inhale", duration: 2 },
      { label: "hold", duration: 1 },
      { label: "exhale", duration: 4 },
      { label: "hold2", duration: 1 },
    ],
  },
  {
    name: "Wim Hof Breathing",
    science: "Developed by Wim Hof. Shown in studies to reduce inflammatory markers and strengthen immune response through controlled hyperventilation.",
    phases: [
      { label: "inhale", duration: 3 },
      { label: "exhale", duration: 2 },
    ],
  },
  {
    name: "Alternate Nostril",
    science: "Ancient pranayama technique shown to balance left and right brain hemispheres and reduce blood pressure within minutes.",
    phases: [
      { label: "inhale", duration: 4 },
      { label: "hold", duration: 4 },
      { label: "exhale", duration: 4 },
      { label: "hold2", duration: 4 },
    ],
  },
  {
    name: "Belly Breathing",
    science: "Activates the diaphragm fully, stimulating the vagus nerve. Reduces cortisol by up to 25% in clinical studies.",
    phases: [
      { label: "inhale", duration: 4 },
      { label: "hold", duration: 2 },
      { label: "exhale", duration: 6 },
    ],
  },
  {
    name: "5-5 Coherence",
    science: "Coherent breathing at 6 breaths per minute has been shown to reduce PTSD symptoms and improve heart rate variability significantly.",
    phases: [
      { label: "inhale", duration: 5 },
      { label: "exhale", duration: 5 },
    ],
  },
  {
    name: "4-4-6-2 Breathing",
    science: "A military-derived variation that extends the exhale for deeper parasympathetic activation while maintaining mental clarity.",
    phases: [
      { label: "inhale", duration: 4 },
      { label: "hold", duration: 4 },
      { label: "exhale", duration: 6 },
      { label: "hold2", duration: 2 },
    ],
  },
  {
    name: "Triangle Breathing",
    science: "The equal ratio triangle pattern creates a symmetrical nervous system response — used in mindfulness-based stress reduction programs.",
    phases: [
      { label: "inhale", duration: 4 },
      { label: "hold", duration: 4 },
      { label: "exhale", duration: 4 },
    ],
  },
  {
    name: "Sitali Breath",
    science: "Yoga tradition's cooling breath. Research shows slow mouth inhalation activates cooling receptors that lower perceived body temperature and anxiety.",
    phases: [
      { label: "inhale", duration: 4 },
      { label: "hold", duration: 2 },
      { label: "exhale", duration: 6 },
    ],
  },
  {
    name: "1-4-2 Breathing",
    science: "A ratio-based technique where the hold is 4x the inhale. Extended breath retention increases CO2 tolerance and deepens calm.",
    phases: [
      { label: "inhale", duration: 4 },
      { label: "hold", duration: 16 },
      { label: "exhale", duration: 8 },
    ],
  },
  {
    name: "Ocean Breathing",
    science: "Creates an audible ocean-like sound that stimulates the vagus nerve through throat vibration — used in yoga for centuries and validated by modern neuroscience.",
    phases: [
      { label: "inhale", duration: 5 },
      { label: "exhale", duration: 5 },
    ],
  },
];

let lastTechnique = null;

export function getRandomTechnique() {
  let technique;
  do {
    technique = techniques[Math.floor(Math.random() * techniques.length)];
  } while (technique === lastTechnique && techniques.length > 1);
  
  lastTechnique = technique;
  return technique;
}

export function getTotalCycleDuration(technique) {
  return technique.phases.reduce((sum, p) => sum + p.duration, 0);
}