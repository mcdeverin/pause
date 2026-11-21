// Where website analytics needs a "yes" first, and when a browser has asked
// not to be tracked.
//
// Europe (EU, EEA, UK, Switzerland) requires consent before analytics cookies
// are set, so visitors there get the Allow / No thanks banner. Everywhere else,
// website analytics is on by default with an opt-out in About — unless the
// browser sends Global Privacy Control or Do Not Track, which we treat as "no".
//
// Region comes from the browser's time zone: no lookup service, nothing sent
// anywhere. It errs towards asking — an unknown time zone counts as Europe.

// EU/EEA territories whose time zones are not under "Europe/".
const EUROPEAN_ZONES_OUTSIDE_EUROPE = new Set([
  "Atlantic/Reykjavik", // Iceland (EEA)
  "Atlantic/Canary", // Spain
  "Atlantic/Madeira", // Portugal
  "Atlantic/Azores", // Portugal
  "Atlantic/Faroe", // Faroe Islands (Denmark)
  "Arctic/Longyearbyen", // Svalbard (Norway)
  "Africa/Ceuta", // Spain
  "Asia/Nicosia", // Cyprus
  "Asia/Famagusta", // Cyprus
  "America/Guadeloupe", // France
  "America/Martinique", // France
  "America/Cayenne", // France
  "America/St_Barthelemy", // France
  "America/Marigot", // France
  "Indian/Reunion", // France
  "Indian/Mayotte", // France
  // Legacy aliases some systems still report.
  "GB",
  "GB-Eire",
  "Eire",
  "Iceland",
  "Portugal",
  "Poland",
  "WET",
  "CET",
  "MET",
  "EET",
]);

export function browserTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    return "";
  }
}

/** True when this visitor should be asked before any analytics loads. */
export function requiresConsentFirst() {
  const zone = browserTimeZone();
  if (!zone) return true;
  return zone.startsWith("Europe/") || EUROPEAN_ZONES_OUTSIDE_EUROPE.has(zone);
}

/** True when the browser sends Global Privacy Control or Do Not Track. */
export function hasBrowserOptOut() {
  try {
    if (typeof navigator === "undefined") return false;
    if (navigator.globalPrivacyControl === true) return true;
    const dnt = navigator.doNotTrack || window.doNotTrack;
    return dnt === "1" || dnt === "yes";
  } catch {
    return false;
  }
}
