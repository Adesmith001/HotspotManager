import {
  getNativeConnectedDevices,
  nativeBlockDevice,
  nativeUnblockDevice,
} from '../native/hotspotNative';
import {ConnectedDevice} from '../types/domain';

const mockDevices: ConnectedDevice[] = [
  {
    id: '00:11:22:33:AA:01',
    displayName: 'Phone - Ada',
    ipAddress: '192.168.43.20',
    blocked: false,
    lastSeenAt: Date.now(),
  },
  {
    id: '00:11:22:33:AA:02',
    displayName: 'Laptop - Tobi',
    ipAddress: '192.168.43.21',
    blocked: false,
    lastSeenAt: Date.now(),
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
): Promise<ConnectedDevice> => {
  const success = await nativeBlockDevice(device.id);
  if (success) {
    return {...device, blocked: true};
  }
  return {...device, blocked: true};
};

export const unblockDevice = async (
  device: ConnectedDevice,
): Promise<ConnectedDevice> => {
  const success = await nativeUnblockDevice(device.id);
  if (success) {
    return {...device, blocked: false};
  }
  return {...device, blocked: false};
};
