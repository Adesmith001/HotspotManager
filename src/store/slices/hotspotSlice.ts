import {createSlice, PayloadAction} from '@reduxjs/toolkit';

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
  globalUsageBytes: number;
  timer: HotspotTimer | null;
  activity: ActivityEvent[];
  policies: DevicePolicy[];
  automationProfiles: AutomationProfile[];
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
    canSendLocalNotifications: true,
    canEstimateUsage: true,
    diagnostics: [],
  },
  hotspotStatus: defaultHotspotStatus,
  devices: [],
  globalLimit: defaultGlobalLimit,
  globalUsageBytes: 0,
  timer: null,
  activity: [],
  policies: [],
  automationProfiles: [],
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
        Omit<HotspotState, 'capability' | 'globalUsageBytes'> & {
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
      state.usageSnapshots = action.payload.usageSnapshots;
      state.settings = action.payload.settings;
      state.globalUsageBytes = action.payload.usageSnapshots.reduce(
        (sum, snapshot) => sum + snapshot.bytesUsed,
        0,
      );
      if (action.payload.capability) {
        state.capability = action.payload.capability;
      }
    },
    setDevices(state, action: PayloadAction<ConnectedDevice[]>) {
      state.devices = action.payload;
      state.hotspotStatus.connectedDeviceCount = action.payload.length;
    },
    upsertDevice(state, action: PayloadAction<ConnectedDevice>) {
      const existing = state.devices.findIndex(device => device.id === action.payload.id);
      if (existing >= 0) {
        state.devices[existing] = action.payload;
      } else {
        state.devices.push(action.payload);
      }
      state.hotspotStatus.connectedDeviceCount = state.devices.length;
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
      const existing = state.policies.findIndex(policy => policy.id === action.payload.id);
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
      state.globalUsageBytes = action.payload.reduce(
        (sum, snapshot) => sum + snapshot.bytesUsed,
        0,
      );
    },
    addUsageSnapshot(state, action: PayloadAction<UsageSnapshot>) {
      state.usageSnapshots.push(action.payload);
      state.globalUsageBytes += action.payload.bytesUsed;
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
