import reducer, {setPremiumStatus} from '../slices/subscriptionSlice';

describe('subscription slice', () => {
  it('stores premium entitlement state', () => {
    const state = reducer(
      undefined,
      setPremiumStatus({active: true, source: 'revenuecat'}),
    );
    expect(state.active).toBe(true);
    expect(state.source).toBe('revenuecat');
  });
});
