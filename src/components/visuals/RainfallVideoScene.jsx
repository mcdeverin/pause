import { useEffect, useRef, useState } from "react";
import RainPoolScene from "./RainPoolScene";

// Footage lives at public/videos/rainfall.mp4 once added to the repository.
export default function RainfallVideoScene({ speed = .55 }) {
  const ref = useRef(null);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.playbackRate = .65 + speed * .65;
  }, [speed]);
  return <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", background: "#1d302b" }}>
    {unavailable && <RainPoolScene speed={speed}/>}
    <video ref={ref} src="/videos/rainfall.mp4" autoPlay muted loop playsInline preload="metadata"
      onError={() => setUnavailable(true)}
      onCanPlay={() => setUnavailable(false)}
      aria-label="Natural rain falling onto a forest pool"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: unavailable ? "none" : "block" }}/>
  </div>;
}
