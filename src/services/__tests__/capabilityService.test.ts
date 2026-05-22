import {determineCapabilityTier} from '../capabilityService';

describe('determineCapabilityTier', () => {
  it('returns Tier C on iOS compatibility mode', () => {
    const tier = determineCapabilityTier('ios', {
      canToggleHotspot: false,
      canListClients: false,
      canBlockClients: false,
      canRunBackgroundAutomation: false,
      canSendLocalNotifications: true,
      canEstimateUsage: true,
      diagnostics: [],
    });
    expect(tier).toBe('C');
  });

  it('returns Tier A when all controls are available', () => {
    const tier = determineCapabilityTier('android', {
      canToggleHotspot: true,
      canListClients: true,
      canBlockClients: true,
      canRunBackgroundAutomation: true,
      canSendLocalNotifications: true,
      canEstimateUsage: true,
      diagnostics: [],
    });
    expect(tier).toBe('A');
  });
});
