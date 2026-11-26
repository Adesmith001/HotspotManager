import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  ActivityEvent,
  CapabilityState,
  DataLimit,
  HotspotTimer,
} from '../types/domain';
import { formatBytes } from '../utils/format';
import { getRemainingSeconds } from '../services/timerService';

interface DashboardScreenProps {
  capability: CapabilityState;
  premiumActive: boolean;
  globalUsageBytes: number;
  globalLimit: DataLimit;
  timer: HotspotTimer | null;
  nowMs: number;
  activity: ActivityEvent[];
  onStartTimer: (durationMinutes: number) => void;
  onStopTimer: () => void;
  onOpenSettings: () => void;
  onLogUsage: () => void;
  onUpgradePress: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  capability,
  premiumActive,
  globalUsageBytes,
  globalLimit,
  timer,
  nowMs,
  activity,
  onStartTimer,
  onStopTimer,
  onOpenSettings,
  onLogUsage,
  onUpgradePress,
}) => {
  const remainingSeconds = useMemo(() => {
    if (!timer?.active) {
      return 0;
    }
    return getRemainingSeconds(timer.endsAt, nowMs);
  }, [nowMs, timer]);

  const recent = activity.slice(0, 4);

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Hotspot control center</Text>
        <Text style={styles.heroSubtitle}>
          Tier {capability.tier} â€¢ {premiumActive ? 'Pro' : 'Free'}
        </Text>
        <Text style={styles.heroText}>
          Manage hotspot access in system settings.
        </Text>
        <View style={styles.heroRow}>
          <Pressable onPress={onOpenSettings} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Hotspot settings</Text>
          </Pressable>
          <Pressable onPress={onLogUsage} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Log data usage</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Usage and budget</Text>
        <Text style={styles.body}>
          {formatBytes(globalUsageBytes)} used of{' '}
          {formatBytes(globalLimit.byteLimit)}
        </Text>
        <Text style={styles.caption}>
          Warning threshold: {globalLimit.warningThresholdPct}% â€¢ Period:{' '}
          {globalLimit.periodType}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Timer</Text>
        <Text style={styles.body}>
          {timer?.active
            ? `${remainingSeconds}s remaining`
            : 'Set a reminder to turn off your hotspot. Reminders appear while using the app or when you return.'}
        </Text>
        <View style={styles.heroRow}>
          {[1, 30, 60, 120].map(minutes => (
            <Pressable
              key={minutes}
              onPress={() => onStartTimer(minutes)}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>{minutes} min</Text>
            </Pressable>
          ))}
          {timer?.active ? (
            <Pressable onPress={onStopTimer} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Stop timer</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Recent activity</Text>
        {recent.length === 0 ? (
          <Text style={styles.caption}>No device or policy activity yet.</Text>
        ) : (
          recent.map(event => (
            <View key={event.id} style={styles.activityRow}>
              <Text style={styles.activityTitle}>{event.title}</Text>
              <Text style={styles.caption}>{event.details}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Capability diagnostics</Text>
        {capability.diagnostics.map(message => (
          <Text key={message} style={styles.caption}>
            â€¢ {message}
          </Text>
        ))}
        {!premiumActive ? (
          <Pressable onPress={onUpgradePress} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>See Pro automation</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  hero: {
    borderRadius: 20,
    padding: 18,
    backgroundColor: '#12264f',
    gap: 6,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
  },
  heroSubtitle: {
    color: '#b5c5f4',
    fontWeight: '700',
  },
  heroText: {
    color: '#dbe4ff',
  },
  heroRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 6,
  },
  primaryButton: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  primaryButtonText: {
    color: '#12264f',
    fontWeight: '800',
  },
  secondaryButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#c7d2ff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#eef2ff',
  },
  secondaryButtonText: {
    color: '#2b56ce',
    fontWeight: '800',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dce1f1',
    backgroundColor: '#ffffff',
    padding: 14,
    gap: 8,
  },
  title: {
    color: '#20253a',
    fontWeight: '800',
  },
  body: {
    color: '#3d4563',
  },
  caption: {
    color: '#65708f',
  },
  activityRow: {
    borderTopWidth: 1,
    borderTopColor: '#eef1fb',
    paddingTop: 8,
  },
  activityTitle: {
    fontWeight: '700',
    color: '#2a314d',
  },
});
