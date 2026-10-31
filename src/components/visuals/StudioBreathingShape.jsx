import { useRef } from "react";
import ShapeScene from "./ShapeScene";

// Bridge the production breathing clock to the existing Three.js studio visuals.
export default function StudioBreathingShape({ kind, breath = 0, photo = null, backgroundSettings = {}, theme = "day" }) {
  const breathRef = useRef(breath);
  const motionRef = useRef(0);
  breathRef.current = breath;
  const photoUrl = typeof photo === "string" ? photo : photo?.url || photo?.dataUrl || null;
  // Production visuals are overlays: the app owns and displays the background.
  const background = kind === "dropletsSingle" ? (photoUrl ? "photo" : theme === "night" ? "dark" : "light") : "transparent";
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <ShapeScene kind={kind} breathRef={breathRef} motionRef={motionRef} background={background} photoUrl={photoUrl} backgroundSettings={backgroundSettings} />
    </div>
  );
}
