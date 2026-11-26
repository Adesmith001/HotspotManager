import React from 'react';
import { Alert, Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { appStyles } from '../theme';
import { formatBytes } from '../utils/format';
import { InsightsSummary } from '../services/insightsService';

interface InsightsScreenProps {
  summary: InsightsSummary;
  getUsageCsv: () => string;
  getBackupPayload: () => string;
}

export const InsightsScreen: React.FC<InsightsScreenProps> = ({
  summary,
  getUsageCsv,
  getBackupPayload,
}) => {
  const share = async (title: string, getMessage: () => string) => {
    try {
      await Share.share({ title, message: getMessage() });
    } catch {
      Alert.alert('Could not open sharing.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>Insights</Text>
        <Text style={styles.heroText}>
          {summary.activeDeviceCount} device(s) with logged usage â€¢{' '}
          {summary.alertCount} alert(s)
        </Text>
        <Text style={styles.heroText}>
          Total logged: {formatBytes(summary.totalBytes)}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Usage by device</Text>
        {summary.topDevices.map(device => (
          <Text key={device.deviceId} style={styles.body}>
            {device.label}: {formatBytes(device.totalBytes)}
          </Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Recommendations</Text>
        {summary.recommendations.length === 0 ? (
          <Text style={styles.body}>
            No recommendations yet. Log usage to see trends here.
          </Text>
        ) : (
          summary.recommendations.map(item => (
            <Text key={item} style={styles.body}>
              â€¢ {item}
            </Text>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Data exports</Text>
        <Pressable
          style={appStyles.button}
          onPress={() => share('Hotspot usage CSV', getUsageCsv)}
        >
          <Text style={appStyles.buttonText}>Share usage CSV</Text>
        </Pressable>
        <Pressable
          style={appStyles.subtleButton}
          onPress={() => share('Hotspot data JSON', getBackupPayload)}
        >
          <Text style={appStyles.subtleButtonText}>Share data as JSON</Text>
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
    borderRadius: 18,
    backgroundColor: '#1a2a4c',
    padding: 16,
    gap: 5,
  },
  heroTitle: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 18,
  },
  heroText: {
    color: '#d3defe',
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
    color: '#44506e',
  },
});
