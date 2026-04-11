import {Platform} from 'react-native';

import {
  REVENUECAT_ANDROID_API_KEY,
  REVENUECAT_ENTITLEMENT_ID,
  REVENUECAT_IOS_API_KEY,
} from '../config/revenueCat';

interface EntitlementValue {
  isActive?: boolean;
  expirationDate?: string | null;
}

interface CustomerInfoLike {
  entitlements?: {
    active?: Record<string, EntitlementValue>;
  };
}

export interface SubscriptionSnapshot {
  active: boolean;
  source: 'cache' | 'revenuecat';
  expiresAt: string | null;
  lastValidatedAt: number;
}

let isConfigured = false;

const loadPurchases = async (): Promise<any> =>
  (await import('react-native-purchases')).default;

const getCurrentApiKey = (): string => {
  return Platform.OS === 'android'
    ? REVENUECAT_ANDROID_API_KEY
    : REVENUECAT_IOS_API_KEY;
};

export const isPremiumActive = (customerInfo: CustomerInfoLike): boolean => {
  return (
    customerInfo?.entitlements?.active?.[REVENUECAT_ENTITLEMENT_ID]?.isActive ===
    true
  );
};

export const initializeRevenueCat = async (): Promise<boolean> => {
  const apiKey = getCurrentApiKey();
  if (!apiKey || isConfigured) {
    return false;
  }

  const Purchases = await loadPurchases();
  await Purchases.configure({apiKey});
  isConfigured = true;
  return true;
};

export const refreshEntitlement = async (): Promise<SubscriptionSnapshot> => {
  const apiKey = getCurrentApiKey();
  if (!apiKey) {
    return {
      active: false,
      source: 'cache',
      expiresAt: null,
      lastValidatedAt: Date.now(),
    };
  }

  await initializeRevenueCat();
  const Purchases = await loadPurchases();
  const customerInfo: CustomerInfoLike = await Purchases.getCustomerInfo();
  const entitlement =
    customerInfo.entitlements?.active?.[REVENUECAT_ENTITLEMENT_ID];

  return {
    active: isPremiumActive(customerInfo),
    source: 'revenuecat',
    expiresAt: entitlement?.expirationDate ?? null,
    lastValidatedAt: Date.now(),
  };
};

export const purchasePremium = async (): Promise<boolean> => {
  const apiKey = getCurrentApiKey();
  if (!apiKey) {
    return false;
  }
  await initializeRevenueCat();
  const Purchases = await loadPurchases();
  const offerings = await Purchases.getOfferings();
  const selectedPackage = offerings?.current?.availablePackages?.[0];

  if (!selectedPackage) {
    return false;
  }

  await Purchases.purchasePackage(selectedPackage);
  return true;
};

export const restorePurchases = async (): Promise<SubscriptionSnapshot> => {
  const apiKey = getCurrentApiKey();
  if (!apiKey) {
    return {
      active: false,
      source: 'cache',
      expiresAt: null,
      lastValidatedAt: Date.now(),
    };
  }
  await initializeRevenueCat();
  const Purchases = await loadPurchases();
  await Purchases.restorePurchases();
  return refreshEntitlement();
};
