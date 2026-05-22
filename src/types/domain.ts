import {CapabilityTier} from './capabilities';

export interface ConnectedDevice {
  id: string;
  displayName: string;
  nickname?: string;
  vendor?: string;
  ipAddress?: string;
  macAddress?: string;
  blocked: boolean;
  trusted: boolean;
  policyStatus: 'normal' | 'warning' | 'blocked' | 'trusted-bypass';
  firstSeenAt: number;
  lastSeenAt: number;
  connectionCount: number;
}

export interface DataLimit {
  periodType: 'daily' | 'weekly' | 'monthly';
  byteLimit: number;
  warningThresholdPct: number;
  hardStopEnabled: boolean;
}

export interface HotspotTimer {
  startedAt: number;
  durationSeconds: number;
  endsAt: number;
  active: boolean;
  presetLabel?: string;
}

export interface HotspotStatus {
  enabled: boolean;
  connectedDeviceCount: number;
  sessionStartedAt: number | null;
  lastRefreshedAt: number;
}

export interface ScheduleRule {
  id: string;
  scope: 'global' | 'device';
  name?: string;
  deviceId?: string;
  dayOfWeek: number;
  daysOfWeek?: number[];
  startHour: number;
  endHour: number;
  cap: number;
  enabled?: boolean;
  reaction?: 'warn' | 'block' | 'notify';
}

export interface DevicePlan {
  id: string;
  deviceId: string;
  planName: string;
  byteCap: number;
  overageAction: 'warn' | 'block';
  scheduleRuleId?: string;
  renewalDay?: number;
  warningThresholdPct?: number;
}

export interface UsageRecord {
  id: string;
  deviceId: string;
  timestamp: number;
  bytesUsed: number;
}

export interface UsageSnapshot {
  id: string;
  deviceId: string;
  timestamp: number;
  bytesUsed: number;
  periodKey: string;
  source: 'native' | 'estimated' | 'manual';
}

export interface ActivityEvent {
  id: string;
  type:
    | 'deviceJoined'
    | 'deviceBlocked'
    | 'deviceUnblocked'
    | 'timerStarted'
    | 'timerStopped'
    | 'timerExpired'
    | 'limitWarning'
    | 'limitExceeded'
    | 'policyApplied'
    | 'recommendation'
    | 'system';
  title: string;
  details: string;
  timestamp: number;
  severity: 'info' | 'warning' | 'critical';
  deviceId?: string;
}

export interface DevicePolicy {
  id: string;
  name: string;
  scope: 'global' | 'device';
  deviceId?: string;
  enabled: boolean;
  byteCap: number | null;
  warningThresholdPct: number;
  overageAction: 'warn' | 'block' | 'notify';
  allowTrustedBypass: boolean;
  fallbackBehavior: 'notify_only' | 'preserve_state';
  scheduleRuleId?: string;
}

export interface AutomationProfile {
  id: string;
  name: string;
  kind: 'bedtime' | 'workday' | 'unknownDevice' | 'lowBattery';
  enabled: boolean;
  triggerDescription: string;
  reaction: 'notify' | 'block' | 'stopHotspot';
}

export interface AppSettings {
  notificationsEnabled: boolean;
  autoRefreshSeconds: number;
  showApproximateUsage: boolean;
  backupUpdatedAt: number | null;
}

export interface CapabilityState {
  tier: CapabilityTier;
  canToggleHotspot: boolean;
  canListClients: boolean;
  canBlockClients: boolean;
  canRunBackgroundAutomation: boolean;
  canSendLocalNotifications: boolean;
  canEstimateUsage: boolean;
  diagnostics: string[];
}

export interface ControlAttemptResult {
  supported: boolean;
  applied: boolean;
  message: string;
}
