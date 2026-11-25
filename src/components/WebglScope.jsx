import { useEffect, useRef } from "react";

// Wrap anything that draws with WebGL in this. When it unmounts, every canvas it
// created gives its graphics context back to the device.
//
// Why: iPhones allow only around 16 live WebGL contexts at once. Many of the
// visuals never release theirs, so each trip into a scene, or each library tile
// scrolling out of view, leaked one. Once the limit is hit, iOS silently kills
// the oldest contexts, and scenes and tiles go blank. Releasing them here covers
// every visual at once, including ones added later.

function releaseCanvas(canvas) {
  try {
    // getContext returns the context the canvas already has. A 2D canvas returns
    // null for both, so it is left alone.
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (gl && !gl.isContextLost()) gl.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    // Releasing is best effort.
  }
}

export default function WebglScope({ children }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const canvases = new Set();
    const collect = () => root.querySelectorAll("canvas").forEach((canvas) => canvases.add(canvas));
    const observer = new MutationObserver(collect);
    observer.observe(root, { childList: true, subtree: true });
    collect();

    return () => {
      collect();
      observer.disconnect();
      // Wait until the visual's own cleanup has run (it may still touch its
      // context while stopping), then release whatever is still held.
      setTimeout(() => canvases.forEach(releaseCanvas), 0);
    };
  }, []);

  // display: contents keeps this wrapper out of layout.
  return <div ref={rootRef} style={{ display: "contents" }}>{children}</div>;
}
