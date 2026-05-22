import {appendActivity} from './activityService';
import {runMigrations} from '../db';
import {getActivityEvents, addActivityEvent} from '../db/repositories/activityRepository';
import {getDevices, upsertDevice} from '../db/repositories/deviceRepository';
import {
  getAutomationProfiles,
  getDevicePolicies,
  upsertAutomationProfile,
  upsertDevicePolicy,
} from '../db/repositories/policyRepository';
import {
  getAllAppValues,
  getSettings,
  saveAppValue,
  saveSettings,
} from '../db/repositories/settingsRepository';
import {
  addUsageSnapshot,
  getUsageSnapshots,
} from '../db/repositories/usageRepository';
import {
  ActivityEvent,
  AppSettings,
  AutomationProfile,
  ConnectedDevice,
  DataLimit,
  DevicePolicy,
  HotspotStatus,
  HotspotTimer,
  UsageSnapshot,
} from '../types/domain';

export interface HydratedAppState {
  devices: ConnectedDevice[];
  usageSnapshots: UsageSnapshot[];
  activity: ActivityEvent[];
  policies: DevicePolicy[];
  automationProfiles: AutomationProfile[];
  settings: AppSettings;
  globalLimit: DataLimit;
  timer: HotspotTimer | null;
  hotspotStatus: HotspotStatus;
}

export const defaultGlobalLimit: DataLimit = {
  periodType: 'daily',
  byteLimit: 2 * 1024 * 1024 * 1024,
  warningThresholdPct: 80,
  hardStopEnabled: false,
};

export const defaultHotspotStatus: HotspotStatus = {
  enabled: true,
  connectedDeviceCount: 0,
  sessionStartedAt: null,
  lastRefreshedAt: Date.now(),
};

export const createDefaultPolicies = (): DevicePolicy[] => [
  {
    id: 'policy-global-protect',
    name: 'Global protection',
    scope: 'global',
    enabled: true,
    byteCap: 2 * 1024 * 1024 * 1024,
    warningThresholdPct: 80,
    overageAction: 'warn',
    allowTrustedBypass: true,
    fallbackBehavior: 'notify_only',
  },
];

export const createDefaultAutomationProfiles = (): AutomationProfile[] => [
  {
    id: 'profile-bedtime',
    name: 'Bedtime quiet hours',
    kind: 'bedtime',
    enabled: false,
    triggerDescription: 'Warn after 11pm and prepare a timer fallback.',
    reaction: 'notify',
  },
  {
    id: 'profile-unknown-device',
    name: 'Unknown device joins',
    kind: 'unknownDevice',
    enabled: true,
    triggerDescription: 'Highlight new or untrusted devices immediately.',
    reaction: 'notify',
  },
];

const mergeDevices = (
  persisted: ConnectedDevice[],
  discovered: ConnectedDevice[],
): ConnectedDevice[] => {
  if (discovered.length === 0) {
    return persisted;
  }

  return discovered.map(device => {
    const existing = persisted.find(entry => entry.id === device.id);
    return {
      ...device,
      nickname: existing?.nickname ?? device.nickname,
      trusted: existing?.trusted ?? device.trusted,
      firstSeenAt: existing?.firstSeenAt ?? device.firstSeenAt,
      connectionCount: Math.max(existing?.connectionCount ?? 0, device.connectionCount),
      policyStatus: existing?.policyStatus ?? device.policyStatus,
    };
  });
};

export const hydrateAppState = async (
  discoveredDevices: ConnectedDevice[],
): Promise<HydratedAppState> => {
  await runMigrations();

  const [persistedDevices, usageSnapshots, persistedActivity, storedPolicies, profiles, settings, appValues] =
    await Promise.all([
      getDevices(),
      getUsageSnapshots(),
      getActivityEvents(),
      getDevicePolicies(),
      getAutomationProfiles(),
      getSettings(),
      getAllAppValues(),
    ]);

  const devices = mergeDevices(persistedDevices, discoveredDevices);
  const policies = storedPolicies.length > 0 ? storedPolicies : createDefaultPolicies();
  const automationProfiles =
    profiles.length > 0 ? profiles : createDefaultAutomationProfiles();
  let activity = [...persistedActivity];

  for (const device of devices) {
    const wasKnown = persistedDevices.some(entry => entry.id === device.id);
    if (!wasKnown) {
      activity = appendActivity(activity, {
        id: `activity-join-${device.id}`,
        type: 'deviceJoined',
        title: `${device.nickname || device.displayName} joined`,
        details: `${device.nickname || device.displayName} was discovered on the hotspot.`,
        timestamp: device.lastSeenAt,
        severity: device.trusted ? 'info' : 'warning',
        deviceId: device.id,
      });
    }
  }

  const globalLimit = (appValues.globalLimit as DataLimit | undefined) ?? defaultGlobalLimit;
  const timer = (appValues.timer as HotspotTimer | null | undefined) ?? null;
  const hotspotStatus =
    (appValues.hotspotStatus as HotspotStatus | undefined) ?? {
      ...defaultHotspotStatus,
      connectedDeviceCount: devices.length,
      lastRefreshedAt: Date.now(),
    };

  for (const device of devices) {
    await upsertDevice(device);
  }
  if (storedPolicies.length === 0) {
    for (const policy of policies) {
      await upsertDevicePolicy(policy);
    }
  }
  if (profiles.length === 0) {
    for (const profile of automationProfiles) {
      await upsertAutomationProfile(profile);
    }
  }
  for (const event of activity) {
    await addActivityEvent(event);
  }
  await saveAppValue('globalLimit', globalLimit);
  await saveAppValue('hotspotStatus', hotspotStatus);
  await saveSettings(settings);

  return {
    devices,
    usageSnapshots,
    activity,
    policies,
    automationProfiles,
    settings,
    globalLimit,
    timer,
    hotspotStatus,
  };
};

export const persistDevice = async (device: ConnectedDevice): Promise<void> => {
  await upsertDevice(device);
};

export const persistUsageSnapshot = async (snapshot: UsageSnapshot): Promise<void> => {
  await addUsageSnapshot(snapshot);
};

export const persistActivityEvent = async (event: ActivityEvent): Promise<void> => {
  await addActivityEvent(event);
};

export const persistPolicies = async (policies: DevicePolicy[]): Promise<void> => {
  for (const policy of policies) {
    await upsertDevicePolicy(policy);
  }
};

export const persistAutomationProfiles = async (
  profiles: AutomationProfile[],
): Promise<void> => {
  for (const profile of profiles) {
    await upsertAutomationProfile(profile);
  }
};

export const persistSettings = async (settings: AppSettings): Promise<void> => {
  await saveSettings(settings);
};

export const persistGlobalLimit = async (limit: DataLimit): Promise<void> => {
  await saveAppValue('globalLimit', limit);
};

export const persistTimer = async (timer: HotspotTimer | null): Promise<void> => {
  await saveAppValue('timer', timer);
};

export const persistHotspotStatus = async (
  hotspotStatus: HotspotStatus,
): Promise<void> => {
  await saveAppValue('hotspotStatus', hotspotStatus);
};
