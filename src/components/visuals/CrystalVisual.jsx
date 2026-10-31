import CrystalPrototype, { CRYSTAL_DEFAULTS } from "./CrystalPrototype";

// The production Crystal style now uses the Prismatic Glass renderer.
// Keep the breathing clock upstream and leave the photo/background layer intact.
export default function CrystalVisual({
  breath = 0,
  theme = "day",
  reducedMotion = false,
  animate = true,
}) {
  return (
    <CrystalPrototype
      settings={CRYSTAL_DEFAULTS}
      breath={breath}
      dark={theme === "night"}
      animate={animate}
      reducedMotion={reducedMotion}
    />
  );
}
