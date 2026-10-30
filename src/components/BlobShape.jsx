import { useEffect, useMemo, useRef } from "react";

// The blob outline is drawn as real curves (never a rounded box), so no edge can
// render as a flat wall — it morphs smoothly between organic shapes, like before.
const PATHS = [
  "M100.0,2.0 C120.7,3.4 142.0,25.7 158.0,42.0 C174.0,58.4 195.5,80.2 196.0,100.0 C196.5,119.8 176.8,144.5 160.8,160.8 C144.8,177.1 120.0,198.2 100.0,198.0 C80.0,197.8 55.6,175.7 40.6,159.4 C25.6,143.1 11.2,121.0 10.0,100.0 C8.8,79.0 18.5,49.9 33.5,33.5 C48.5,17.2 79.3,0.6 100.0,2.0 Z",
  "M100.0,10.0 C122.9,10.2 153.9,17.1 167.9,32.1 C181.9,47.1 183.8,77.1 184.0,100.0 C184.2,122.9 183.3,154.6 169.3,169.3 C155.3,184.0 122.9,188.2 100.0,188.0 C77.1,187.8 46.5,182.5 32.1,167.9 C17.8,153.2 14.2,122.9 14.0,100.0 C13.8,77.1 16.4,45.7 30.7,30.7 C45.0,15.7 77.1,9.8 100.0,10.0 Z",
  "M100.0,2.0 C120.5,1.8 146.2,21.4 162.2,37.8 C178.2,54.1 196.5,79.7 196.0,100.0 C195.5,120.3 175.4,144.1 159.4,159.4 C143.4,174.7 121.0,190.8 100.0,192.0 C79.0,193.2 49.9,181.8 33.5,166.5 C17.2,151.1 1.1,121.2 2.0,100.0 C2.9,78.8 22.9,55.5 39.2,39.2 C55.5,22.9 79.5,2.2 100.0,2.0 Z",
  "M100.0,8.0 C121.9,7.3 153.2,16.8 167.9,32.1 C182.5,47.5 188.2,77.6 188.0,100.0 C187.8,122.4 181.1,150.5 166.5,166.5 C151.8,182.5 121.2,196.9 100.0,196.0 C78.8,195.1 54.5,176.8 39.2,160.8 C23.9,144.8 8.5,120.7 8.0,100.0 C7.5,79.3 21.0,51.7 36.4,36.4 C51.7,21.0 78.1,8.7 100.0,8.0 Z",
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