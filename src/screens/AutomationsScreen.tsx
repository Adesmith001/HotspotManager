import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { appStyles } from '../theme';
import {
  AutomationProfile,
  ConnectedDevice,
  DevicePolicy,
  ScheduleRule,
} from '../types/domain';
import { formatBytes } from '../utils/format';

interface AutomationsScreenProps {
  devices: ConnectedDevice[];
  policies: DevicePolicy[];
  automationProfiles: AutomationProfile[];
  schedules: ScheduleRule[];
  busy: boolean;
  onSavePolicy: (policy: DevicePolicy) => void;
  onSaveSchedules: (schedules: ScheduleRule[]) => void;
  onToggleAutomationProfile: (profile: AutomationProfile) => void;
}

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const parseCap = (input: string) =>
  Math.round(Number(input.replace(',', '.')) * 1024 ** 2);
const isValidCap = (bytes: number) => Number.isSafeInteger(bytes) && bytes > 0;
const deviceLabel = (device: ConnectedDevice) =>
  device.nickname || device.displayName;

export const AutomationsScreen: React.FC<AutomationsScreenProps> = ({
  devices,
  policies,
  automationProfiles,
  schedules,
  busy,
  onSavePolicy,
  onSaveSchedules,
  onToggleAutomationProfile,
}) => {
  const [deviceId, setDeviceId] = useState<string>();
  const [capInput, setCapInput] = useState('');
  const [scheduleCap, setScheduleCap] = useState('');
  const [scheduleId, setScheduleId] = useState<string>();
  const [day, setDay] = useState(-1);
  const [start, setStart] = useState('18');
  const [end, setEnd] = useState('22');
  const device = devices.find(entry => entry.id === deviceId);
  const policy = policies.find(
    entry => entry.deviceId === deviceId && entry.scope === 'device',
  );

  const selectTarget = (target?: ConnectedDevice) => {
    setDeviceId(target?.id);
    const saved = policies.find(
      entry => entry.deviceId === target?.id && entry.scope === 'device',
    );
    setCapInput(saved?.byteCap ? String(saved.byteCap / 1024 ** 2) : '');
  };

  const saveCap = () => {
    if (!device) {
      return;
    }
    const byteCap = parseCap(capInput);
    if (!isValidCap(byteCap)) {
      Alert.alert('Enter a positive cap in MiB.');
      return;
    }
    onSavePolicy({
      id: policy?.id ?? 'plan-' + device.id,
      name: deviceLabel(device) + ' cap',
      scope: 'device',
      deviceId: device.id,
      enabled: true,
      byteCap,
      warningThresholdPct: policy?.warningThresholdPct ?? 80,
      overageAction: 'warn',
      allowTrustedBypass: policy?.allowTrustedBypass ?? false,
      fallbackBehavior: 'notify_only',
    });
  };

  const saveSchedule = () => {
    const cap = parseCap(scheduleCap);
    const startHour = Number(start);
    const endHour = Number(end);
    if (
      !start.trim() ||
      !end.trim() ||
      !Number.isInteger(startHour) ||
      !Number.isInteger(endHour) ||
      startHour < 0 ||
      endHour > 24 ||
      startHour >= endHour
    ) {
      Alert.alert(
        'Enter a start and end hour between 0 and 24 on the same day.',
      );
      return;
    }
    if (!isValidCap(cap)) {
      Alert.alert('Enter a positive cap in MiB.');
      return;
    }
    const id = scheduleId ?? 'schedule-' + Date.now();
    const next: ScheduleRule = {
      id,
      scope: device ? 'device' : 'global',
      deviceId: device?.id,
      dayOfWeek: day < 0 ? 0 : day,
      daysOfWeek: day < 0 ? days.map((_, index) => index) : undefined,
      startHour,
      endHour,
      cap,
      enabled: true,
      reaction: 'warn',
    };
    const exists = schedules.some(entry => entry.id === id);
    onSaveSchedules(
      exists
        ? schedules.map(entry => (entry.id === id ? next : entry))
        : [...schedules, next],
    );
    setScheduleId(undefined);
    setScheduleCap('');
  };

  const editSchedule = (rule: ScheduleRule) => {
    selectTarget(devices.find(entry => entry.id === rule.deviceId));
    setScheduleId(rule.id);
    setScheduleCap(String(rule.cap / 1024 ** 2));
    setDay(rule.daysOfWeek?.length === 7 ? -1 : rule.dayOfWeek);
    setStart(String(rule.startHour));
    setEnd(String(rule.endHour));
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={appStyles.cardTitle}>Budget applies to</Text>
        <View style={appStyles.chipRow}>
          <Choice
            label="All devices"
            active={!device}
            onPress={() => selectTarget()}
          />
          {devices.map(entry => (
            <Choice
              key={entry.id}
              label={deviceLabel(entry)}
              active={entry.id === deviceId}
              onPress={() => selectTarget(entry)}
            />
          ))}
        </View>
      </View>

      {device ? (
        <View style={styles.card}>
          <Text style={appStyles.cardTitle}>Device data plan</Text>
          <Text style={appStyles.bodyText}>
            Uses the daily, weekly, or monthly period selected in Limits.
          </Text>
          <TextInput
            accessibilityLabel="Device cap in MiB"
            placeholder="Data cap (MiB)"
            placeholderTextColor="#65708f"
            value={capInput}
            onChangeText={setCapInput}
            keyboardType="decimal-pad"
            style={appStyles.input}
          />
          <Pressable disabled={busy} onPress={saveCap} style={appStyles.button}>
            <Text style={appStyles.buttonText}>Save device cap</Text>
          </Pressable>
          {policy?.enabled ? (
            <Pressable
              disabled={busy}
              style={appStyles.subtleButton}
              onPress={() => onSavePolicy({ ...policy, enabled: false })}
            >
              <Text style={appStyles.subtleButtonText}>Disable device cap</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={appStyles.cardTitle}>
          {scheduleId ? 'Edit scheduled budget' : 'Scheduled budget'}
        </Text>
        <Text style={appStyles.bodyText}>
          Budget for {device ? deviceLabel(device) : 'all devices'} during a
          local time window.
        </Text>
        <View style={appStyles.chipRow}>
          {['Daily', ...days].map((label, index) => (
            <Choice
              key={label}
              label={label}
              active={day === index - 1}
              onPress={() => setDay(index - 1)}
            />
          ))}
        </View>
        <Text style={appStyles.bodyText}>
          Start and end hour (24-hour clock)
        </Text>
        <View style={appStyles.chipRow}>
          <TextInput
            accessibilityLabel="Start hour"
            value={start}
            onChangeText={setStart}
            keyboardType="number-pad"
            maxLength={2}
            style={appStyles.input}
          />
          <TextInput
            accessibilityLabel="End hour"
            value={end}
            onChangeText={setEnd}
            keyboardType="number-pad"
            maxLength={2}
            style={appStyles.input}
          />
        </View>
        <TextInput
          accessibilityLabel="Scheduled cap in MiB"
          placeholder="Data cap (MiB)"
          placeholderTextColor="#65708f"
          value={scheduleCap}
          onChangeText={setScheduleCap}
          keyboardType="decimal-pad"
          style={appStyles.input}
        />
        <Pressable
          disabled={busy}
          onPress={saveSchedule}
          style={appStyles.button}
        >
          <Text style={appStyles.buttonText}>Save schedule</Text>
        </Pressable>
        {scheduleId ? (
          <Pressable
            style={appStyles.subtleButton}
            onPress={() => {
              setScheduleId(undefined);
              setScheduleCap('');
            }}
          >
            <Text style={appStyles.subtleButtonText}>Cancel edit</Text>
          </Pressable>
        ) : null}
      </View>

      {schedules.map(rule => {
        const target = devices.find(entry => entry.id === rule.deviceId);
        const dayLabel =
          rule.daysOfWeek?.length === 7 ? 'Daily' : days[rule.dayOfWeek];
        return (
          <View key={rule.id} style={styles.card}>
            <Text style={appStyles.cardTitle}>
              {target ? deviceLabel(target) : 'All devices'}
            </Text>
            <Text style={appStyles.bodyText}>
              {dayLabel} • {rule.startHour}:00–{rule.endHour}:00 •{' '}
              {formatBytes(rule.cap)}
            </Text>
            <View style={appStyles.chipRow}>
              <Pressable
                style={appStyles.subtleButton}
                onPress={() => editSchedule(rule)}
              >
                <Text style={appStyles.subtleButtonText}>Edit</Text>
              </Pressable>
              <Pressable
                disabled={busy}
                style={appStyles.subtleButton}
                onPress={() =>
                  onSaveSchedules(
                    schedules.filter(entry => entry.id !== rule.id),
                  )
                }
              >
                <Text style={appStyles.subtleButtonText}>Remove</Text>
              </Pressable>
            </View>
          </View>
        );
      })}

      <View style={styles.card}>
        <Text style={appStyles.cardTitle}>Activity reminders</Text>
        {automationProfiles
          .filter(
            profile =>
              profile.kind === 'bedtime' || profile.kind === 'unknownDevice',
          )
          .map(profile => (
            <View key={profile.id} style={styles.profile}>
              <Text style={appStyles.bodyText}>
                {profile.kind === 'bedtime'
                  ? 'Bedtime reminder at 11pm'
                  : 'Flag newly tracked devices'}
              </Text>
              <Choice
                label={profile.enabled ? 'On' : 'Off'}
                active={profile.enabled}
                disabled={busy}
                onPress={() => onToggleAutomationProfile(profile)}
              />
            </View>
          ))}
      </View>
    </View>
  );
};

const Choice = ({
  label,
  active,
  disabled,
  onPress,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
  onPress: () => void;
}) => (
  <Pressable
    accessibilityRole="button"
    accessibilityState={{ selected: active }}
    disabled={disabled}
    onPress={onPress}
    style={active ? appStyles.button : appStyles.subtleButton}
  >
    <Text style={active ? appStyles.buttonText : appStyles.subtleButtonText}>
      {label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: { gap: 12 },
  card: { ...appStyles.card, gap: 10 },
  profile: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
});
