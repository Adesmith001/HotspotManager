import {buildInsightsSummary} from '../insightsService';
import {ActivityEvent, ConnectedDevice, DevicePolicy, UsageSnapshot} from '../../types/domain';

describe('insights service', () => {
  it('aggregates totals, ranks top devices, and produces recommendations', () => {
    const devices: ConnectedDevice[] = [
      {
        id: 'device-1',
        displayName: 'Laptop',
        nickname: 'Work Laptop',
        vendor: 'Lenovo',
        ipAddress: '192.168.43.2',
        macAddress: 'AA:AA:AA:AA:AA:01',
        blocked: false,
        trusted: true,
        policyStatus: 'normal',
        firstSeenAt: 100,
        lastSeenAt: 300,
        connectionCount: 4,
      },
      {
        id: 'device-2',
        displayName: 'Tablet',
        nickname: 'Guest Tablet',
        vendor: 'Samsung',
        ipAddress: '192.168.43.3',
        macAddress: 'AA:AA:AA:AA:AA:02',
        blocked: false,
        trusted: false,
        policyStatus: 'warning',
        firstSeenAt: 200,
        lastSeenAt: 400,
        connectionCount: 2,
      },
    ];
    const usage: UsageSnapshot[] = [
      {
        id: 'usage-1',
        deviceId: 'device-1',
        timestamp: 1000,
        bytesUsed: 900,
        periodKey: '2026-05-22',
        source: 'estimated',
      },
      {
        id: 'usage-2',
        deviceId: 'device-2',
        timestamp: 2000,
        bytesUsed: 2000,
        periodKey: '2026-05-22',
        source: 'estimated',
      },
    ];
    const policies: DevicePolicy[] = [
      {
        id: 'policy-guest',
        name: 'Guest cap',
        scope: 'device',
        deviceId: 'device-2',
        enabled: true,
        byteCap: 1500,
        warningThresholdPct: 75,
        overageAction: 'block',
        allowTrustedBypass: false,
        fallbackBehavior: 'notify_only',
      },
    ];
    const activity: ActivityEvent[] = [
      {
        id: 'activity-1',
        type: 'limitExceeded',
        title: 'Guest cap exceeded',
        details: 'Guest Tablet exceeded its device cap.',
        timestamp: 3000,
        severity: 'critical',
        deviceId: 'device-2',
      },
    ];

    const summary = buildInsightsSummary(devices, usage, policies, activity);

    expect(summary.totalBytes).toBe(2900);
    expect(summary.topDevices[0].deviceId).toBe('device-2');
    expect(summary.alertCount).toBe(1);
    expect(summary.recommendations[0]).toContain('Guest Tablet');
  });
});
