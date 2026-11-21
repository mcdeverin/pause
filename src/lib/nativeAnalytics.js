import { Capacitor, registerPlugin } from "@capacitor/core";

// Google Analytics for Firebase, inside the iPhone app.
//
// The Firebase SDK lives in the Xcode project (see native/ios/README.md). It is
// installed with FIREBASE_ANALYTICS_COLLECTION_ENABLED = NO in Info.plist, so it
// collects nothing until this file turns it on through the app's own
// AnalyticsBridge plugin — driven by the same consent rules as everything else
// (analytics.js). If the plugin isn't in the build, every call is a no-op.

const AnalyticsBridge = registerPlugin("AnalyticsBridge");

function available() {
  try {
    return Capacitor.isNativePlatform() && Capacitor.isPluginAvailable("AnalyticsBridge");
  } catch {
    return false;
  }
}

/** Turns Firebase collection on or off (persists across launches natively). */
export function setNativeAnalyticsEnabled(enabled) {
  if (!available()) return;
  try {
    Promise.resolve(AnalyticsBridge.setEnabled({ enabled: Boolean(enabled) })).catch(() => {});
  } catch {
    // Never let analytics affect the app.
  }
}

// Firebase limits: event names ≤ 40 characters, parameter values strings ≤ 100
// characters or numbers, at most 25 parameters.
function toFirebaseParams(properties) {
  const params = {};
  Object.entries(properties || {})
    .slice(0, 25)
    .forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      const name = String(key).slice(0, 40);
      if (typeof value === "boolean") params[name] = value ? 1 : 0;
      else if (typeof value === "number" && Number.isFinite(value)) params[name] = value;
      else params[name] = String(value).slice(0, 100);
    });
  return params;
}

/** Logs one of the app's own events to Firebase (callers check consent first). */
export function logNativeEvent(name, properties = {}) {
  if (!available()) return;
  try {
    Promise.resolve(
      AnalyticsBridge.logEvent({ name: String(name).slice(0, 40), params: toFirebaseParams(properties) })
    ).catch(() => {});
  } catch {
    // Never let analytics affect the app.
  }
}
