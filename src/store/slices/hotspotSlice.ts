import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  ActivityEvent,
  AppSettings,
  AutomationProfile,
  CapabilityState,
  ConnectedDevice,
  DataLimit,
  DevicePolicy,
  HotspotStatus,
  HotspotTimer,
  ScheduleRule,
  UsageSnapshot,
} from '../../types/domain';
import {
  defaultGlobalLimit,
  defaultHotspotStatus,
} from '../../services/appStateService';

interface HotspotState {
  capability: CapabilityState;
  hotspotStatus: HotspotStatus;
  devices: ConnectedDevice[];
  globalLimit: DataLimit;
  timer: HotspotTimer | null;
  activity: ActivityEvent[];
  policies: DevicePolicy[];
  automationProfiles: AutomationProfile[];
  schedules: ScheduleRule[];
  usageSnapshots: UsageSnapshot[];
  settings: AppSettings;
}

const initialState: HotspotState = {
  capability: {
    tier: 'C',
    canToggleHotspot: false,
    canListClients: false,
    canBlockClients: false,
    canRunBackgroundAutomation: false,
    canSendLocalNotifications: false,
    canEstimateUsage: false,
    diagnostics: [],
  },
  hotspotStatus: defaultHotspotStatus,
  devices: [],
  globalLimit: defaultGlobalLimit,
  timer: null,
  activity: [],
  policies: [],
  automationProfiles: [],
  schedules: [],
  usageSnapshots: [],
  settings: {
    notificationsEnabled: true,
    autoRefreshSeconds: 15,
    showApproximateUsage: true,
    backupUpdatedAt: null,
  },
};

const hotspotSlice = createSlice({
  name: 'hotspot',
  initialState,
  reducers: {
    setCapability(state, action: PayloadAction<CapabilityState>) {
      state.capability = action.payload;
    },
    setHotspotStatus(state, action: PayloadAction<HotspotStatus>) {
      state.hotspotStatus = action.payload;
    },
    hydrateHotspotState(
      state,
      action: PayloadAction<
        Omit<HotspotState, 'capability'> & {
          capability?: CapabilityState;
        }
      >,
    ) {
      state.hotspotStatus = action.payload.hotspotStatus;
      state.devices = action.payload.devices;
      state.globalLimit = action.payload.globalLimit;
      state.timer = action.payload.timer;
      state.activity = action.payload.activity;
      state.policies = action.payload.policies;
      state.automationProfiles = action.payload.automationProfiles;
      state.schedules = action.payload.schedules;
      state.usageSnapshots = action.payload.usageSnapshots;
      state.settings = action.payload.settings;
      if (action.payload.capability) {
        state.capability = action.payload.capability;
      }
    },
    setDevices(state, action: PayloadAction<ConnectedDevice[]>) {
      state.devices = action.payload;
    },
    upsertDevice(state, action: PayloadAction<ConnectedDevice>) {
      const existing = state.devices.findIndex(
        device => device.id === action.payload.id,
      );
      if (existing >= 0) {
        state.devices[existing] = action.payload;
      } else {
        state.devices.push(action.payload);
      }
    },
    setSchedules(state, action: PayloadAction<ScheduleRule[]>) {
      state.schedules = action.payload;
    },
    setGlobalLimit(state, action: PayloadAction<DataLimit>) {
      state.globalLimit = action.payload;
    },
    setTimer(state, action: PayloadAction<HotspotTimer | null>) {
      state.timer = action.payload;
    },
    setActivity(state, action: PayloadAction<ActivityEvent[]>) {
      state.activity = action.payload;
    },
    addActivity(state, action: PayloadAction<ActivityEvent>) {
      state.activity = [action.payload, ...state.activity].sort(
        (left, right) => right.timestamp - left.timestamp,
      );
    },
    setPolicies(state, action: PayloadAction<DevicePolicy[]>) {
      state.policies = action.payload;
    },
    upsertPolicy(state, action: PayloadAction<DevicePolicy>) {
      const existing = state.policies.findIndex(
        policy => policy.id === action.payload.id,
      );
      if (existing >= 0) {
        state.policies[existing] = action.payload;
      } else {
        state.policies.push(action.payload);
      }
    },
    setAutomationProfiles(state, action: PayloadAction<AutomationProfile[]>) {
      state.automationProfiles = action.payload;
    },
    upsertAutomationProfile(state, action: PayloadAction<AutomationProfile>) {
      const existing = state.automationProfiles.findIndex(
        profile => profile.id === action.payload.id,
      );
      if (existing >= 0) {
        state.automationProfiles[existing] = action.payload;
      } else {
        state.automationProfiles.push(action.payload);
      }
    },
    setUsageSnapshots(state, action: PayloadAction<UsageSnapshot[]>) {
      state.usageSnapshots = action.payload;
    },
    addUsageSnapshot(state, action: PayloadAction<UsageSnapshot>) {
      state.usageSnapshots.push(action.payload);
    },
    setSettings(state, action: PayloadAction<AppSettings>) {
      state.settings = action.payload;
    },
  },
});

export const {
  setCapability,
  setHotspotStatus,
  hydrateHotspotState,
  setDevices,
  upsertDevice,
  setGlobalLimit,
  setSchedules,
  setTimer,
  setActivity,
  addActivity,
  setPolicies,
  upsertPolicy,
  setAutomationProfiles,
  upsertAutomationProfile,
  setUsageSnapshots,
  addUsageSnapshot,
  setSettings,
} = hotspotSlice.actions;

export default hotspotSlice.reducer;
