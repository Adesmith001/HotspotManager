import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { PremiumGate } from '../components/PremiumGate';
import { InsightsSummary } from '../services/insightsService';
import {
  ActivityEvent,
  AutomationProfile,
  CapabilityState,
  ConnectedDevice,
  DataLimit,
  DevicePolicy,
  HotspotTimer,
  ScheduleRule,
} from '../types/domain';
import { appStyles } from '../theme';
import { AutomationsScreen } from '../screens/AutomationsScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { DevicesScreen } from '../screens/DevicesScreen';
import { InsightsScreen } from '../screens/InsightsScreen';
import { LimitsScreen } from '../screens/LimitsScreen';

export type AppScreenKey =
  | 'dashboard'
  | 'devices'
  | 'limits'
  | 'automations'
  | 'insights';

interface AppNavigatorProps {
  activeScreen: AppScreenKey;
  setActiveScreen: (key: AppScreenKey) => void;
  capability: CapabilityState;
  premiumActive: boolean;
  globalUsageBytes: number;
  globalLimit: DataLimit;
  devices: ConnectedDevice[];
  timer: HotspotTimer | null;
  activity: ActivityEvent[];
  policies: DevicePolicy[];
  automationProfiles: AutomationProfile[];
  insightsSummary: InsightsSummary;
  schedules: ScheduleRule[];
  getUsageCsv: () => string;
  getBackupPayload: () => string;
  busy: boolean;
  nowMs: number;
  onOpenSettings: () => void;
  onAddDevice: (name: string) => Promise<boolean>;
  onLogUsage: (device: ConnectedDevice, bytes: number) => Promise<boolean>;
  onToggleDeviceBlock: (device: ConnectedDevice) => void;
  onRenameDevice: (device: ConnectedDevice, nickname: string) => void;
  onToggleTrusted: (device: ConnectedDevice) => void;
  onUpdateGlobalLimit: (limit: DataLimit) => void;
  onStartTimer: (durationMinutes: number) => void;
  onStopTimer: () => void;
  onSavePolicy: (policy: DevicePolicy) => void;
  onSaveSchedules: (schedules: ScheduleRule[]) => void;
  onToggleAutomationProfile: (profile: AutomationProfile) => void;
  onUpgradePress: () => void;
  onRestorePress: () => void;
}

const tabs: { label: string; key: AppScreenKey; premium?: boolean }[] = [
  { label: 'Dashboard', key: 'dashboard' },
  { label: 'Devices', key: 'devices' },
  { label: 'Limits', key: 'limits' },
  { label: 'Automations', key: 'automations', premium: true },
  { label: 'Insights', key: 'insights', premium: true },
];

export const AppNavigator: React.FC<AppNavigatorProps> = props => {
  const renderScreen = () => {
    switch (props.activeScreen) {
      case 'dashboard':
        return (
          <DashboardScreen
            capability={props.capability}
            premiumActive={props.premiumActive}
            globalUsageBytes={props.globalUsageBytes}
            globalLimit={props.globalLimit}
            timer={props.timer}
            nowMs={props.nowMs}
            activity={props.activity}
            onStartTimer={props.onStartTimer}
            onStopTimer={props.onStopTimer}
            onOpenSettings={props.onOpenSettings}
            onLogUsage={() => props.setActiveScreen('devices')}
            onUpgradePress={props.onUpgradePress}
          />
        );
      case 'devices':
        return (
          <DevicesScreen
            devices={props.devices}
            canBlockClients={props.capability.canBlockClients}
            busy={props.busy}
            onAddDevice={props.onAddDevice}
            onLogUsage={props.onLogUsage}
            onToggleBlock={props.onToggleDeviceBlock}
            onRenameDevice={props.onRenameDevice}
            onToggleTrusted={props.onToggleTrusted}
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
      case 'automations':
        return (
          <PremiumGate
            premium={props.premiumActive}
            onUpgrade={props.onUpgradePress}
            onRestore={props.onRestorePress}
            busy={props.busy}
          >
            <AutomationsScreen
              devices={props.devices}
              policies={props.policies}
              automationProfiles={props.automationProfiles}
              schedules={props.schedules}
              busy={props.busy}
              onSavePolicy={props.onSavePolicy}
              onSaveSchedules={props.onSaveSchedules}
              onToggleAutomationProfile={props.onToggleAutomationProfile}
            />
          </PremiumGate>
        );
      case 'insights':
        return (
          <PremiumGate
            premium={props.premiumActive}
            onUpgrade={props.onUpgradePress}
            onRestore={props.onRestorePress}
            busy={props.busy}
          >
            <InsightsScreen
              summary={props.insightsSummary}
              getUsageCsv={props.getUsageCsv}
              getBackupPayload={props.getBackupPayload}
            />
          </PremiumGate>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView
      edges={['top', 'bottom', 'left', 'right']}
      style={appStyles.screen}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Hotspot Manager</Text>
      </View>
      <ScrollView
        horizontal
        style={styles.tabScroll}
        contentContainerStyle={styles.tabRow}
        showsHorizontalScrollIndicator={false}
      >
        {tabs.map(tab => {
          const locked = tab.premium && !props.premiumActive;
          const active = tab.key === props.activeScreen;
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => props.setActiveScreen(tab.key)}
              style={[
                styles.tab,
                active ? styles.tabActive : undefined,
                locked ? styles.tabLocked : undefined,
              ]}
            >
              <Text style={active ? styles.tabTextActive : styles.tabText}>
                {tab.label}
                {locked ? ' Pro' : ''}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <ScrollView
        key={props.activeScreen}
        contentContainerStyle={appStyles.content}
        keyboardShouldPersistTaps="handled"
      >
        {renderScreen()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: '#101b35',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
  },
  tabScroll: {
    maxHeight: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#d5dbef',
    backgroundColor: '#eef2fb',
  },
  tabRow: {
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tab: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cbd5ff',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tabActive: {
    backgroundColor: '#1a58d9',
    borderColor: '#1a58d9',
  },
  tabLocked: {
    opacity: 0.8,
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
