import { Component, Suspense, useEffect, useRef } from "react";
import { track } from "@/lib/analytics";
import { FONT, PAUSE } from "@/lib/design";
import SensoryBackButton from "@/components/visuals/SensoryBackButton";

// Every sensory scene route is wrapped in this. It does two jobs:
//
// 1. Reports whether the scene really appeared for the person. Session replays
//    can't record WebGL canvases, so scenes always look blank there; these events
//    are the real signal. They go through track(), so they only send when the
//    person allowed analytics, like every other event.
//
//    sensory_scene_loaded  { scene, renderer, load_ms }
//      renderer: canvas | video | iframe | image (what showed up first;
//                Pixel Swap Sky is built from photos, not a canvas)
//      load_ms:  from opening the scene, including downloading its code
//    sensory_scene_failed  { scene, reason, webgl, message?, waited_ms? }
//      reason:   crash            the scene threw an error
//                download_failed  its code couldn't be downloaded
//                nothing_drawn    nothing showed up after 15 seconds
//                context_lost     the device dropped the scene's graphics
//                video_error      the video couldn't play
//                image_error      a photo failed before anything else showed
//                no_webgl         a canvas appeared but this device has no WebGL
//                script_error     the scene's code hit an uncaught error (its animation
//                                 usually stops); message says which
//                left_before_load the person gave up waiting (2 s or more)
//      webgl:    webgl2 | webgl1 | none, what this device supports
//
// 2. Keeps a crashed scene from blanking the whole app. Without this, an error
//    in one scene (a graphics context that can't be created, say) unmounts
//    everything. Now the person sees a short note, "Try again" and the back button.

const NOTHING_DRAWN_MS = 15000;
const ABANDON_AFTER_MS = 2000;

function report(event, properties) {
  if (import.meta.env.DEV) console.info(`[sensory] ${event}`, properties);
  track(event, properties);
}

// Checked once per launch (it briefly creates a throwaway graphics context).
let webglSupportCache = null;
function webglSupport() {
  if (!webglSupportCache) webglSupportCache = detectWebgl();
  return webglSupportCache;
}

function detectWebgl() {
  try {
    const canvas = document.createElement("canvas");
    const gl2 = canvas.getContext("webgl2");
    const gl = gl2 || canvas.getContext("webgl");
    if (!gl) return "none";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return gl2 ? "webgl2" : "webgl1";
  } catch {
    return "none";
  }
}

const isDownloadError = (message) =>
  /dynamically imported module|importing a module script failed|failed to fetch|chunkloaderror|loading chunk/i.test(message);

class SceneErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    const message = String(error?.message || error || "").slice(0, 100);
    report("sensory_scene_failed", {
      scene: this.props.scene,
      reason: isDownloadError(message) ? "download_failed" : "crash",
      message,
      webgl: webglSupport(),
    });
  }

  render() {
    if (!this.state.failed) return this.props.children;
    // Tell the watcher this was a crash, so its cleanup doesn't also report "left_before_load".
    this.props.status.crashed = true;
    return (
      <main style={{ position: "fixed", inset: 0, display: "grid", placeItems: "center", background: PAUSE.ivory, color: PAUSE.ink, fontFamily: FONT, padding: 24, textAlign: "center" }}>
        <div role="status">
          <p style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>This scene didn’t load.</p>
          <p style={{ margin: "8px 0 18px", fontSize: 14, color: PAUSE.ink2 }}>It may be busy on this device. You can try again or pick another.</p>
          {/* Reload rather than re-render: a failed code download stays failed until the page reloads. */}
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ height: 42, padding: "0 22px", borderRadius: 999, border: 0, background: PAUSE.accent, color: "#fff", fontFamily: FONT, fontSize: 15, fontWeight: 600, cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
        <SensoryBackButton />
      </main>
    );
  }
}

