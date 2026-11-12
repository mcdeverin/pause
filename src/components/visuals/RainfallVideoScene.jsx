import { useEffect, useRef, useState } from "react";
import RainPoolScene from "./RainPoolScene";

// Prefer the higher-resolution source on large screens; keep the smaller original for mobile.
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
    <video ref={ref} autoPlay muted loop playsInline preload="metadata"
      onError={(event) => { if (event.currentTarget.currentSrc.includes("rainfall-hq.mp4")) { event.currentTarget.src = "/videos/rainfall.mp4"; event.currentTarget.load(); void event.currentTarget.play().catch(() => {}); } else setUnavailable(true); }}
      onCanPlay={() => setUnavailable(false)}
      aria-label="Natural rain falling onto a forest pool"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: unavailable ? "none" : "block" }}>
      <source src="/videos/rainfall-hq.mp4" media="(min-width: 768px)" type="video/mp4" />
      <source src="/videos/rainfall.mp4" type="video/mp4" />
    </video>
  </div>;
}
