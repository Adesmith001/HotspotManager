import {Platform} from 'react-native';

import {getNativeCapabilities} from '../native/hotspotNative';
import {CapabilityTier, NativeCapabilitySnapshot} from '../types/capabilities';
import {CapabilityState} from '../types/domain';

export const determineCapabilityTier = (
  platform: 'android' | 'ios' = Platform.OS as 'android' | 'ios',
  snapshot: NativeCapabilitySnapshot,
): CapabilityTier => {
  if (platform === 'ios') {
    return 'C';
  }
  if (
    snapshot.canToggleHotspot &&
    snapshot.canListClients &&
    snapshot.canBlockClients
  ) {
    return 'A';
  }
  if (snapshot.canToggleHotspot || snapshot.canListClients) {
    return 'B';
  }
  return 'C';
};

export const loadCapabilityState = async (): Promise<CapabilityState> => {
  const snapshot = await getNativeCapabilities();
  return {
    tier: determineCapabilityTier(Platform.OS as 'android' | 'ios', snapshot),
    canToggleHotspot: snapshot.canToggleHotspot,
    canListClients: snapshot.canListClients,
    canBlockClients: snapshot.canBlockClients,
    canRunBackgroundAutomation: snapshot.canRunBackgroundAutomation,
    canSendLocalNotifications: snapshot.canSendLocalNotifications,
    canEstimateUsage: snapshot.canEstimateUsage,
    diagnostics: snapshot.diagnostics,
  };
};
