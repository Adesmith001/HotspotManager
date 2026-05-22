import React from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';

import {PremiumGate} from '../components/PremiumGate';
import {InsightsSummary} from '../services/insightsService';
import {
  ActivityEvent,
  AutomationProfile,
  CapabilityState,
  ConnectedDevice,
  DataLimit,
  DevicePolicy,
  HotspotStatus,
  HotspotTimer,
} from '../types/domain';
import {appStyles} from '../theme';
import {AutomationsScreen} from '../screens/AutomationsScreen';
import {DashboardScreen} from '../screens/DashboardScreen';
import {DevicesScreen} from '../screens/DevicesScreen';
import {InsightsScreen} from '../screens/InsightsScreen';
import {LimitsScreen} from '../screens/LimitsScreen';

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
  hotspotStatus: HotspotStatus;
  globalUsageBytes: number;
  globalLimit: DataLimit;
  devices: ConnectedDevice[];
  timer: HotspotTimer | null;
  activity: ActivityEvent[];
  policies: DevicePolicy[];
  automationProfiles: AutomationProfile[];
  insightsSummary: InsightsSummary;
  usageCsv: string;
  backupPayload: string;
  nowMs: number;
  onToggleHotspot: (enabled: boolean) => void;
  onCaptureUsage: () => void;
  onToggleDeviceBlock: (device: ConnectedDevice) => void;
  onRenameDevice: (device: ConnectedDevice, nickname: string) => void;
  onToggleTrusted: (device: ConnectedDevice) => void;
  onUpdateGlobalLimit: (limit: DataLimit) => void;
  onStartTimer: (durationMinutes: number) => void;
  onStopTimer: () => void;
  onAddPolicy: (deviceId?: string) => void;
  onToggleAutomationProfile: (profile: AutomationProfile) => void;
  onUpgradePress: () => void;
}

const tabs: {label: string; key: AppScreenKey; premium?: boolean}[] = [
  {label: 'Dashboard', key: 'dashboard'},
  {label: 'Devices', key: 'devices'},
  {label: 'Limits', key: 'limits'},
  {label: 'Automations', key: 'automations', premium: true},
  {label: 'Insights', key: 'insights', premium: true},
];

export const AppNavigator: React.FC<AppNavigatorProps> = props => {
  const renderScreen = () => {
    switch (props.activeScreen) {
      case 'dashboard':
        return (
          <DashboardScreen
            capability={props.capability}
            premiumActive={props.premiumActive}
            hotspotStatus={props.hotspotStatus}
            globalUsageBytes={props.globalUsageBytes}
            globalLimit={props.globalLimit}
            timer={props.timer}
            nowMs={props.nowMs}
            activity={props.activity}
            onStartTimer={props.onStartTimer}
            onStopTimer={props.onStopTimer}
            onToggleHotspot={props.onToggleHotspot}
            onCaptureUsage={props.onCaptureUsage}
            onUpgradePress={props.onUpgradePress}
          />
        );
      case 'devices':
        return (
          <DevicesScreen
            devices={props.devices}
            canBlockClients={props.capability.canBlockClients}
            onToggleBlock={props.onToggleDeviceBlock}
            onRenameDevice={props.onRenameDevice}
            onToggleTrusted={props.onToggleTrusted}
          />
        );
      case 'limits':
        return (
          <LimitsScreen
            limit={props.globalLimit}
            hotspotStatus={props.hotspotStatus}
            globalUsageBytes={props.globalUsageBytes}
            onUpdateLimit={props.onUpdateGlobalLimit}
          />
        );
      case 'automations':
        return (
          <PremiumGate premium={props.premiumActive} onUpgrade={props.onUpgradePress}>
            <AutomationsScreen
              devices={props.devices}
              policies={props.policies}
              automationProfiles={props.automationProfiles}
              onAddPolicy={props.onAddPolicy}
              onToggleAutomationProfile={props.onToggleAutomationProfile}
            />
          </PremiumGate>
        );
      case 'insights':
        return (
          <PremiumGate premium={props.premiumActive} onUpgrade={props.onUpgradePress}>
            <InsightsScreen
              summary={props.insightsSummary}
              usageCsv={props.usageCsv}
              backupPayload={props.backupPayload}
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
        <Text style={styles.subtitle}>
          Android-first control with honest compatibility fallbacks
        </Text>
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
                {locked ? ' Pro' : ''}
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
    paddingBottom: 10,
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
