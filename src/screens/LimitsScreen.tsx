import React, {useMemo, useState} from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';

import {evaluateLimit} from '../services/limitService';
import {DataLimit} from '../types/domain';
import {formatBytes} from '../utils/format';

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
  const [gbInput, setGbInput] = useState((limit.byteLimit / 1024 ** 3).toFixed(1));
  const status = useMemo(
    () => evaluateLimit(limit, globalUsageBytes),
    [globalUsageBytes, limit],
  );

  const saveLimit = () => {
    const asNumber = Number(gbInput);
    if (!Number.isFinite(asNumber) || asNumber <= 0) {
      return;
    }
    onUpdateLimit({
      ...limit,
      byteLimit: Math.floor(asNumber * 1024 ** 3),
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Basic Data Limit</Text>
        <Text style={styles.text}>
          Used: {formatBytes(status.usedBytes)} / {formatBytes(limit.byteLimit)}
        </Text>
        <Text style={styles.text}>
          Remaining: {formatBytes(status.remainingBytes)}
        </Text>
        <Text style={styles.exceeded}>
          Status: {status.exceeded ? 'Exceeded' : 'Within limit'}
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Set Daily/Monthly Cap (GB)</Text>
        <TextInput
          value={gbInput}
          onChangeText={setGbInput}
          keyboardType="numeric"
          style={styles.input}
        />
        <Pressable onPress={saveLimit} style={styles.button}>
          <Text style={styles.buttonText}>Save Limit</Text>
        </Pressable>
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
    color: '#444d69',
  },
  exceeded: {
    color: '#ab2a2a',
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cdd3e9',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#1c2440',
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
});
