import { Capacitor, registerPlugin } from "@capacitor/core";

// Breathing haptics.
//
// In the apps, haptics go through the app's own CoreHaptics plugin (jsName
// "CoreHaptics": playInhaleHaptic / playExhaleHaptic / playHoldHaptic /
// stopHaptic, each taking { durationMs }):
//   • iPhone: CoreHapticsPlugin.swift in the Xcode project (iOS has no
//     navigator.vibrate, so this is the only way). It has to be registered
//     with the Capacitor bridge there.
//   • Android: android/app/src/main/java/…/CoreHapticsPlugin.java, registered
//     in MainActivity, with the same ramps and pulses.
// If the plugin isn't in a build, isPluginAvailable() is false and nothing is sent.
//
// Everywhere else (browsers, desktop previews) the short navigator.vibrate
// patterns below are used where supported.
//
// Every call swallows its own failures: haptics must never break a session.

const CoreHaptics = registerPlugin("CoreHaptics");

function nativeAvailable() {
  try {
    return Capacitor.isNativePlatform() && Capacitor.isPluginAvailable("CoreHaptics");
  } catch {
    return false;
  }
}

export function phaseKind(label) {
  const l = String(label || "").toLowerCase();
  if (/(inhale|sniff|belly|chest|collar)/.test(l)) return "inhale";
  if (/(exhale|hum)/.test(l)) return "exhale";
  if (/hold/.test(l)) return "hold";
  return null;
}

const VIBRATE_PATTERNS = {
  inhale: [80, 40, 80], // soft double pulse — breathe in
  exhale: [40, 30, 40, 30, 40], // gentle triple fade — breathe out
  hold: 150, // single sustained — stay still
};

const NATIVE_METHODS = {
  inhale: "playInhaleHaptic",
  exhale: "playExhaleHaptic",
  hold: "playHoldHaptic",
};

/** Plays the cue for one breathing phase lasting `seconds`. */
export function playPhaseHaptic(label, seconds) {
  const kind = phaseKind(label);
  if (!kind) return;

  if (nativeAvailable()) {
    const durationMs = Math.max(250, Math.round((Number(seconds) || 4) * 1000));
    try {
      Promise.resolve(CoreHaptics[NATIVE_METHODS[kind]]({ durationMs })).catch(() => {});
    } catch {
      // Native call unavailable — fall through silently.
    }
    return;
  }

  try {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(VIBRATE_PATTERNS[kind]);
    }
  } catch {
    // Vibration blocked — nothing to do.
  }
}

/** Stops any haptic still playing (end of session, exit). */
export function stopHaptics() {
  if (!nativeAvailable()) return;
  try {
    Promise.resolve(CoreHaptics.stopHaptic()).catch(() => {});
  } catch {
    // Nothing playing.
  }
}
