import {isPremiumFeature} from '../src/types/premium';

describe('feature separation', () => {
  it('keeps free and premium feature boundaries', () => {
    expect(isPremiumFeature('deviceManagement')).toBe(false);
    expect(isPremiumFeature('basicDataLimits')).toBe(false);
    expect(isPremiumFeature('hotspotTimer')).toBe(false);

    expect(isPremiumFeature('specificScheduling')).toBe(true);
    expect(isPremiumFeature('deviceReports')).toBe(true);
    expect(isPremiumFeature('customPlans')).toBe(true);
  });
});
