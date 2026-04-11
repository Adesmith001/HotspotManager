import {computeTimerEnd, isTimerExpired} from '../timerService';

describe('timer service', () => {
  it('computes end time using duration seconds', () => {
    const end = computeTimerEnd(1000, 60);
    expect(end).toBe(61000);
  });

  it('detects expiration correctly', () => {
    expect(isTimerExpired(5000, 5000)).toBe(true);
    expect(isTimerExpired(5000, 4900)).toBe(false);
  });
});
