import { useEffect, useRef, useState } from "react";

// Sample cycle in seconds: inhale, hold, exhale, hold.
export const SAMPLE_PHASES = [4, 2, 6, 2];

// 0 at rest, 1 at full inhale. Holds stay flat, so the crystal never jumps.
function breathAt(phases, seconds) {
  let remaining = seconds;
  for (let index = 0; index < phases.length; index += 1) {
    const duration = phases[index];
    if (remaining < duration) {
      const progress = duration > 0 ? remaining / duration : 1;
      const eased = progress * progress * (3 - 2 * progress);
      if (index === 0) return eased;
      if (index === 1) return 1;
      if (index === 2) return 1 - eased;
      return 0;
    }
    remaining -= duration;
  }
  return 0;
}

// Drives the breathing value into a ref rather than React state, so the 3D
// canvases follow the cycle at full frame rate without re-rendering the studio.
export default function useStudioBreath({ running, manual, target }) {
  const manualRef = useRef(manual);
  manualRef.current = manual;

  useEffect(() => {
    if (!running) return undefined;
    const total = SAMPLE_PHASES.reduce((sum, duration) => sum + duration, 0);
    let frame = 0;
    let last = performance.now();
    let seconds = 0;

    const tick = (now) => {
      frame = requestAnimationFrame(tick);
      const dt = Math.min(0.06, Math.max(0, (now - last) / 1000));
      last = now;
      if (document.hidden) return;
      seconds = (seconds + dt) % total;
      target.current = breathAt(SAMPLE_PHASES, seconds);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, target]);

  useEffect(() => {
    if (!running) target.current = manual;
  }, [running, manual, target]);
}

// The existing prototype takes breath as a prop, so it re-renders. Sampling the
// ref at a modest rate keeps that rebuild tiny and leaves the 3D loop alone.
export function useBreathMirror(source, enabled, fallback) {
  const [value, setValue] = useState(fallback);
  const lastRef = useRef(fallback);

  useEffect(() => {
    if (!enabled) {
      lastRef.current = fallback;
      setValue(fallback);
      return undefined;
    }
    let frame = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      const next = source?.current;
      if (typeof next === "number" && Math.abs(next - lastRef.current) > 0.02) {
        lastRef.current = next;
        setValue(next);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [source, enabled, fallback]);

  return value;
}