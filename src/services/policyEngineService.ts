import { getActiveSchedule } from './scheduleService';
import { getBudgetStart, getBudgetUsage } from './usageMonitoringService';

import {
  ActivityEvent,
  CapabilityState,
  ConnectedDevice,
  DataLimit,
  DevicePolicy,
  UsageSnapshot,
  ScheduleRule,
} from '../types/domain';

export interface PolicyAction {
  type: 'blockDevice' | 'notify' | 'warn';
  deviceId?: string;
  supported: boolean;
  message: string;
}

export interface PolicyEvaluationInput {
  capability: CapabilityState;
  devices: ConnectedDevice[];
  policies: DevicePolicy[];
  schedules?: ScheduleRule[];
  usageSnapshots: UsageSnapshot[];
  globalLimit: DataLimit;
  now: Date;
}

export interface PolicyEvaluationResult {
  deviceUpdates: ConnectedDevice[];
  actions: PolicyAction[];
  activity: ActivityEvent[];
}

export const evaluatePolicies = ({
  capability,
  devices,
  policies,
  schedules = [],
  usageSnapshots,
  globalLimit,
  now,
}: PolicyEvaluationInput): PolicyEvaluationResult => {
  const actions: PolicyAction[] = [];
  const activity: ActivityEvent[] = [];
  const period = globalLimit.periodType;
  const budgetStart = getBudgetStart(period, now).getTime();
  const scheduleUsage = (schedule: ScheduleRule, deviceId?: string) => {
    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      schedule.startHour,
    );
    return usageSnapshots.reduce(
      (sum, snapshot) =>
        (!deviceId || snapshot.deviceId === deviceId) &&
        snapshot.timestamp >= start.getTime() &&
        snapshot.timestamp <= now.getTime()
          ? sum + snapshot.bytesUsed
          : sum,
      0,
    );
  };
  const dayKey = getBudgetStart('daily', now).getTime();

  const deviceUpdates: ConnectedDevice[] = devices.map(
    (device): ConnectedDevice => {
      const policy = policies.find(
        entry =>
          entry.enabled &&
          entry.scope === 'device' &&
          entry.deviceId === device.id,
      );
      const schedule = getActiveSchedule(schedules, now, device.id);
      const deviceSchedule = schedule?.scope === 'device' ? schedule : null;
      const cap = deviceSchedule?.cap ?? policy?.byteCap;
      const overageAction = deviceSchedule
        ? deviceSchedule.reaction
        : policy?.overageAction;
      const threshold =
        policy?.warningThresholdPct ?? globalLimit.warningThresholdPct;
      const usedBytes = deviceSchedule
        ? scheduleUsage(deviceSchedule, device.id)
        : getBudgetUsage(
            usageSnapshots.filter(entry => entry.deviceId === device.id),
            period,
            now,
          );
      const periodKey = deviceSchedule
        ? dayKey + '-' + deviceSchedule.id
        : budgetStart;
      const eventKey =
        device.id + '-' + periodKey + '-' + cap + '-' + threshold;

      if (device.blocked || cap == null) {
        return {
          ...device,
          policyStatus: device.blocked ? 'blocked' : 'normal',
        };
      }

      if (device.trusted && policy?.allowTrustedBypass && !deviceSchedule) {
        return {
          ...device,
          policyStatus: 'trusted-bypass',
        };
      }

      const warningBytes = Math.floor(cap * (threshold / 100));

      if (usedBytes >= cap) {
        if (overageAction === 'block') {
          actions.push({
            type: 'blockDevice',
            deviceId: device.id,
            supported: capability.canBlockClients,
            message: capability.canBlockClients
              ? `${device.displayName} should be blocked.`
              : `${device.displayName} exceeded its cap but blocking is unsupported.`,
          });
        }
        activity.push({
          id: 'policy-limit-exceeded-' + eventKey,
          type: 'limitExceeded',
          title: `${device.displayName} exceeded its cap`,
          details: `${device.displayName} used ${usedBytes} bytes against a ${cap} byte cap.`,
          timestamp: now.getTime(),
          severity: 'critical',
          deviceId: device.id,
        });
        return {
          ...device,
          policyStatus: 'warning',
        };
      }

      if (usedBytes >= warningBytes) {
        actions.push({
          type: 'warn',
          deviceId: device.id,
          supported: true,
          message: `${device.displayName} is close to its cap.`,
        });
        activity.push({
          id: 'policy-limit-warning-' + eventKey,
          type: 'limitWarning',
          title: `${device.displayName} is near its cap`,
          details: `${device.displayName} reached ${threshold}% of its cap.`,
          timestamp: now.getTime(),
          severity: 'warning',
          deviceId: device.id,
        });
        return {
          ...device,
          policyStatus: 'warning',
        };
      }

      return {
        ...device,
        policyStatus: 'normal',
      };
    },
  );

  const globalSchedule = getActiveSchedule(schedules, now);
  const scheduledCap = globalSchedule?.cap ?? globalLimit.byteLimit;
  const periodKey = globalSchedule
    ? dayKey + '-' + globalSchedule.id
    : budgetStart;
  const usedBytes = globalSchedule
    ? scheduleUsage(globalSchedule)
    : getBudgetUsage(usageSnapshots, period, now);
  const eventKey =
    periodKey + '-' + scheduledCap + '-' + globalLimit.warningThresholdPct;
  const label = globalSchedule ? 'Scheduled budget' : 'Global budget';
  const globalWarningBytes = Math.floor(
    scheduledCap * (globalLimit.warningThresholdPct / 100),
  );

  if (usedBytes >= scheduledCap) {
    activity.push({
      id: 'global-limit-exceeded-' + eventKey,
      type: 'limitExceeded',
      title: label + ' exceeded',
      details: `Hotspot usage reached ${usedBytes} bytes.`,
      timestamp: now.getTime(),
      severity: 'critical',
    });
  } else if (usedBytes >= globalWarningBytes) {
    activity.push({
      id: 'global-limit-warning-' + eventKey,
      type: 'limitWarning',
      title: label + ' warning',
      details: `Hotspot usage reached ${globalLimit.warningThresholdPct}% of the current limit.`,
      timestamp: now.getTime(),
      severity: 'warning',
    });
  }

  return {
    deviceUpdates,
    actions,
    activity,
  };
};
