import {isPremiumFeature} from '../premium';

describe('premium feature mapping', () => {
  it('marks schedule, reports, and custom plans as premium', () => {
    expect(isPremiumFeature('specificScheduling')).toBe(true);
    expect(isPremiumFeature('deviceReports')).toBe(true);
    expect(isPremiumFeature('customPlans')).toBe(true);
    expect(isPremiumFeature('hotspotTimer')).toBe(false);
  });
});
