// Optional product analytics.
//
// • iPhone app: off until someone turns on "Share anonymous usage" in About &
//   Legal. Nothing about PostHog runs before that: no script, no network
//   request, no storage.
// • Website: visitors in Europe are asked first (AnalyticsConsentBanner) and
//   nothing loads unless they tap Allow. Elsewhere it's on by default — PostHog
//   plus Google Analytics through Google Tag Manager — unless the browser sends
//   Global Privacy Control or Do Not Track. Everyone can switch it off in About.
//   See consentRegion.js.
// Turning it back off stops the client and deletes any identifiers it
// created. Every call here is fire-and-forget and swallows its own failures, so
// a blocked network or a missing chunk can never interrupt a breathing session.
//
// Only the handful of events at the bottom of the app's own call sites are sent.
// Photographs, photograph URLs, exact colours, health data and the user's
// identity never leave the device, and no person profiles are ever created.

import { isWebsite, startGoogleTag, stopGoogleTag } from "./googleTag";
import { hasBrowserOptOut, requiresConsentFirst } from "./consentRegion";

const CONSENT_KEY = "pauseAnalyticsConsent";

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

// What applies before someone has made a choice of their own.
function enabledByDefault() {
  return isWebsite() && !requiresConsentFirst() && !hasBrowserOptOut();
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

  return enabled;
}

// Called once at launch: picks up an earlier choice, or the website default.
export function resumeAnalyticsIfAllowed() {
  if (isAnalyticsEnabled()) startGoogleTag();
}

// Sends one event with a small, non-identifying property bag. Never throws and
// never blocks the caller.
export function track(event, properties = {}) {
  if (!isAnalyticsEnabled()) return;

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