import { useEffect, useMemo, useRef } from "react";

// The blob outline is drawn as real curves (never a rounded box), so no edge can
// render as a flat wall — it morphs smoothly between organic shapes, like before.
const PATHS = [
  "M100.0,12.6 C118.2,13.9 136.6,34.7 150.7,49.3 C164.8,63.8 183.8,82.2 184.6,100.0 C185.5,117.8 170.1,141.1 155.9,155.9 C141.8,170.8 118.0,189.9 100.0,189.2 C82.0,188.6 61.5,166.9 48.0,152.0 C34.5,137.2 20.1,118.4 19.0,100.0 C18.0,81.6 28.0,56.0 41.5,41.5 C54.9,26.9 81.8,11.3 100.0,12.6 Z",
  "M100.0,19.0 C120.4,19.5 147.6,26.7 159.8,40.2 C172.1,53.6 173.3,79.7 173.6,100.0 C173.9,120.3 174.1,148.6 161.8,161.8 C149.5,175.0 120.5,179.2 100.0,179.1 C79.5,179.0 51.4,174.3 38.8,161.2 C26.3,148.0 24.8,120.6 24.6,100.0 C24.3,79.4 25.0,51.0 37.5,37.5 C50.1,24.1 79.6,18.6 100.0,19.0 Z",
  "M100.0,11.7 C118.4,11.5 141.5,29.3 155.9,44.1 C170.4,58.8 187.1,82.0 186.5,100.0 C185.8,118.0 166.5,138.2 152.0,152.0 C137.6,165.8 118.6,181.5 100.0,182.8 C81.4,184.1 54.7,173.6 40.2,159.8 C25.6,146.0 11.7,119.1 12.6,100.0 C13.5,80.9 30.8,60.1 45.4,45.4 C59.9,30.6 81.6,11.9 100.0,11.7 Z",
  "M100.0,17.2 C119.7,16.5 148.0,25.0 161.2,38.8 C174.3,52.6 179.3,79.8 179.1,100.0 C178.9,120.2 173.0,145.4 159.8,159.8 C146.7,174.3 119.1,187.3 100.0,186.5 C80.9,185.6 59.2,169.1 45.4,154.6 C31.6,140.2 17.6,118.6 17.2,100.0 C16.8,81.4 29.0,56.6 42.8,42.8 C56.6,29.0 80.3,17.9 100.0,17.2 Z",
];

const NUM_RE = /-?\d+(?:\.\d+)?/g;
const TO_NUMBERS = PATHS.map((p) => p.match(NUM_RE).map(Number));

const buildPath = (numbers) => {
  let i = 0;
  return PATHS[0].replace(NUM_RE, () => numbers[i++].toFixed(1));
};

const EASE = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const CYCLE_MS = 8000;

let idCounter = 0;

export default function BlobShape({ theme = "day" }) {
  const isDayTheme = theme === "day";
  const gradientId = useMemo(() => `orb-grad-${++idCounter}`, []);
  const pathRef = useRef(null);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    const start = performance.now();
    let raf;

    const loop = (now) => {
      const progress = (((now - start) % CYCLE_MS) / CYCLE_MS) * TO_NUMBERS.length;
      const index = Math.floor(progress) % TO_NUMBERS.length;
      const t = EASE(progress - Math.floor(progress));
      const from = TO_NUMBERS[index];
      const to = TO_NUMBERS[(index + 1) % TO_NUMBERS.length];

      path.setAttribute("d", buildPath(from.map((v, i) => v + (to[i] - v) * t)));
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <svg
      viewBox="0 0 200 200"
      width="100%"
      height="100%"
      style={{ display: "block", overflow: "visible" }}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={gradientId} cx="35%" cy="35%" r="78%">
          {isDayTheme ? (
            <>
              <stop offset="0%" stopColor="#4A7FA6" />
              <stop offset="100%" stopColor="#6BA888" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#4A5B8C" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#9B8EC4" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#9B8EC4" stopOpacity="0.5" />
            </>
          )}
        </radialGradient>
      </defs>
      <path ref={pathRef} d={PATHS[0]} fill={`url(#${gradientId})`} />
    </svg>
  );
}