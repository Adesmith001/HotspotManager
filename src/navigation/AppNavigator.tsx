import React from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';

import {PremiumGate} from '../components/PremiumGate';
import {DeviceUsageReport} from '../services/reportService';
import {CapabilityState, ConnectedDevice, DataLimit, DevicePlan, HotspotTimer, ScheduleRule} from '../types/domain';
import {appStyles} from '../theme';
import {DevicesScreen} from '../screens/DevicesScreen';
import {LimitsScreen} from '../screens/LimitsScreen';
import {OverviewScreen} from '../screens/OverviewScreen';
import {PlansScreen} from '../screens/PlansScreen';
import {ReportsScreen} from '../screens/ReportsScreen';
import {SchedulesScreen} from '../screens/SchedulesScreen';
import {TimerScreen} from '../screens/TimerScreen';

export type AppScreenKey =
  | 'overview'
  | 'devices'
  | 'limits'
  | 'timer'
  | 'schedules'
  | 'reports'
  | 'plans';

interface AppNavigatorProps {
  activeScreen: AppScreenKey;
  setActiveScreen: (key: AppScreenKey) => void;
  capability: CapabilityState;
  premiumActive: boolean;
  globalUsageBytes: number;
  globalLimit: DataLimit;
  devices: ConnectedDevice[];
  timer: HotspotTimer | null;
  schedules: ScheduleRule[];
  plans: DevicePlan[];
  reports: DeviceUsageReport[];
  nowMs: number;
  onToggleDeviceBlock: (device: ConnectedDevice) => void;
  onUpdateGlobalLimit: (limit: DataLimit) => void;
  onStartTimer: (durationMinutes: number) => void;
  onStopTimer: () => void;
  onAddSchedule: () => void;
  onAddPlan: (deviceId: string) => void;
  onUpgradePress: () => void;
}

const tabs: {label: string; key: AppScreenKey; premium?: boolean}[] = [
  {label: 'Overview', key: 'overview'},
  {label: 'Devices', key: 'devices'},
  {label: 'Limits', key: 'limits'},
  {label: 'Timer', key: 'timer'},
  {label: 'Schedule', key: 'schedules', premium: true},
  {label: 'Reports', key: 'reports', premium: true},
  {label: 'Plans', key: 'plans', premium: true},
];

export const AppNavigator: React.FC<AppNavigatorProps> = props => {
  const renderScreen = () => {
    switch (props.activeScreen) {
      case 'overview':
        return (
          <OverviewScreen
            capability={props.capability}
            premiumActive={props.premiumActive}
            globalUsageBytes={props.globalUsageBytes}
            globalLimit={props.globalLimit}
          />
        );
      case 'devices':
        return (
          <DevicesScreen
            devices={props.devices}
            canBlockClients={props.capability.canBlockClients}
            onToggleBlock={props.onToggleDeviceBlock}
          />
        );
      case 'limits':
        return (
          <LimitsScreen
            limit={props.globalLimit}
            globalUsageBytes={props.globalUsageBytes}
            onUpdateLimit={props.onUpdateGlobalLimit}
          />
        );
      case 'timer':
        return (
          <TimerScreen
            timer={props.timer}
            nowMs={props.nowMs}
            onStart={props.onStartTimer}
            onStop={props.onStopTimer}
          />
        );
      case 'schedules':
        return (
          <PremiumGate
            premium={props.premiumActive}
            onUpgrade={props.onUpgradePress}>
            <SchedulesScreen
              schedules={props.schedules}
              onAddSchedule={props.onAddSchedule}
            />
          </PremiumGate>
        );
      case 'reports':
        return (
          <PremiumGate
            premium={props.premiumActive}
            onUpgrade={props.onUpgradePress}>
            <ReportsScreen reports={props.reports} />
          </PremiumGate>
        );
      case 'plans':
        return (
          <PremiumGate
            premium={props.premiumActive}
            onUpgrade={props.onUpgradePress}>
            <PlansScreen
              devices={props.devices}
              plans={props.plans}
              onAddPlan={props.onAddPlan}
            />
          </PremiumGate>
        );
      default:
        return null;
    }
  };

  return (
    <View style={appStyles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Hotspot Manager</Text>
        <Text style={styles.subtitle}>Android-first capability-tiered control</Text>
      </View>
      <ScrollView
        horizontal
        style={styles.tabScroll}
        contentContainerStyle={styles.tabRow}
        showsHorizontalScrollIndicator={false}>
        {tabs.map(tab => {
          const locked = tab.premium && !props.premiumActive;
          const active = tab.key === props.activeScreen;
          return (
            <Pressable
              key={tab.key}
              onPress={() => props.setActiveScreen(tab.key)}
              style={[
                styles.tab,
                active ? styles.tabActive : undefined,
                locked ? styles.tabLocked : undefined,
              ]}>
              <Text style={active ? styles.tabTextActive : styles.tabText}>
                {tab.label}
                {locked ? ' *' : ''}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <ScrollView contentContainerStyle={appStyles.content}>{renderScreen()}</ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#101b35',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
  },
  subtitle: {
    color: '#bcd0ff',
  },
  tabScroll: {
    maxHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: '#d5dbef',
    backgroundColor: '#f2f5ff',
  },
  tabRow: {
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tab: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cbd5ff',
    backgroundColor: '#e8eeff',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tabActive: {
    backgroundColor: '#1a58d9',
    borderColor: '#1a58d9',
  },
  tabLocked: {
    opacity: 0.7,
  },
  tabText: {
    color: '#2f427f',
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
