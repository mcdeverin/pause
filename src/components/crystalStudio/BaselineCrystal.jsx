import CrystalPrototype from "./CrystalPrototypeBaseline";
import { useBreathMirror } from "@/hooks/useStudioBreath";

// Thin wrapper only: the prototype itself is never modified. It takes breath as
// a prop, so this mirrors the shared timeline into it.
export default function BaselineCrystal({
  settings,
  breathRef,
  manualBreath,
  synced,
  playing,
  dark,
  testPattern,
  reducedMotion,
}) {
  const breath = useBreathMirror(breathRef, synced, manualBreath);

  return (
    <CrystalPrototype
      settings={settings}
      animate={playing}
      reducedMotion={reducedMotion}
      breath={breath}
      dark={dark}
      testPattern={testPattern}
    />
  );
}