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

export function getLocalizedPrice(offerings, key) {
  const packages = offerings?.all?.default?.availablePackages || [];
  const pkg = packages.find((p) => p?.product?.identifier === PRODUCT_IDS[key]);
  return pkg?.product?.priceString || DISPLAY_FALLBACK[key];
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