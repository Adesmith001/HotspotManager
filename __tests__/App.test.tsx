import {isPremiumFeature} from '../src/types/premium';

describe('feature separation', () => {
  it('keeps free and premium feature boundaries', () => {
    expect(isPremiumFeature('deviceManagement')).toBe(false);
    expect(isPremiumFeature('basicDataLimits')).toBe(false);
    expect(isPremiumFeature('hotspotTimer')).toBe(false);
    expect(isPremiumFeature('activityFeed')).toBe(false);
    expect(isPremiumFeature('notifications')).toBe(false);

    expect(isPremiumFeature('specificScheduling')).toBe(true);
    expect(isPremiumFeature('deviceReports')).toBe(true);
    expect(isPremiumFeature('customPlans')).toBe(true);
    expect(isPremiumFeature('automationProfiles')).toBe(true);
    expect(isPremiumFeature('smartRecommendations')).toBe(true);
    expect(isPremiumFeature('backupRestore')).toBe(true);
  });
});
