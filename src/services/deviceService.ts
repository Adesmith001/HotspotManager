import {
  getNativeConnectedDevices,
  nativeBlockDevice,
  nativeUnblockDevice,
} from '../native/hotspotNative';
import { ConnectedDevice, ControlAttemptResult } from '../types/domain';

export const isSampleDevice = (id: string): boolean =>
  id === '00:11:22:33:AA:01' || id === '00:11:22:33:AA:02';

export const loadConnectedDevices = getNativeConnectedDevices;

export const blockDevice = async (
  device: ConnectedDevice,
): Promise<{ device: ConnectedDevice; result: ControlAttemptResult }> => {
  const result = await nativeBlockDevice(device.id);
  return {
    device: {
      ...device,
      blocked: result.applied || device.blocked,
      policyStatus: result.applied ? 'blocked' : 'warning',
    },
    result,
  };
};

export const unblockDevice = async (
  device: ConnectedDevice,
): Promise<{ device: ConnectedDevice; result: ControlAttemptResult }> => {
  const result = await nativeUnblockDevice(device.id);
  return {
    device: {
      ...device,
      blocked: result.applied ? false : device.blocked,
      policyStatus: 'normal',
    },
    result,
  };
};

export const updateDeviceDetails = (
  device: ConnectedDevice,
  updates: Partial<Pick<ConnectedDevice, 'nickname' | 'trusted'>>,
): ConnectedDevice => {
  return {
    ...device,
    ...updates,
  };
};
