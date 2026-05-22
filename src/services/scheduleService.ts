import {ScheduleRule} from '../types/domain';

type LightweightRule = {id: string; scope: 'global' | 'device'; cap: number};

export const chooseEffectiveRule = (
  globalRule: LightweightRule,
  deviceRule?: LightweightRule,
): LightweightRule => deviceRule ?? globalRule;

export const getActiveSchedule = (
  schedules: ScheduleRule[],
  now: Date,
  deviceId?: string,
): ScheduleRule | null => {
  const day = now.getDay();
  const hour = now.getHours();

  const candidates = schedules.filter(
    rule =>
      (rule.enabled ?? true) &&
      (rule.daysOfWeek?.includes(day) ?? rule.dayOfWeek === day) &&
      hour >= rule.startHour &&
      hour < rule.endHour &&
      (rule.scope === 'global' || rule.deviceId === deviceId),
  );

  const deviceRule = candidates.find(
    rule => rule.scope === 'device' && rule.deviceId === deviceId,
  );
  if (deviceRule) {
    return deviceRule;
  }
  return candidates.find(rule => rule.scope === 'global') ?? null;
};
