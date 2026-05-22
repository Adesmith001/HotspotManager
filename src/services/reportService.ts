import {ConnectedDevice, UsageRecord, UsageSnapshot} from '../types/domain';

export interface DeviceUsageReport {
  deviceId: string;
  deviceName: string;
  totalBytes: number;
  recordCount: number;
}

export const buildDeviceReports = (
  devices: ConnectedDevice[],
  usageRecords: Array<UsageRecord | UsageSnapshot>,
): DeviceUsageReport[] => {
  const totals = usageRecords.reduce<Record<string, number>>((acc, record) => {
    acc[record.deviceId] = (acc[record.deviceId] ?? 0) + record.bytesUsed;
    return acc;
  }, {});

  return devices.map(device => {
    const deviceRecords = usageRecords.filter(
      record => record.deviceId === device.id,
    );
    return {
      deviceId: device.id,
      deviceName: device.displayName,
      totalBytes: totals[device.id] ?? 0,
      recordCount: deviceRecords.length,
    };
  });
};
