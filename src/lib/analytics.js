// Analytics — one set of consent rules for the iPhone app and the website.
//
// What runs when analytics is on:
//   • PostHog anonymous usage counts (app and website) — this file.
//   • Google Analytics: on the website through Google Tag Manager
//     (googleTag.js); in the app through Google Analytics for Firebase
//     (nativeAnalytics.js).
//
// When it is on (until the person makes their own choice in About or on the
// banner, which always wins):
//   • Europe (EU, EEA, UK, Switzerland — consentRegion.js): off until they tap
//     Allow on the banner. Required by GDPR / ePrivacy / UK PECR.
//   • Everywhere else, in the app: on once they tap "Begin" on the first
//     onboarding screen, which says that continuing means agreeing to the Terms
//     and Privacy Policy, analytics included. Apple's guideline 5.1.1(ii) asks
//     apps to get consent even for anonymous usage data; people who installed
//     before this notice existed stay off unless they switch it on.
//   • Everywhere else, on the website: on by default (US law asks for notice in
//     the privacy policy and an opt-out), unless the browser sends Global
//     Privacy Control or Do Not Track.
//   • "Share anonymous usage" in About turns everything off or on, any time.
//
// Session replays (PostHog) need an active "yes", so they run only when the
// person agreed themselves: tapped "Begin" in the app (whose notice mentions
// recordings), tapped Allow on the Europe banner, or switched "Share anonymous
// usage" on. Website visitors who are only covered by the default above never
// get recorded (US session-replay lawsuits under wiretap laws make that the
// safe line). Typed text is always masked.
//
// While analytics is on, PostHog keeps one random ID in localStorage (no
// cookie) so a returning visitor counts as the same visitor; it is deleted when
// analytics is switched off. Every event carries platform: ios_app | website.
//
// Every call here is fire-and-forget and swallows its own failures, so a
// blocked network or a missing chunk can never interrupt a breathing session.
// Photographs, photograph URLs, exact colours, health data and the user's
// identity never leave the device, and no person profiles are ever created.

import { isWebsite, startGoogleTag, stopGoogleTag } from "./googleTag";
import { hasBrowserOptOut, requiresConsentFirst } from "./consentRegion";
import { logNativeEvent, setNativeAnalyticsEnabled } from "./nativeAnalytics";

const CONSENT_KEY = "pauseAnalyticsConsent";
// When they tapped "Begin" on the onboarding screen that carries the Terms and
// Privacy Policy notice.
const AGREEMENT_KEY = "pauseAgreementAcceptedAt";

// The project key and host are public values that ship in the client anyway, so
// they fall back to the app's own project when no VITE_ variables are set.
const PROJECT_TOKEN = import.meta.env.VITE_POSTHOG_KEY || "phc_CLU24jdcNPqwPtJeZCJB2NTirCsDzVsZjDnfsBQRt8uv";
const API_HOST = import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com";

// Page addresses are kept (so PostHog shows which screens people open) but
// cut back to the path: a query string or #fragment can carry tokens or other
// details, so they are removed. Full referrer addresses are dropped; only the
// referring site's domain (how someone arrived) is kept.
const URL_PROPERTIES = ["$current_url", "$initial_current_url", "$session_entry_url", "$prev_pageview_url"];
const STRIPPED_PROPERTIES = ["$referrer", "$initial_referrer"];

