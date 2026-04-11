import {chooseEffectiveRule} from '../scheduleService';

describe('schedule rule selection', () => {
  it('prefers device-specific schedule over global schedule', () => {
    const rule = chooseEffectiveRule(
      {id: 'global', scope: 'global', cap: 1000},
      {id: 'device', scope: 'device', cap: 500},
    );
    expect(rule.id).toBe('device');
  });
});
