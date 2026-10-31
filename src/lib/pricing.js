// Display-only pricing helpers. Subscription products, identifiers and purchase
// logic stay untouched in src/lib/revenuecat.js.

export const PRODUCT_IDS = {
  annual: "com.workondeck.alwayspause.annual",
  monthly: "com.workondeck.alwayspause.monthly",
  lifetime: "alwayspause_lifetime",
};

// Shown only until RevenueCat offerings resolve (e.g. web preview). Never used
// for purchasing — the store's own localized price is always what is charged.
const DISPLAY_FALLBACK = {
  annual: "$29.99",
  monthly: "$4.99",
  lifetime: "$49.99",
};

// Packages are looked up by their store product ID inside the default offering,
// so the package identifiers chosen in RevenueCat can be anything.
export function getPackage(offerings, key) {
  const packages = offerings?.all?.default?.availablePackages || [];
  return packages.find((p) => p?.product?.identifier === PRODUCT_IDS[key]) || null;
}

export function getLocalizedPrice(offerings, key) {
  const pkg = getPackage(offerings, key);
  return pkg?.product?.priceString || DISPLAY_FALLBACK[key];
}

/** Renewal price with its period, e.g. "$29.99/year". */
export function getPlanPriceLabel(offerings, key) {
  const price = getLocalizedPrice(offerings, key);
  if (key === "annual") return `${price}/year`;
  if (key === "monthly") return `${price}/month`;
  return price;
}

const UNIT_DAYS = { DAY: 1, WEEK: 7, MONTH: 30, YEAR: 365 };

/**
 * Length in days of the free introductory offer configured in App Store Connect,
 * or null when the product has no free trial. This reads the store's own offer —
 * nothing here creates or times a trial.
 */
export function getIntroTrialDays(offerings, key) {
  const intro = getPackage(offerings, key)?.product?.introPrice;
  if (!intro || !intro.periodNumberOfUnits) return null;
  // Only a zero-price introductory period counts as a free trial.
  if (Number(intro.price) !== 0) return null;
  const unitDays = UNIT_DAYS[String(intro.periodUnit || "").toUpperCase()];
  if (!unitDays) return null;
  return intro.periodNumberOfUnits * unitDays;
}

function splitPriceString(priceString) {
  const match = String(priceString).match(/\d[\d.,\s\u00a0]*\d|\d/);
  if (!match) return null;

  const raw = match[0];
  const prefix = String(priceString).slice(0, match.index);
  const suffix = String(priceString).slice(match.index + raw.length);
  const cleaned = raw.replace(/[\s\u00a0]/g, "");

  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  let decimalIndex = -1;
  if (lastComma > lastDot && cleaned.length - lastComma - 1 <= 2) decimalIndex = lastComma;
  else if (lastDot > lastComma && cleaned.length - lastDot - 1 <= 2) decimalIndex = lastDot;

  const decimalSep = decimalIndex >= 0 ? cleaned[decimalIndex] : ".";
  const intPart = (decimalIndex >= 0 ? cleaned.slice(0, decimalIndex) : cleaned).replace(/[.,]/g, "");
  const fracPart = decimalIndex >= 0 ? cleaned.slice(decimalIndex + 1) : "";

  const value = Number(`${intPart || "0"}.${fracPart || "0"}`);
  if (Number.isNaN(value)) return null;

  return { prefix, suffix, value, decimalSep };
}

/** Daily equivalent, formatted in the currency of the localized price. */
export function formatDailyPrice(priceString, plan) {
  const parsed = splitPriceString(priceString);
  if (!parsed) return null;

  const { value, decimalSep, prefix, suffix } = parsed;
  const daily = plan === "monthly" ? (value * 12) / 365 : value / 365;
  const amount = daily.toFixed(2).replace(".", decimalSep);
  return `${prefix}${amount}${suffix}`;
}