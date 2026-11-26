import { Capacitor } from '@capacitor/core';
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';

// The entitlement's identifier in RevenueCat is "Always Pause+" (identifiers
// can't be renamed there). The app used to look for "always_pause_plus", so a
// successful purchase never unlocked Plus. Both are accepted.
export const ENTITLEMENT_ID = "Always Pause+";
const ENTITLEMENT_IDS = [ENTITLEMENT_ID, "always_pause_plus"];

// RevenueCat public SDK keys, one per store (safe to ship in the app).
// The Google Play key comes from RevenueCat → Project settings → Apps →
// the Play Store app (it starts with "goog_"). Until it is filled in, Android
// simply stays on the free tier, like the website.
const API_KEYS = {
  ios: "appl_vfxpRLXujuSdAhnusNWvmAxrnYH",
  android: "",
};

export const initRevenueCat = async () => {
  const apiKey = API_KEYS[Capacitor.getPlatform()];
  if (!apiKey) throw new Error("RevenueCat isn't set up for this platform");
  // Verbose SDK logs only while developing; release builds log warnings and up.
  await Purchases.setLogLevel({ level: import.meta.env.DEV ? LOG_LEVEL.DEBUG : LOG_LEVEL.WARN });
  await Purchases.configure({ apiKey });
};

export const hasProEntitlement = (customerInfo) =>
  ENTITLEMENT_IDS.some((id) => !!customerInfo?.entitlements?.active?.[id]);

export const checkEntitlement = async () => {
  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    return hasProEntitlement(customerInfo);
  } catch {
    return false;
  }
};

// Keeps Always Pause+ in step with purchases, renewals, expiries and refunds
// that happen while the app is open (or arrive from the App Store later).
// Returns a function that removes the listener.
export const addEntitlementListener = async (onChange) => {
  const callbackId = await Purchases.addCustomerInfoUpdateListener((customerInfo) => {
    onChange(hasProEntitlement(customerInfo));
  });
  return () => Purchases.removeCustomerInfoUpdateListener({ listenerToRemove: callbackId }).catch(() => {});
};

// purchases-capacitor returns the offerings object itself (not wrapped in
// { offerings }). Destructuring it made every offering undefined, so the
// paywall fell back to built-in prices, never saw the store's trial, and every
// purchase failed with "this plan is not available right now".
export const getOfferings = async () => {
  return await Purchases.getOfferings();
};

export const purchasePackage = async (rcPackage) => {
  const { customerInfo } = await Purchases.purchasePackage({ 
    aPackage: rcPackage 
  });
  return customerInfo;
};

export const restorePurchases = async () => {
  const { customerInfo } = await Purchases.restorePurchases();
  return customerInfo;
};

// INTRO_ELIGIBILITY_STATUS values reported by the store: 0 unknown, 1 ineligible,
// 2 eligible, 3 no introductory offer exists.
export const TRIAL_ELIGIBLE_STATUS = 2;

// iOS only: the store decides who can still get the introductory offer. Anything
// other than a clear "eligible" answer is treated as no trial, so the paywall
// never promises an offer Apple will not apply.
export const getTrialEligibility = async (productIds) => {
  const ids = (productIds || []).filter(Boolean);
  if (!ids.length) return {};
  return await Purchases.checkTrialOrIntroductoryPriceEligibility({
    productIdentifiers: ids
  });
};