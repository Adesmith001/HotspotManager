import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { evaluateLimit } from '../services/limitService';
import { DataLimit } from '../types/domain';
import { formatBytes } from '../utils/format';

interface LimitsScreenProps {
  limit: DataLimit;
  globalUsageBytes: number;
  onUpdateLimit: (limit: DataLimit) => void;
}

export const LimitsScreen: React.FC<LimitsScreenProps> = ({
  limit,
  globalUsageBytes,
  onUpdateLimit,
}) => {
  const [gbInput, setGbInput] = useState(String(limit.byteLimit / 1024 ** 3));
  const [warningInput, setWarningInput] = useState(
    String(limit.warningThresholdPct),
  );
  const status = useMemo(
    () => evaluateLimit(limit, globalUsageBytes),
    [globalUsageBytes, limit],
  );

  const saveLimit = () => {
    const asNumber = Number(gbInput);
    const warning = Number(warningInput);
    const bytes = Math.floor(asNumber * 1024 ** 3);
    if (!Number.isSafeInteger(bytes) || bytes <= 0) {
      Alert.alert('Enter a positive data cap in GiB.');
      return;
    }
    if (!Number.isInteger(warning) || warning < 1 || warning > 100) {
      Alert.alert('Enter a warning threshold from 1 to 100.');
      return;
    }
    onUpdateLimit({
      ...limit,
      byteLimit: bytes,
      warningThresholdPct: warning,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>Global budget policy</Text>
        <Text style={styles.heroText}>
          Used {formatBytes(status.usedBytes)} of {formatBytes(limit.byteLimit)}
        </Text>
        <Text style={styles.heroText}>
          Remaining {formatBytes(status.remainingBytes)} â€¢{' '}
          {status.exceeded
            ? 'Exceeded'
            : status.warningReached
            ? 'Warning reached'
            : 'Healthy'}
        </Text>
        <Text style={styles.heroCaption}>
          Usage comes from entries you log in Devices.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Period</Text>
        <View style={styles.row}>
          {(['daily', 'weekly', 'monthly'] as DataLimit['periodType'][]).map(
            period => (
              <Pressable
                key={period}
                onPress={() => onUpdateLimit({ ...limit, periodType: period })}
                style={[
                  styles.periodButton,
                  limit.periodType === period
                    ? styles.periodButtonActive
                    : undefined,
                ]}
              >
                <Text
                  style={
                    limit.periodType === period
                      ? styles.periodTextActive
                      : styles.periodText
                  }
                >
                  {period}
                </Text>
              </Pressable>
            ),
          )}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Data cap (GiB)</Text>
        <TextInput
          value={gbInput}
          onChangeText={setGbInput}
          keyboardType="numeric"
          style={styles.input}
        />
        <Text style={styles.title}>Warning threshold (%)</Text>
        <TextInput
          value={warningInput}
          onChangeText={setWarningInput}
          keyboardType="numeric"
          style={styles.input}
        />
        <Pressable onPress={saveLimit} style={styles.button}>
          <Text style={styles.buttonText}>Save budget policy</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  heroCard: {
    borderRadius: 16,
    backgroundColor: '#14264f',
    padding: 16,
    gap: 6,
  },
  heroTitle: {
    fontWeight: '800',
    color: '#ffffff',
    fontSize: 18,
  },
  heroText: {
    color: '#dbe5ff',
  },
  heroCaption: {
    color: '#aabbe6',
    fontSize: 12,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d8dced',
    backgroundColor: '#fff',
    padding: 14,
    gap: 8,
  },
  title: {
    fontWeight: '700',
    color: '#20253a',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  periodButton: {
    borderWidth: 1,
    borderColor: '#c7d2ff',
    backgroundColor: '#eef2ff',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  periodButtonActive: {
    borderColor: '#1b66ff',
    backgroundColor: '#1b66ff',
  },
  periodText: {
    color: '#2b56ce',
    fontWeight: '700',
  },
  periodTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cdd3e9',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    color: '#1c2440',
  },
  button: {
    backgroundColor: '#1b66ff',
    borderRadius: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '800',
  },
});
