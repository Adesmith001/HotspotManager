import {
  ActivityEvent,
  CapabilityState,
  ConnectedDevice,
  DataLimit,
  DevicePolicy,
  UsageSnapshot,
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
  usageSnapshots: UsageSnapshot[];
  globalLimit: DataLimit;
  now: Date;
}

export interface PolicyEvaluationResult {
  deviceUpdates: ConnectedDevice[];
  actions: PolicyAction[];
  activity: ActivityEvent[];
}

const totalBytesForDevice = (
  usageSnapshots: UsageSnapshot[],
  deviceId: string,
): number => {
  return usageSnapshots
    .filter(snapshot => snapshot.deviceId === deviceId)
    .reduce((sum, snapshot) => sum + snapshot.bytesUsed, 0);
};

const globalBytes = (usageSnapshots: UsageSnapshot[]): number => {
  return usageSnapshots.reduce((sum, snapshot) => sum + snapshot.bytesUsed, 0);
};

export const evaluatePolicies = ({
  capability,
  devices,
  policies,
  usageSnapshots,
  globalLimit,
  now,
}: PolicyEvaluationInput): PolicyEvaluationResult => {
  const actions: PolicyAction[] = [];
  const activity: ActivityEvent[] = [];

  const deviceUpdates: ConnectedDevice[] = devices.map(
    (device): ConnectedDevice => {
      const policy = policies.find(
        entry => entry.enabled && entry.scope === 'device' && entry.deviceId === device.id,
      );
      const usedBytes = totalBytesForDevice(usageSnapshots, device.id);

      if (!policy || policy.byteCap == null) {
        return device;
      }

      if (device.trusted && policy.allowTrustedBypass) {
        return {
          ...device,
          policyStatus: 'trusted-bypass',
        };
      }

      const warningBytes = Math.floor(
        policy.byteCap * (policy.warningThresholdPct / 100),
      );

      if (usedBytes >= policy.byteCap) {
        const blocked =
          policy.overageAction === 'block' ? capability.canBlockClients : device.blocked;
        if (policy.overageAction === 'block') {
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
          id: `policy-limit-exceeded-${device.id}-${now.getTime()}`,
          type: 'limitExceeded',
          title: `${device.displayName} exceeded its cap`,
          details: `${device.displayName} used ${usedBytes} bytes against a ${policy.byteCap} byte cap.`,
          timestamp: now.getTime(),
          severity: 'critical',
          deviceId: device.id,
        });
        return {
          ...device,
          blocked,
          policyStatus: blocked ? 'blocked' : 'warning',
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
          id: `policy-limit-warning-${device.id}-${now.getTime()}`,
          type: 'limitWarning',
          title: `${device.displayName} is near its cap`,
          details: `${device.displayName} reached ${policy.warningThresholdPct}% of its cap.`,
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

  const usedBytes = globalBytes(usageSnapshots);
  const globalWarningBytes = Math.floor(
    globalLimit.byteLimit * (globalLimit.warningThresholdPct / 100),
  );

  if (usedBytes >= globalLimit.byteLimit) {
    activity.push({
      id: `global-limit-exceeded-${now.getTime()}`,
      type: 'limitExceeded',
      title: 'Global limit exceeded',
      details: `Hotspot usage reached ${usedBytes} bytes.`,
      timestamp: now.getTime(),
      severity: 'critical',
    });
  } else if (usedBytes >= globalWarningBytes) {
    activity.push({
      id: `global-limit-warning-${now.getTime()}`,
      type: 'limitWarning',
      title: 'Global limit warning',
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
