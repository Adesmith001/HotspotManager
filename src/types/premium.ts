export type FeatureKey =
  | 'deviceManagement'
  | 'basicDataLimits'
  | 'hotspotTimer'
  | 'activityFeed'
  | 'notifications'
  | 'specificScheduling'
  | 'deviceReports'
  | 'customPlans'
  | 'automationProfiles'
  | 'smartRecommendations'
  | 'backupRestore';

const premiumFeatures: FeatureKey[] = [
  'specificScheduling',
  'deviceReports',
  'customPlans',
  'automationProfiles',
  'smartRecommendations',
  'backupRestore',
];

export const isPremiumFeature = (feature: FeatureKey): boolean =>
  premiumFeatures.includes(feature);
