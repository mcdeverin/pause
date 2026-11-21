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

// Automatic properties that describe the page rather than the person. The app is
// a single screen, and a URL can carry a query string, so none of them are sent.
const STRIPPED_PROPERTIES = [
  "$current_url",
  "$pathname",
  "$host",
  "$referrer",
  "$referring_domain",
  "$initial_current_url",
  "$initial_pathname",
  "$initial_referrer",
  "$initial_referring_domain",
  "$session_entry_url",
  "$prev_pageview_pathname",
  "$prev_pageview_url",
];

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

function clearStoredIdentifiers() {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith("ph_"))
      .forEach((key) => localStorage.removeItem(key));
  } catch {
    // Storage unavailable — there was nothing to clear.
  }
}

function start() {
  if (loading) return loading;

  loading = import("posthog-js")
    .then(({ default: posthog }) => {
      posthog.init(PROJECT_TOKEN, {
        api_host: API_HOST,
        ui_host: "https://us.posthog.com",
        // No automatic capture of any kind. Every event is written by hand.
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: false,
        capture_performance: false,
        capture_exceptions: false,
        disable_session_recording: true,
        enable_heatmaps: false,
        disable_surveys: true,
        disable_surveys_automatic_display: true,
        disable_external_dependency_loading: true,
        advanced_disable_flags: true,
        advanced_disable_decide: true,
        // Anonymous events only: no person data is processed at all, and
        // identify() is never called anywhere in the app.
        person_profiles: "never",
        // Memory-only persistence: no cookie, no localStorage identifier, so
        // nothing survives the app being closed.
        persistence: "memory",
        disable_cookie: true,
        disable_persistence: true,
        // One request per event instead of a batch that iOS could suspend
        // before it is sent.
        request_batching: false,
        sanitize_properties: (properties) => {
          STRIPPED_PROPERTIES.forEach((key) => {
            delete properties[key];
          });
          return properties;
        },
      });
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
      client.opt_out_capturing();
      client.reset(true);
      if (typeof client.shutdown === "function") client.shutdown();
    }
  } catch {
    // A failing shutdown must not surface anywhere.
  }
  client = null;
  loading = null;
  clearStoredIdentifiers();
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
  if (enabled) startGoogleTag();
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