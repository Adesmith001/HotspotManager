import {isPremiumActive} from '../subscriptionService';

describe('isPremiumActive', () => {
  it('returns true when premium entitlement is active', () => {
    expect(
      isPremiumActive({
        entitlements: {active: {premium: {isActive: true}}},
      }),
    ).toBe(true);
  });

  it('returns false when entitlement is missing', () => {
    expect(isPremiumActive({entitlements: {active: {}}})).toBe(false);
  });
});
