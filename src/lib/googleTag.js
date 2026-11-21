import { Capacitor } from "@capacitor/core";

// Google Tag Manager — on the website (alwayspause.com) only.
//
// • Never runs inside the iPhone app: the App Store listing says the app is
//   tracker-free, and its privacy label doesn't declare Google Analytics.
// • Never loads before consent: nothing is requested from Google until the
//   visitor taps Allow on the website banner, or switches on "Share anonymous
//   usage" in About (the same choice, stored by analytics.js).
// • The GTM container carries the GA4 tag (G-7161SFJEGG), so GA4 is not added
//   here a second time — that would double-count visits. Page views on route
//   changes come from GA4's enhanced measurement (browser history events).

export const GTM_ID = import.meta.env.VITE_GTM_ID || "GTM-PCFL5S6B";
export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || "G-7161SFJEGG";

let loaded = false;

/** True in a browser, false inside the native iOS/Android app. */
export function isWebsite() {
  if (typeof window === "undefined") return false;
  try {
    return !Capacitor.isNativePlatform();
  } catch {
    return true;
  }
}

// Google's snippet: gtag() pushes the arguments object onto the dataLayer.
function gtag() {
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
}

/** Loads the container (once) after the visitor has agreed. */
export function startGoogleTag() {
  if (!isWebsite()) return;
  window[`ga-disable-${GA_MEASUREMENT_ID}`] = false;

  if (loaded) {
    gtag("consent", "update", { analytics_storage: "granted" });
    return;
  }
  loaded = true;

  // The visitor agreed to analytics only. Advertising storage stays denied, so
  // any ads tags added to the container later stay off until asked separately.
  gtag("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  gtag("js", new Date());

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(GTM_ID)}`;
  document.head.appendChild(script);
}

function deleteGoogleAnalyticsCookies() {
  const names = document.cookie
    .split(";")
    .map((part) => part.trim().split("=")[0])
    .filter((name) => name === "_ga" || name.startsWith("_ga_"));
  const host = window.location.hostname;
  const domains = ["", host, `.${host.replace(/^www\./, "")}`];
  names.forEach((name) => {
    domains.forEach((domain) => {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ""}`;
    });
  });
}

/** Stops Google Analytics sending anything further and removes its cookies. */
export function stopGoogleTag() {
  if (!isWebsite()) return;
  window[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
  if (loaded) gtag("consent", "update", { analytics_storage: "denied" });
  try {
    deleteGoogleAnalyticsCookies();
  } catch {
    // Cookies unavailable — nothing to remove.
  }
}
