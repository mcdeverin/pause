import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';

export const ENTITLEMENT_ID = "always_pause_plus";

export const initRevenueCat = async () => {
  await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
  await Purchases.configure({
    apiKey: "appl_vfxpRLXujuSdAhnusNWvmAxrnYH"
  });
};

export const checkEntitlement = async () => {
  const { customerInfo } = await Purchases.getCustomerInfo();
  return !!customerInfo.entitlements.active[ENTITLEMENT_ID];
};

export const getOfferings = async () => {
  const { offerings } = await Purchases.getOfferings();
  return offerings;
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