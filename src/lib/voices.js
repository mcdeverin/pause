// ElevenLabs voice identifiers supplied by the project owner.
// Public identifiers only: API credentials must never be committed to the client.
export const VOICES = [
  { id: "kbX5GFsXCR5EpQkZJgeu", name: "Olivia", accent: "British", tone: "Female" },
  { id: "sDM8wW0sbrZWFoUX5r07", name: "Alex", accent: "British", tone: "Male" },
  { id: "v8DWAeuEGQSfwxqdH9t2", name: "Lauren", accent: "American", tone: "Female" },
  { id: "4JVOFy4SLQs9my0OLhEw", name: "Luca", accent: "American", tone: "Male" },
  { id: "wdymxIQkYn7MJCYCQF2Q", name: "Zara", accent: "Indian", tone: "Female" },
  { id: "I3l9G0ww7jdDDZ7DbY0k", name: "Tarun", accent: "Indian", tone: "Male" },
];
export const findVoice = (id) => VOICES.find((voice) => voice.id === id);
