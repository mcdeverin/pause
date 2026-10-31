import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildBreathPlan, sessionStateAt } from "../lib/breathing";

// The session clock. Elapsed time is always the real time since the session
// started, never a count of frames or intervals. That matters on a phone: while
// the screen is untouched the device may draw far fewer frames, and counting
// frames would make the breathing run slow and look frozen between taps.
//
// The one thing that is not counted is time spent in the background, so an
// interruption resumes the session where it stopped instead of jumping ahead.
const MIN_PUBLISH_STEP = 0.032;

export default function useBreathingClock({ phases, labels, cycles = 4, onComplete }) {
  const plan = useMemo(() => buildBreathPlan(phases, labels), [phases, labels]);
  const total = plan.duration * cycles;

  const [state, setState] = useState(() => sessionStateAt(plan, cycles, 0));

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const elapsedRef = useRef(0);
  const originRef = useRef(0);
  const suspendedRef = useRef(0);
  const hiddenAtRef = useRef(0);
  const lastPublishRef = useRef(0);
  const completedRef = useRef(false);
  const rafRef = useRef(0);
  const timeoutRef = useRef(0);

  useEffect(() => {
    elapsedRef.current = 0;
    originRef.current = 0;
    suspendedRef.current = 0;
    hiddenAtRef.current = 0;
    lastPublishRef.current = 0;
    completedRef.current = false;
    setState(sessionStateAt(plan, cycles, 0));

    const publish = (elapsed, force = false) => {
      if (!force && elapsed - lastPublishRef.current < MIN_PUBLISH_STEP) return;
      lastPublishRef.current = elapsed;
      setState(sessionStateAt(plan, cycles, elapsed));
    };

    // Time on the wall since the first frame, minus whatever was spent hidden.
    const elapsedAt = (now) => {
      if (originRef.current === 0) originRef.current = now;
      const running = (now - originRef.current) / 1000 - suspendedRef.current;
      return Math.min(Math.max(running, 0), total);
    };

    const frame = (now) => {
      elapsedRef.current = elapsedAt(now);
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

    const markHidden = () => {
      if (!hiddenAtRef.current) hiddenAtRef.current = performance.now();
    };
    const markVisible = () => {
      if (!hiddenAtRef.current) return;
      suspendedRef.current += (performance.now() - hiddenAtRef.current) / 1000;
      hiddenAtRef.current = 0;
    };
    const handleVisibility = () => (document.hidden ? markHidden() : markVisible());

    if (document.hidden) markHidden();
    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("pagehide", markHidden);
    window.addEventListener("pageshow", markVisible);

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.clearTimeout(timeoutRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("pagehide", markHidden);
      window.removeEventListener("pageshow", markVisible);
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