// Watches the scene's part of the page for the first thing that draws.
function SceneWatcher({ scene, status, children }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const startedAt = performance.now();
    const elapsed = () => Math.round(performance.now() - startedAt);
    let loaded = false;
    let failed = false;

    const markLoaded = (renderer) => {
      if (loaded || failed) return;
      loaded = true;
      report("sensory_scene_loaded", { scene, renderer, load_ms: elapsed() });
    };
    const markFailed = (reason, extra = {}) => {
      if (failed) return;
      failed = true;
      report("sensory_scene_failed", { scene, reason, webgl: webglSupport(), ...extra });
    };

    const checkForContent = () => {
      const canvas = root.querySelector("canvas");
      if (canvas && canvas.width > 0 && canvas.height > 0) {
        // A canvas with no WebGL behind it stays blank, so that's a failure, not a load.
        return webglSupport() === "none" ? markFailed("no_webgl") : markLoaded("canvas");
      }
      const image = [...root.querySelectorAll("img")].find((img) => img.complete && img.naturalWidth > 0);
      if (image) markLoaded("image");
    };
    const observer = new MutationObserver(checkForContent);
    observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["width", "height"] });
    checkForContent();

    // Media and frame events don't bubble, so listen in the capture phase.
    const onPlaying = (event) => { if (event.target?.tagName === "VIDEO") markLoaded("video"); };
    const onLoad = (event) => {
      const tag = event.target?.tagName;
      if (tag === "IFRAME") markLoaded("iframe");
      else if (tag === "IMG") markLoaded("image");
    };
    const onMediaError = (event) => {
      const tag = event.target?.tagName;
      if (tag === "VIDEO" || tag === "SOURCE") markFailed("video_error");
      else if (tag === "IMG" && !loaded) markFailed("image_error");
    };
    const onContextLost = () => markFailed("context_lost", { load_ms: elapsed() });
    // Wait a moment: if this error also crashed the scene, the error boundary
    // reports it as "crash" and this one stays quiet, so it isn't counted twice.
    const onScriptError = (event) => {
      const message = String(event.message || event.error?.message || "").slice(0, 100);
      setTimeout(() => { if (!status.crashed) markFailed("script_error", { message }); }, 300);
    };
    window.addEventListener("error", onScriptError);
    root.addEventListener("playing", onPlaying, true);
    root.addEventListener("loadeddata", onPlaying, true);
    root.addEventListener("load", onLoad, true);
    root.addEventListener("error", onMediaError, true);
    root.addEventListener("webglcontextlost", onContextLost, true);

    const timer = setTimeout(() => {
      if (!loaded) markFailed("nothing_drawn");
    }, NOTHING_DRAWN_MS);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      root.removeEventListener("playing", onPlaying, true);
      root.removeEventListener("loadeddata", onPlaying, true);
      root.removeEventListener("load", onLoad, true);
      root.removeEventListener("error", onMediaError, true);
      root.removeEventListener("webglcontextlost", onContextLost, true);
      window.removeEventListener("error", onScriptError);
      if (!loaded && !failed && !status.crashed && elapsed() >= ABANDON_AFTER_MS) {
        report("sensory_scene_failed", { scene, reason: "left_before_load", waited_ms: elapsed(), webgl: webglSupport() });
      }
    };
  }, [scene, status]);

  // display: contents keeps the wrapper out of layout, so scenes size exactly as before.
  return <div ref={rootRef} style={{ display: "contents" }}>{children}</div>;
}

function SceneShell({ id, name, children }) {
  const status = useRef({ crashed: false }).current;
  return (
    <SceneErrorBoundary scene={id} status={status}>
      <SceneWatcher scene={id} status={status}>
        <Suspense fallback={<div className="p-8">Loading {name}…</div>}>{children}</Suspense>
      </SceneWatcher>
    </SceneErrorBoundary>
  );
}

export default function SensoryScene({ id, name, children }) {
  // Keyed by scene, so moving from one scene straight to another starts a fresh
  // watcher and error boundary instead of reusing the previous scene's.
  return <SceneShell key={id} id={id} name={name}>{children}</SceneShell>;
}
