// What people told us in onboarding, and how the app uses it.
//
// The answers stay on the device (localStorage, written by Onboarding.jsx) and
// are only used here:
//   • the home button leans toward the moments they said they need, while
//     still fitting the time of day;
//   • the chooser opens on that same moment;
//   • "Guided breathing" turns Lauren's voice on for their first sessions, and
//     "Sensory experiences" opens the Sensory library after onboarding (both in
//     Onboarding.jsx).

export const ONBOARDING_KEY = "alwaysPauseOnboardingV1";

// Onboarding answer → moment id (see MOMENTS in moments.js).
const GOAL_MOMENTS = {
  "Feel calmer": "calm",
  "Sleep better": "wind_down",
  "Find focus": "focus",
  "Feel energized": "energy",
  "Feel more present": "calm",
};
const NEED_MOMENTS = {
  "When I'm overwhelmed": "reset",
  "Before sleep": "wind_down",
  "Whenever I need a reset": "reset",
};

// For each time of day, the moments that make sense, best first.
const FITS_TIME = {
  morning: ["focus", "energy", "calm", "reset"],
  afternoon: ["reset", "focus", "calm", "energy"],
  evening: ["calm", "reset", "wind_down"],
  night: ["wind_down", "calm"],
};

export function loadOnboardingAnswers() {
  try {
    const stored = JSON.parse(localStorage.getItem(ONBOARDING_KEY) || "null");
    const answers = stored?.answers || {};
    return {
      goals: Array.isArray(answers.goals) ? answers.goals : [],
      experience: typeof answers.experience === "string" ? answers.experience : "",
      moments: Array.isArray(answers.moments) ? answers.moments : [],
    };
  } catch {
    return { goals: [], experience: "", moments: [] };
  }
}

/** The moment ids someone asked for in onboarding (may be empty). */
export function preferredMoments(answers = loadOnboardingAnswers()) {
  const ids = [
    ...answers.goals.map((goal) => GOAL_MOMENTS[goal]),
    ...answers.moments.map((need) => NEED_MOMENTS[need]),
  ].filter(Boolean);
  return [...new Set(ids)];
}

/**
 * The moment to suggest right now. Keeps the time-of-day default when it is one
 * they asked for (or they gave no preference); otherwise picks the first moment
 * they asked for that still suits this time of day.
 */
export function personalizeMoment(timeKey, timeMoment, answers = loadOnboardingAnswers()) {
  const wanted = preferredMoments(answers);
  if (wanted.length === 0 || wanted.includes(timeMoment)) return timeMoment;
  const match = (FITS_TIME[timeKey] || []).find((id) => wanted.includes(id));
  return match || timeMoment;
}
