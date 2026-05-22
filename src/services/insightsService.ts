import {
  ActivityEvent,
  ConnectedDevice,
  DevicePolicy,
  UsageSnapshot,
} from '../types/domain';

export interface DeviceInsight {
  deviceId: string;
  label: string;
  totalBytes: number;
}

export interface InsightsSummary {
  totalBytes: number;
  activeDeviceCount: number;
  alertCount: number;
  topDevices: DeviceInsight[];
  recommendations: string[];
}

const getDeviceLabel = (device: ConnectedDevice): string =>
  device.nickname || device.displayName;

export const buildInsightsSummary = (
  devices: ConnectedDevice[],
  usageSnapshots: UsageSnapshot[],
  policies: DevicePolicy[],
  activity: ActivityEvent[],
): InsightsSummary => {
  const totals = usageSnapshots.reduce<Record<string, number>>((acc, snapshot) => {
    acc[snapshot.deviceId] = (acc[snapshot.deviceId] ?? 0) + snapshot.bytesUsed;
    return acc;
  }, {});

  const topDevices = devices
    .map(device => ({
      deviceId: device.id,
      label: getDeviceLabel(device),
      totalBytes: totals[device.id] ?? 0,
    }))
    .sort((left, right) => right.totalBytes - left.totalBytes);

  const recommendations = policies.flatMap(policy => {
    if (!policy.deviceId || policy.byteCap == null) {
      return [];
    }
    const device = devices.find(entry => entry.id === policy.deviceId);
    const usedBytes = totals[policy.deviceId] ?? 0;

    if (!device || usedBytes <= policy.byteCap) {
      return [];
    }

    return [
      `${getDeviceLabel(device)} is overrunning ${policy.name}. Consider a tighter cap or an automatic block rule.`,
    ];
  });

  return {
    totalBytes: usageSnapshots.reduce((sum, snapshot) => sum + snapshot.bytesUsed, 0),
    activeDeviceCount: topDevices.filter(device => device.totalBytes > 0).length,
    alertCount: activity.filter(event => event.severity !== 'info').length,
    topDevices,
    recommendations,
  };
};
