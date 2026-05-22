import {ConnectedDevice, UsageSnapshot} from '../types/domain';

export const createEstimatedUsageSnapshots = (
  devices: ConnectedDevice[],
  timestamp: number,
): UsageSnapshot[] => {
  return devices.map(device => ({
    id: `usage-${device.id}-${timestamp}`,
    deviceId: device.id,
    timestamp,
    bytesUsed: Math.max(device.connectionCount, 1) * 125 * 1024 * 1024,
    periodKey: new Date(timestamp).toISOString().slice(0, 10),
    source: 'estimated',
  }));
};
