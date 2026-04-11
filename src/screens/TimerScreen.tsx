import React, {useMemo, useState} from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';

import {getRemainingSeconds} from '../services/timerService';
import {HotspotTimer} from '../types/domain';

interface TimerScreenProps {
  timer: HotspotTimer | null;
  nowMs: number;
  onStart: (durationMinutes: number) => void;
  onStop: () => void;
}

export const TimerScreen: React.FC<TimerScreenProps> = ({
  timer,
  nowMs,
  onStart,
  onStop,
}) => {
  const [minutes, setMinutes] = useState('15');
  const remainingSeconds = useMemo(() => {
    if (!timer?.active) {
      return 0;
    }
    return getRemainingSeconds(timer.endsAt, nowMs);
  }, [nowMs, timer]);

  const startTimer = () => {
    const parsed = Number(minutes);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return;
    }
    onStart(parsed);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Hotspot Timer</Text>
        <Text style={styles.text}>
          {timer?.active
            ? `Running: ${remainingSeconds}s remaining`
            : 'Timer inactive'}
        </Text>
        <Text style={styles.caption}>
          When supported, hotspot auto-stop runs at expiry. Otherwise the app
          triggers a fallback notification.
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Set Timer (minutes)</Text>
        <TextInput
          value={minutes}
          onChangeText={setMinutes}
          keyboardType="numeric"
          style={styles.input}
        />
        <View style={styles.row}>
          <Pressable onPress={startTimer} style={styles.button}>
            <Text style={styles.buttonText}>Start</Text>
          </Pressable>
          <Pressable onPress={onStop} style={styles.altButton}>
            <Text style={styles.altButtonText}>Stop</Text>
          </Pressable>
        </View>
      </View>
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
  text: {
    color: '#414b67',
  },
  caption: {
    color: '#576182',
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cdd3e9',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#1c2440',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    backgroundColor: '#1b66ff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  altButton: {
    backgroundColor: '#ecf0ff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#c7d2ff',
  },
  altButtonText: {
    color: '#2b56ce',
    fontWeight: '700',
  },
});
