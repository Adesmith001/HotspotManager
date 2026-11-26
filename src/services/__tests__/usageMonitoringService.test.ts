import { getBudgetUsage } from '../usageMonitoringService';
import { UsageSnapshot } from '../../types/domain';

it('totals usage in the current local calendar period and ignores future entries', () => {
  const now = new Date(2026, 10, 26, 12);
  const snapshot = (day: number, bytesUsed: number): UsageSnapshot => ({
    id: String(day),
    deviceId: 'tablet',
    timestamp: new Date(2026, 10, day).getTime(),
    bytesUsed,
    periodKey: '',
    source: 'manual',
  });
  const usage = [
    snapshot(3, 1),
    snapshot(23, 2),
    snapshot(26, 4),
    snapshot(27, 8),
  ];
  expect(getBudgetUsage(usage, 'daily', now)).toBe(4);
  expect(getBudgetUsage(usage, 'weekly', now)).toBe(6);
  expect(getBudgetUsage(usage, 'monthly', now)).toBe(7);
});
