import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {
  CapabilityState,
  ConnectedDevice,
  DataLimit,
  DevicePlan,
  HotspotTimer,
  ScheduleRule,
  UsageRecord,
} from '../../types/domain';

interface HotspotState {
  capability: CapabilityState;
  devices: ConnectedDevice[];
  globalLimit: DataLimit;
  globalUsageBytes: number;
  timer: HotspotTimer | null;
  schedules: ScheduleRule[];
  devicePlans: DevicePlan[];
  usageRecords: UsageRecord[];
}

const initialState: HotspotState = {
  capability: {
    tier: 'C',
    canToggleHotspot: false,
    canListClients: false,
    canBlockClients: false,
  },
  devices: [],
  globalLimit: {
    periodType: 'daily',
    byteLimit: 2 * 1024 * 1024 * 1024,
  },
  globalUsageBytes: 0,
  timer: null,
  schedules: [],
  devicePlans: [],
  usageRecords: [],
};

const hotspotSlice = createSlice({
  name: 'hotspot',
  initialState,
  reducers: {
    setCapability(state, action: PayloadAction<CapabilityState>) {
      state.capability = action.payload;
    },
    setDevices(state, action: PayloadAction<ConnectedDevice[]>) {
      state.devices = action.payload;
    },
    upsertDevice(state, action: PayloadAction<ConnectedDevice>) {
      const existing = state.devices.findIndex(d => d.id === action.payload.id);
      if (existing >= 0) {
        state.devices[existing] = action.payload;
        return;
      }
      state.devices.push(action.payload);
    },
    setGlobalLimit(state, action: PayloadAction<DataLimit>) {
      state.globalLimit = action.payload;
    },
    setGlobalUsageBytes(state, action: PayloadAction<number>) {
      state.globalUsageBytes = action.payload;
    },
    setTimer(state, action: PayloadAction<HotspotTimer | null>) {
      state.timer = action.payload;
    },
    setSchedules(state, action: PayloadAction<ScheduleRule[]>) {
      state.schedules = action.payload;
    },
    addSchedule(state, action: PayloadAction<ScheduleRule>) {
      state.schedules.push(action.payload);
    },
    setDevicePlans(state, action: PayloadAction<DevicePlan[]>) {
      state.devicePlans = action.payload;
    },
    addDevicePlan(state, action: PayloadAction<DevicePlan>) {
      state.devicePlans.push(action.payload);
    },
    setUsageRecords(state, action: PayloadAction<UsageRecord[]>) {
      state.usageRecords = action.payload;
    },
    addUsageRecord(state, action: PayloadAction<UsageRecord>) {
      state.usageRecords.push(action.payload);
      state.globalUsageBytes += action.payload.bytesUsed;
    },
  },
});

export const {
  setCapability,
  setDevices,
  upsertDevice,
  setGlobalLimit,
  setGlobalUsageBytes,
  setTimer,
  setSchedules,
  addSchedule,
  setDevicePlans,
  addDevicePlan,
  setUsageRecords,
  addUsageRecord,
} = hotspotSlice.actions;

export default hotspotSlice.reducer;
