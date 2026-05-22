export type CapabilityTier = 'A' | 'B' | 'C';

export interface NativeCapabilitySnapshot {
  canToggleHotspot: boolean;
  canListClients: boolean;
  canBlockClients: boolean;
  canRunBackgroundAutomation: boolean;
  canSendLocalNotifications: boolean;
  canEstimateUsage: boolean;
  diagnostics: string[];
}
