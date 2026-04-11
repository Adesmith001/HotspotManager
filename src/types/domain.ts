import {CapabilityTier} from './capabilities';

export interface ConnectedDevice {
  id: string;
  displayName: string;
  ipAddress?: string;
  macAddress?: string;
  blocked: boolean;
  lastSeenAt: number;
}

export interface DataLimit {
  periodType: 'daily' | 'monthly';
  byteLimit: number;
}

export interface HotspotTimer {
  startedAt: number;
  durationSeconds: number;
  endsAt: number;
  active: boolean;
}

export interface ScheduleRule {
  id: string;
  scope: 'global' | 'device';
  deviceId?: string;
  dayOfWeek: number;
  startHour: number;
  endHour: number;
  cap: number;
}

export interface DevicePlan {
  id: string;
  deviceId: string;
  planName: string;
  byteCap: number;
  overageAction: 'warn' | 'block';
  scheduleRuleId?: string;
}

export interface UsageRecord {
  id: string;
  deviceId: string;
  timestamp: number;
  bytesUsed: number;
}

export interface CapabilityState {
  tier: CapabilityTier;
  canToggleHotspot: boolean;
  canListClients: boolean;
  canBlockClients: boolean;
}
