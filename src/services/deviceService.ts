import {
  getNativeConnectedDevices,
  nativeBlockDevice,
  nativeUnblockDevice,
} from '../native/hotspotNative';
import {ConnectedDevice, ControlAttemptResult} from '../types/domain';

const mockDevices: ConnectedDevice[] = [
  {
    id: '00:11:22:33:AA:01',
    displayName: 'Phone - Ada',
    nickname: 'Ada Phone',
    vendor: 'Google',
    ipAddress: '192.168.43.20',
    macAddress: '00:11:22:33:AA:01',
    blocked: false,
    trusted: true,
    policyStatus: 'normal',
    firstSeenAt: Date.now() - 86400000,
    lastSeenAt: Date.now(),
    connectionCount: 8,
  },
  {
    id: '00:11:22:33:AA:02',
    displayName: 'Laptop - Tobi',
    nickname: 'Work Laptop',
    vendor: 'Lenovo',
    ipAddress: '192.168.43.21',
    macAddress: '00:11:22:33:AA:02',
    blocked: false,
    trusted: false,
    policyStatus: 'normal',
    firstSeenAt: Date.now() - 5400000,
    lastSeenAt: Date.now(),
    connectionCount: 3,
  },
];

export const loadConnectedDevices = async (): Promise<ConnectedDevice[]> => {
  const nativeDevices = await getNativeConnectedDevices();
  if (nativeDevices.length > 0) {
    return nativeDevices;
  }
  return mockDevices;
};

export const blockDevice = async (
  device: ConnectedDevice,
): Promise<{device: ConnectedDevice; result: ControlAttemptResult}> => {
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
): Promise<{device: ConnectedDevice; result: ControlAttemptResult}> => {
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
