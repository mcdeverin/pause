import { Purchases } from "@revenuecat/purchases-js";

const API_KEY = "appl_vfxpRLXujuSdAhnusNWvmAxrnYH";
export const ENTITLEMENT_ID = "always_pause_plus";

export const initRevenueCat = () => {
  Purchases.configure(API_KEY);
};

export const getCustomerInfo = async () => {
  return await Purchases.getSharedInstance().getCustomerInfo();
};

export const purchasePackage = async (pkg) => {
  return await Purchases.getSharedInstance().purchasePackage(pkg);
};

export const restorePurchases = async () => {
  return await Purchases.getSharedInstance().restorePurchases();
};

export const checkEntitlement = async () => {
  const info = await getCustomerInfo();
  return !!info.entitlements.active[ENTITLEMENT_ID];
};