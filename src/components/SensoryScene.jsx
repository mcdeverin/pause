import { Component, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { track } from "@/lib/analytics";
import { PAUSE } from "@/lib/design";
import SensoryBackButton from "@/components/visuals/SensoryBackButton";
import WebglScope from "@/components/WebglScope";

// Every sensory scene route is wrapped in this. Nothing here ever shows the
// person an error. It does three quiet jobs:
//
// 1. Recovers by itself. If a scene crashes or the device drops its graphics,
//    it is rebuilt automatically (up to 2 retries). On the website, a scene whose
//    code can't be downloaded (usually because a new version was just published)
//    reloads the page once. If none of that works, or the device has no WebGL,
//    a soft moving colour backdrop is shown with the back button, never a message.
//    The same backdrop shows while a scene's code is loading.
//
// 2. Gives graphics memory back (WebglScope), which prevents most failures on
//    iPhone in the first place.
//
// 3. Reports what happened, for us only. Session replays can't record WebGL
//    canvases, so scenes always look blank there; these events are the real
//    signal. They go through track(), so they only send when the person allowed
//    analytics, like every other event.
//
//    sensory_scene_loaded  { scene, renderer, load_ms, attempt }
//      renderer: canvas | video | iframe | image (what showed up first;
//                Pixel Swap Sky is built from photos, not a canvas)
//      load_ms:  from opening the scene, including downloading its code
//      attempt:  0 on the first try; 1 or 2 means an automatic retry fixed it
//    sensory_scene_failed  { scene, reason, webgl, attempt, message?, waited_ms? }
//      reason:   crash            the scene threw an error (retried)
//                download_failed  its code couldn't be downloaded (reloads once on the web)
//                context_lost     the device dropped the scene's graphics (retried)
//                no_webgl         a canvas appeared but this device has no WebGL
//                nothing_drawn    nothing showed up after 15 seconds
//                video_error      the video couldn't play
//                image_error      a photo failed before anything else showed
//                script_error     the scene's code hit an uncaught error; message says which
//                left_before_load the person gave up waiting (2 s or more)
//      webgl:    webgl2 | webgl1 | none, what this device supports
//      A crash or context_lost at attempt 2, or no_webgl, means the backdrop was shown.

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 400;
const NOTHING_DRAWN_MS = 15000;
const ABANDON_AFTER_MS = 2000;

function report(event, properties) {
  // Visible only in development, for testing.
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

// A soft, slowly drifting wash of the app's own tints, with the back button.
// Used while a scene loads, between retries, and if a scene can't run at all.
function CalmBackdrop() {
  const { calm, focus, wind_down: windDown } = PAUSE.moments;
  return (
    <main
      className="pause-calm-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        background: `linear-gradient(135deg, ${calm.tint}, ${focus.tint}, ${windDown.tint}, ${calm.tint})`,
        backgroundSize: "300% 300%",
        animation: "pause-calm-drift 16s ease-in-out infinite alternate",
      }}
    >
      <style>{"@keyframes pause-calm-drift{from{background-position:0% 30%}to{background-position:100% 70%}}@media (prefers-reduced-motion: reduce){.pause-calm-backdrop{animation:none!important}}"}</style>
      <SensoryBackButton />
    </main>
  );
}

// Reload the website once when a scene's code can't be downloaded: that almost
// always means a new version was published and old file names are gone. The app
// ships its code inside itself, so there is nothing newer to fetch there.
function reloadOnceForNewVersion() {
  try {
    if (Capacitor.isNativePlatform()) return false;
    const key = "pauseSceneReloadAt";
    if (Date.now() - Number(sessionStorage.getItem(key) || 0) < 60000) return false;
    sessionStorage.setItem(key, String(Date.now()));
    window.location.reload();
    return true;
  } catch {
    return false;
  }
}

class SceneErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    const message = String(error?.message || error || "").slice(0, 100);
    const reason = isDownloadError(message) ? "download_failed" : "crash";
    report("sensory_scene_failed", { scene: this.props.scene, reason, message, webgl: webglSupport(), attempt: this.props.attempt });
    this.props.onTrouble(reason);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    // Tell the watcher this was a crash, so its cleanup doesn't also report "left_before_load".
    this.props.status.crashed = true;
    return <CalmBackdrop />;
  }
}

// Watches the scene's part of the page for the first thing that draws.
function SceneWatcher({ scene, attempt, status, onTrouble, children }) {
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
      report("sensory_scene_loaded", { scene, renderer, load_ms: elapsed(), attempt });
    };
    const markFailed = (reason, extra = {}) => {
      if (failed) return;
      failed = true;
      report("sensory_scene_failed", { scene, reason, webgl: webglSupport(), attempt, ...extra });
      if (reason === "context_lost" || reason === "no_webgl") onTrouble(reason);
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
        report("sensory_scene_failed", { scene, reason: "left_before_load", waited_ms: elapsed(), webgl: webglSupport(), attempt });
      }
    };
  }, [scene, attempt, status, onTrouble]);

  // display: contents keeps the wrapper out of layout, so scenes size exactly as before.
  return <div ref={rootRef} style={{ display: "contents" }}>{children}</div>;
}

function SceneShell({ id, attempt, onTrouble, children }) {
  const status = useRef({ crashed: false }).current;
  return (
    <SceneErrorBoundary scene={id} attempt={attempt} status={status} onTrouble={onTrouble}>
      <SceneWatcher scene={id} attempt={attempt} status={status} onTrouble={onTrouble}>
        <WebglScope>
          <Suspense fallback={<CalmBackdrop />}>{children}</Suspense>
        </WebglScope>
      </SceneWatcher>
    </SceneErrorBoundary>
  );
}

// Rebuilds the scene from scratch after a crash or lost graphics, quietly.
function SceneRecovery({ id, children }) {
  const [attempt, setAttempt] = useState(0);
  const [gaveUp, setGaveUp] = useState(false);
  const attemptRef = useRef(0);
  const retryTimer = useRef(null);
  useEffect(() => () => clearTimeout(retryTimer.current), []);

  const onTrouble = useCallback((reason) => {
    if (reason === "download_failed" && reloadOnceForNewVersion()) return;
    if (reason === "no_webgl" || attemptRef.current >= MAX_RETRIES) {
      setGaveUp(true);
      return;
    }
    // One retry per burst of trouble (a lost context often also crashes the scene).
    clearTimeout(retryTimer.current);
    retryTimer.current = setTimeout(() => {
      attemptRef.current += 1;
      setAttempt(attemptRef.current);
    }, RETRY_DELAY_MS);
  }, []);

  if (gaveUp) return <CalmBackdrop />;
  return <SceneShell key={attempt} id={id} attempt={attempt} onTrouble={onTrouble}>{children}</SceneShell>;
}

export default function SensoryScene({ id, children }) {
  // Keyed by scene, so moving from one scene straight to another starts fresh.
  return <SceneRecovery key={id} id={id}>{children}</SceneRecovery>;
}
