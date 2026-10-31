import { useRef } from "react";
import PrismaticGlass from "../crystalStudio/PrismaticGlass";
import { PRISMATIC_DEFAULTS } from "../../lib/crystalStudio";

// The Crystal choice uses the exact Prismatic Glass renderer from Crystal Comparison.
// The existing breathing clock remains the single source of breath timing.
export default function CrystalVisual({
  breath = 0,
  theme = "day",
  reducedMotion = false,
  animate = true,
  photo = null,
  backgroundSettings = {},
}) {
  const breathRef = useRef(breath);
  breathRef.current = breath;
  return (
    <PrismaticGlass
      settings={PRISMATIC_DEFAULTS}
      breathRef={breathRef}
      mode={photo ? "photo" : theme === "night" ? "dark" : "light"}
      photo={photo}
      playing={animate}
      reducedMotion={reducedMotion}
      quality="balanced"
      transparentCanvas
    />
  );
}
