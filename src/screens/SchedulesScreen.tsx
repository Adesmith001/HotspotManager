import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {ScheduleRule} from '../types/domain';
import {formatBytes} from '../utils/format';

interface SchedulesScreenProps {
  schedules: ScheduleRule[];
  onAddSchedule: () => void;
}

export const SchedulesScreen: React.FC<SchedulesScreenProps> = ({
  schedules,
  onAddSchedule,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Specific Data Scheduling</Text>
        <Text style={styles.caption}>
          Device-specific schedules override global schedules in overlapping
          windows.
        </Text>
        <Pressable onPress={onAddSchedule} style={styles.button}>
          <Text style={styles.buttonText}>Add Sample Schedule</Text>
        </Pressable>
      </View>
      {schedules.map(schedule => (
        <View key={schedule.id} style={styles.ruleCard}>
          <Text style={styles.ruleTitle}>
            {schedule.scope.toUpperCase()} - Day {schedule.dayOfWeek}
          </Text>
          <Text style={styles.ruleText}>
            {schedule.startHour}:00 - {schedule.endHour}:00
          </Text>
          <Text style={styles.ruleText}>Cap: {formatBytes(schedule.cap)}</Text>
          {schedule.deviceId ? (
            <Text style={styles.ruleText}>Device: {schedule.deviceId}</Text>
          ) : null}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d8dced',
    backgroundColor: '#fff',
    padding: 12,
    gap: 8,
  },
  title: {
    fontWeight: '700',
    color: '#20253a',
  },
  caption: {
    color: '#58617e',
  },
  button: {
    backgroundColor: '#1b66ff',
    borderRadius: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  ruleCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d8dced',
    backgroundColor: '#fff',
    padding: 12,
  },
  ruleTitle: {
    fontWeight: '700',
    color: '#24314c',
  },
  ruleText: {
    color: '#44506e',
  },
});
