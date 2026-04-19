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