function withoutQuery(value) {
  if (typeof value !== "string") return value;
  const cut = value.search(/[?#]/);
  return cut === -1 ? value : value.slice(0, cut);
}

let client = null;
let loading = null;

/** "granted", "denied", or null when the person hasn't chosen yet. */
export function getAnalyticsChoice() {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function hasAcceptedAgreement() {
  try {
    return Boolean(localStorage.getItem(AGREEMENT_KEY));
  } catch {
    return false;
  }
}

/** Records the "Begin" tap on the first onboarding screen, then applies it. */
export function recordAgreement() {
  try {
    if (!localStorage.getItem(AGREEMENT_KEY)) {
      localStorage.setItem(AGREEMENT_KEY, new Date().toISOString());
    }
  } catch {
    // Storage unavailable — analytics simply stays off.
  }
  resumeAnalyticsIfAllowed();
}

// What applies before someone has made a choice of their own.
function enabledByDefault() {
  if (requiresConsentFirst() || hasBrowserOptOut()) return false;
  return isWebsite() || hasAcceptedAgreement();
}

export function isAnalyticsEnabled() {
  const choice = getAnalyticsChoice();
  if (choice) return choice === "granted";
  return enabledByDefault();
}

// Replays need an active agreement, not just the website default.
function replaysAllowed() {
  const choice = getAnalyticsChoice();
  if (choice) return choice === "granted";
  return !isWebsite() && hasAcceptedAgreement() && enabledByDefault();
}

function clearStoredIdentifiers() {
  try {
    // ph_… holds the random ID and replay state. (PostHog's own opt-out flag
    // stays, so a stopped client is inert; start() opts back in on a "yes".)
    Object.keys(localStorage)
      .filter((key) => key.startsWith("ph_"))
      .forEach((key) => localStorage.removeItem(key));
    Object.keys(sessionStorage)
      .filter((key) => key.startsWith("ph_"))
      .forEach((key) => sessionStorage.removeItem(key));
  } catch {
    // Storage unavailable — there was nothing to clear.
  }
}

function start() {
  if (loading) return loading;

  const record = replaysAllowed();
  loading = Promise.all([
    import("posthog-js"),
    // The recorder ships inside the app instead of being downloaded from
    // PostHog's CDN, and is only loaded for people who agreed to recordings.
    record ? import("posthog-js/dist/posthog-recorder") : null,
  ])
    .then(([{ default: posthog }]) => {
      const config = {
        api_host: API_HOST,
        ui_host: "https://us.posthog.com",
        // No automatic capture besides page views. Every other event is written by hand.
        autocapture: false,
        // A $pageview on load and on every in-app navigation, in the app and
        // on the website, so PostHog's paths and top pages work.
        capture_pageview: "history_change",
        capture_pageleave: false,
        capture_performance: false,
        capture_exceptions: false,
        disable_session_recording: !record,
        enable_recording_console_log: false,
        session_recording: {
          maskAllInputs: true,
          // Sensory scenes are WebGL canvases; without this they replay blank.
          captureCanvas: { recordCanvas: true, canvasFps: 4, canvasQuality: "0.4" },
          // Blanked out in replays (shown as an empty box):
          //  • images held inside the page as data: URLs, which is how people's
          //    own background photos are stored, so their photos never leave
          //    the device, as the privacy policy promises;
          //  • every canvas outside a sensory scene or library tile (marked by
          //    WebglScope), in case a visual ever draws a personal photo.
          blockSelector: 'img[src^="data:"], [style*="data:image"], canvas:not([data-replay-canvas] canvas)',
        },
        enable_heatmaps: false,
        disable_surveys: true,
        disable_surveys_automatic_display: true,
        disable_external_dependency_loading: true,
        // Replays start only once PostHog's project settings confirm they are on,
        // so that one config request is allowed for people being recorded.
        // Feature flags are never used or requested.
        advanced_disable_flags: !record,
        advanced_disable_feature_flags: true,
        advanced_disable_feature_flags_on_first_load: true,
        // Anonymous events only: no person data is processed at all, and
        // identify() is never called anywhere in the app.
        person_profiles: "never",
        // One random ID in localStorage, never a cookie, so returning visitors
        // are counted once. stop() deletes it. (Don't add disable_cookie: in
        // posthog-js it is an old name for disable_persistence.)
        persistence: "localStorage",
        // One request per event instead of a batch that iOS could suspend
        // before it is sent.
        request_batching: false,
        sanitize_properties: (properties) => {
          STRIPPED_PROPERTIES.forEach((key) => {
            delete properties[key];
          });
          URL_PROPERTIES.forEach((key) => {
            if (key in properties) properties[key] = withoutQuery(properties[key]);
          });
          return properties;
        },
      };
      // PostHog only takes init() once per page load, so after "off then on"
      // the same instance is re-configured instead.
      if (posthog.__loaded) posthog.set_config(config);
      else posthog.init(PROJECT_TOKEN, config);
      // Our own consent rules decide; start() only runs when analytics is on.
      if (posthog.has_opted_out_capturing()) posthog.opt_in_capturing({ captureEventName: false });
      posthog.register({ platform: isWebsite() ? "website" : "ios_app" });
      if (record) posthog.startSessionRecording();
      client = posthog;
      return posthog;
    })
    .catch(() => {
      loading = null;
      return null;
    });

  return loading;
}

function stop() {
  try {
    if (client) {
      client.stopSessionRecording();
      client.opt_out_capturing();
      // Turning persistence off makes PostHog delete its stored ID; reset()
      // then gives the next "yes" a fresh, unrelated ID.
      client.set_config({ disable_persistence: true, disable_session_recording: true });
      client.reset(true);
    }
  } catch {
    // A failing shutdown must not surface anywhere.
  }
  client = null;
  loading = null;
  clearStoredIdentifiers();
  // PostHog may write once more as it winds down; sweep again after it has.
  setTimeout(clearStoredIdentifiers, 0);
}

// Persists the choice, then starts or fully tears down the client. Returns the
// state that was stored, or the previous one when storage is unavailable.
export function setAnalyticsEnabled(enabled) {
  try {
    localStorage.setItem(CONSENT_KEY, enabled ? "granted" : "denied");
  } catch {
    return isAnalyticsEnabled();
  }

  // On the website the same choice also covers Google Analytics (via Google Tag
  // Manager); inside the iPhone app googleTag.js does nothing.
  if (enabled) {
    start();
    startGoogleTag();
  } else {
    stop();
    stopGoogleTag();
  }
  setNativeAnalyticsEnabled(enabled);

  return enabled;
}

// Called at launch (and after the onboarding agreement): applies the current
// state. Firebase is told every time, so it always matches the choice here.
export function resumeAnalyticsIfAllowed() {
  const enabled = isAnalyticsEnabled();
  if (enabled) {
    // Started at launch (not at the first event) so a replay covers the visit.
    start();
    startGoogleTag();
  }
  setNativeAnalyticsEnabled(enabled);
}

// Sends one event with a small, non-identifying property bag. Never throws and
// never blocks the caller.
export function track(event, properties = {}) {
  if (!isAnalyticsEnabled()) return;

  // Inside the iPhone app the same event also goes to Google Analytics for
  // Firebase (a no-op on the website or without the native plugin).
  logNativeEvent(event, properties);

  const send = () => {
    try {
      if (client) client.capture(event, properties);
    } catch {
      // Analytics is never allowed to break the app.
    }
  };

  if (client) {
    send();
    return;
  }

  start()
    .then(send)
    .catch(() => {});
}