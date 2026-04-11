import {NativeModules, Platform} from 'react-native';

import {ConnectedDevice} from '../types/domain';
import {NativeCapabilitySnapshot} from '../types/capabilities';

interface HotspotNativeModule {
  getCapabilities?: () => Promise<NativeCapabilitySnapshot>;
  getConnectedDevices?: () => Promise<ConnectedDevice[]>;
  blockDevice?: (deviceId: string) => Promise<boolean>;
  unblockDevice?: (deviceId: string) => Promise<boolean>;
  setHotspotEnabled?: (enabled: boolean) => Promise<boolean>;
}

const nativeModule: HotspotNativeModule | undefined = NativeModules.HotspotManager;

const fallbackCapabilities: NativeCapabilitySnapshot = {
  canToggleHotspot: false,
  canListClients: false,
  canBlockClients: false,
};

export const getNativeCapabilities = async (): Promise<NativeCapabilitySnapshot> => {
  if (nativeModule?.getCapabilities) {
    return nativeModule.getCapabilities();
  }
  if (Platform.OS === 'ios') {
    return fallbackCapabilities;
  }
  return {
    ...fallbackCapabilities,
    canListClients: true,
  };
};

export const getNativeConnectedDevices = async (): Promise<ConnectedDevice[]> => {
  if (nativeModule?.getConnectedDevices) {
    return nativeModule.getConnectedDevices();
  }
  return [];
};

export const nativeBlockDevice = async (deviceId: string): Promise<boolean> => {
  if (nativeModule?.blockDevice) {
    return nativeModule.blockDevice(deviceId);
  }
  return false;
};

export const nativeUnblockDevice = async (deviceId: string): Promise<boolean> => {
  if (nativeModule?.unblockDevice) {
    return nativeModule.unblockDevice(deviceId);
  }
  return false;
};

export const nativeSetHotspotEnabled = async (enabled: boolean): Promise<boolean> => {
  if (nativeModule?.setHotspotEnabled) {
    return nativeModule.setHotspotEnabled(enabled);
  }
  return false;
};
