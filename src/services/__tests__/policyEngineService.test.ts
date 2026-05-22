import {evaluatePolicies} from '../policyEngineService';
import {CapabilityState, ConnectedDevice, DataLimit, DevicePolicy, UsageSnapshot} from '../../types/domain';

describe('policy engine service', () => {
  const capability: CapabilityState = {
    tier: 'B',
    canToggleHotspot: false,
    canListClients: true,
    canBlockClients: true,
    canRunBackgroundAutomation: false,
    canSendLocalNotifications: true,
    canEstimateUsage: true,
    diagnostics: ['Native hotspot toggling unavailable on this device.'],
  };
  const globalLimit: DataLimit = {
    periodType: 'daily',
    byteLimit: 5000,
    warningThresholdPct: 80,
    hardStopEnabled: false,
  };

  it('blocks an untrusted device that exceeds its cap', () => {
    const devices: ConnectedDevice[] = [
      {
        id: 'device-1',
        displayName: 'Tablet',
        nickname: 'Guest Tablet',
        vendor: 'Samsung',
        blocked: false,
        trusted: false,
        policyStatus: 'normal',
        firstSeenAt: 100,
        lastSeenAt: 200,
        connectionCount: 1,
      },
    ];
    const policies: DevicePolicy[] = [
      {
        id: 'policy-1',
        name: 'Guest cap',
        scope: 'device',
        deviceId: 'device-1',
        enabled: true,
        byteCap: 1000,
        warningThresholdPct: 75,
        overageAction: 'block',
        allowTrustedBypass: false,
        fallbackBehavior: 'notify_only',
      },
    ];
    const usage: UsageSnapshot[] = [
      {
        id: 'usage-1',
        deviceId: 'device-1',
        timestamp: 200,
        bytesUsed: 1200,
        periodKey: '2026-05-22',
        source: 'estimated',
      },
    ];

    const result = evaluatePolicies({
      capability,
      devices,
      policies,
      usageSnapshots: usage,
      globalLimit,
      now: new Date('2026-05-22T18:30:00Z'),
    });

    expect(result.deviceUpdates[0].blocked).toBe(true);
    expect(result.deviceUpdates[0].policyStatus).toBe('blocked');
    expect(result.actions[0]).toMatchObject({
      type: 'blockDevice',
      deviceId: 'device-1',
      supported: true,
    });
  });

  it('lets a trusted device bypass a device policy when allowed', () => {
    const devices: ConnectedDevice[] = [
      {
        id: 'device-2',
        displayName: 'Laptop',
        nickname: 'Work Laptop',
        vendor: 'Dell',
        blocked: false,
        trusted: true,
        policyStatus: 'normal',
        firstSeenAt: 100,
        lastSeenAt: 200,
        connectionCount: 1,
      },
    ];
    const policies: DevicePolicy[] = [
      {
        id: 'policy-2',
        name: 'Work cap',
        scope: 'device',
        deviceId: 'device-2',
        enabled: true,
        byteCap: 1000,
        warningThresholdPct: 75,
        overageAction: 'block',
        allowTrustedBypass: true,
        fallbackBehavior: 'notify_only',
      },
    ];
    const usage: UsageSnapshot[] = [
      {
        id: 'usage-2',
        deviceId: 'device-2',
        timestamp: 200,
        bytesUsed: 3000,
        periodKey: '2026-05-22',
        source: 'estimated',
      },
    ];

    const result = evaluatePolicies({
      capability,
      devices,
      policies,
      usageSnapshots: usage,
      globalLimit,
      now: new Date('2026-05-22T18:30:00Z'),
    });

    expect(result.deviceUpdates[0].blocked).toBe(false);
    expect(result.deviceUpdates[0].policyStatus).toBe('trusted-bypass');
    expect(result.actions).toHaveLength(0);
  });
});
