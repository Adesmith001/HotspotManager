import { NativeModules } from 'react-native';

import {
  ConnectedDevice,
  ControlAttemptResult,
  HotspotStatus,
} from '../types/domain';
import { NativeCapabilitySnapshot } from '../types/capabilities';

interface HotspotNativeModule {
  openNetworkSettings?: () => Promise<boolean>;
  getCapabilities?: () => Promise<NativeCapabilitySnapshot>;
  getConnectedDevices?: () => Promise<ConnectedDevice[]>;
  getHotspotStatus?: () => Promise<HotspotStatus>;
  blockDevice?: (deviceId: string) => Promise<ControlAttemptResult>;
  unblockDevice?: (deviceId: string) => Promise<ControlAttemptResult>;
  setHotspotEnabled?: (enabled: boolean) => Promise<ControlAttemptResult>;
}

const nativeModule: HotspotNativeModule | undefined =
  NativeModules.HotspotManager;

const fallbackCapabilities: NativeCapabilitySnapshot = {
  canToggleHotspot: false,
  canListClients: false,
  canBlockClients: false,
  canRunBackgroundAutomation: false,
  canSendLocalNotifications: false,
  canEstimateUsage: false,
  diagnostics: [
    'Manage hotspot connections in system settings. Use this app to log usage and track budgets.',
  ],
};

export const getNativeCapabilities =
  async (): Promise<NativeCapabilitySnapshot> => {
    if (nativeModule?.getCapabilities) {
      return nativeModule.getCapabilities();
    }
    return fallbackCapabilities;
  };

export const getNativeConnectedDevices = async (): Promise<
  ConnectedDevice[]
> => {
  if (nativeModule?.getConnectedDevices) {
    return nativeModule.getConnectedDevices();
  }
  return [];
};

export const getNativeHotspotStatus = async (): Promise<HotspotStatus> => {
  if (nativeModule?.getHotspotStatus) {
    return nativeModule.getHotspotStatus();
  }
  return {
    enabled: false,
    connectedDeviceCount: 0,
    sessionStartedAt: null,
    lastRefreshedAt: Date.now(),
  };
};

export const nativeBlockDevice = async (
  deviceId: string,
): Promise<ControlAttemptResult> => {
  if (nativeModule?.blockDevice) {
    return nativeModule.blockDevice(deviceId);
  }
  return {
    supported: false,
    applied: false,
    message: `Block is unavailable for ${deviceId}.`,
  };
};

export const nativeUnblockDevice = async (
  deviceId: string,
): Promise<ControlAttemptResult> => {
  if (nativeModule?.unblockDevice) {
    return nativeModule.unblockDevice(deviceId);
  }
  return {
    supported: false,
    applied: false,
    message: `Unblock is unavailable for ${deviceId}.`,
  };
};

export const nativeSetHotspotEnabled = async (
  enabled: boolean,
): Promise<ControlAttemptResult> => {
  if (nativeModule?.setHotspotEnabled) {
    return nativeModule.setHotspotEnabled(enabled);
  }
  return {
    supported: false,
    applied: false,
    message: enabled
      ? 'Hotspot start is unavailable in compatibility mode.'
      : 'Hotspot stop is unavailable in compatibility mode.',
  };
};

export const openNetworkSettings = async (): Promise<boolean> =>
  (await nativeModule?.openNetworkSettings?.()) ?? false;
