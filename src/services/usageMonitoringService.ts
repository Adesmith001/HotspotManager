import { DataLimit, UsageSnapshot } from '../types/domain';

export const getBudgetStart = (
  period: DataLimit['periodType'],
  now: Date,
): Date => {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === 'weekly') {
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  } else if (period === 'monthly') {
    start.setDate(1);
  }
  return start;
};

export const getBudgetUsage = (
  usage: UsageSnapshot[],
  period: DataLimit['periodType'],
  now: Date,
): number => {
  const start = getBudgetStart(period, now).getTime();
  return usage.reduce(
    (sum, entry) =>
      entry.timestamp >= start && entry.timestamp <= now.getTime()
        ? sum + entry.bytesUsed
        : sum,
    0,
  );
};
