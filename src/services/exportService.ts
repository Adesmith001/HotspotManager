import {
  ActivityEvent,
  AutomationProfile,
  ConnectedDevice,
  DevicePolicy,
  DataLimit,
  ScheduleRule,
  UsageSnapshot,
} from '../types/domain';

export const buildUsageCsv = (
  devices: ConnectedDevice[],
  usageSnapshots: UsageSnapshot[],
): string => {
  const rows = ['deviceId,deviceName,timestamp,bytesUsed,source'];

  for (const snapshot of usageSnapshots) {
    const device = devices.find(entry => entry.id === snapshot.deviceId);
    rows.push(
      [
        snapshot.deviceId,
        device?.nickname || device?.displayName || snapshot.deviceId,
        snapshot.timestamp,
        snapshot.bytesUsed,
        snapshot.source,
      ]
        .map(value => {
          if (typeof value === 'number') {
            return String(value);
          }
          const cell = /^[=+@\-\t\r\n]/.test(value) ? "'" + value : value;
          return '"' + cell.replace(/"/g, '""') + '"';
        })
        .join(','),
    );
  }

  return rows.join('\n');
};

export const buildBackupPayload = (input: {
  devices: ConnectedDevice[];
  usageSnapshots: UsageSnapshot[];
  activity: ActivityEvent[];
  policies: DevicePolicy[];
  automationProfiles: AutomationProfile[];
  schedules: ScheduleRule[];
  globalLimit: DataLimit;
}): string => {
  return JSON.stringify(input, null, 2);
};
