import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildBreathPlan, sessionStateAt } from "../lib/breathing";

// The session clock. Elapsed time comes from the monotonic frame timestamp
// (performance.now origin), never from counting intervals, so it cannot drift.
//
// Backgrounding, interruptions and frame stalls: a single frame may advance the
// session by at most MAX_STEP_SECONDS. A larger gap means the app was suspended
// or interrupted, so that time is discarded and the session resumes exactly
// where it left off instead of jumping to a new phase.
const MAX_STEP_SECONDS = 0.12;
// ~30 publishes per second is smooth on screen; the values themselves are
// continuous, so consecutive frames never show a visible step.
const MIN_PUBLISH_STEP = 0.032;

export default function useBreathingClock({ phases, labels, cycles = 4, onComplete }) {
  const plan = useMemo(() => buildBreathPlan(phases, labels), [phases, labels]);
  const total = plan.duration * cycles;

  const [state, setState] = useState(() => sessionStateAt(plan, cycles, 0));

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const elapsedRef = useRef(0);
  const lastFrameRef = useRef(0);
  const lastPublishRef = useRef(0);
  const completedRef = useRef(false);
  const rafRef = useRef(0);
  const timeoutRef = useRef(0);

  useEffect(() => {
    elapsedRef.current = 0;
    lastFrameRef.current = 0;
    lastPublishRef.current = 0;
    completedRef.current = false;
    setState(sessionStateAt(plan, cycles, 0));

    const publish = (elapsed, force = false) => {
      if (!force && elapsed - lastPublishRef.current < MIN_PUBLISH_STEP) return;
      lastPublishRef.current = elapsed;
      setState(sessionStateAt(plan, cycles, elapsed));
    };

    const frame = (now) => {
      // A zero last-frame means "start fresh" — after mount, or after the app
      // comes back to the foreground — so no suspended time is ever added.
      if (lastFrameRef.current === 0) lastFrameRef.current = now;
      const delta = Math.min(
        Math.max((now - lastFrameRef.current) / 1000, 0),
        MAX_STEP_SECONDS
      );
      lastFrameRef.current = now;

      elapsedRef.current = Math.min(elapsedRef.current + delta, total);
      publish(elapsedRef.current);

      if (elapsedRef.current >= total) {
        if (!completedRef.current) {
          completedRef.current = true;
          publish(total, true);
          timeoutRef.current = window.setTimeout(() => {
            onCompleteRef.current?.({ completed: true, elapsedSeconds: total });
          }, 500);
        }
        return;
      }

      rafRef.current = requestAnimationFrame(frame);
    };

    const handleVisibility = () => {
      lastFrameRef.current = 0;
    };

    rafRef.current = requestAnimationFrame(frame);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.clearTimeout(timeoutRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [plan, cycles, total]);

  // Ends the session early and returns the real elapsed time.
  const cancel = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    window.clearTimeout(timeoutRef.current);
    completedRef.current = true;
    return elapsedRef.current;
  }, []);

  return { ...state, cancel };
}