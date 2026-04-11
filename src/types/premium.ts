export type FeatureKey =
  | 'deviceManagement'
  | 'basicDataLimits'
  | 'hotspotTimer'
  | 'specificScheduling'
  | 'deviceReports'
  | 'customPlans';

const premiumFeatures: FeatureKey[] = [
  'specificScheduling',
  'deviceReports',
  'customPlans',
];

export const isPremiumFeature = (feature: FeatureKey): boolean =>
  premiumFeatures.includes(feature);
