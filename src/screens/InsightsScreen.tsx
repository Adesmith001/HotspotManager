import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {InsightsSummary} from '../services/insightsService';

interface InsightsScreenProps {
  summary: InsightsSummary;
  usageCsv: string;
  backupPayload: string;
}

export const InsightsScreen: React.FC<InsightsScreenProps> = ({
  summary,
  usageCsv,
  backupPayload,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>Insights</Text>
        <Text style={styles.heroText}>
          {summary.activeDeviceCount} active device(s) • {summary.alertCount} alert(s)
        </Text>
        <Text style={styles.heroText}>Total tracked bytes: {summary.totalBytes}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Top devices</Text>
        {summary.topDevices.map(device => (
          <Text key={device.deviceId} style={styles.body}>
            {device.label}: {device.totalBytes} bytes
          </Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Recommendations</Text>
        {summary.recommendations.length === 0 ? (
          <Text style={styles.body}>
            No recommendations yet. Capture more usage and device history first.
          </Text>
        ) : (
          summary.recommendations.map(item => (
            <Text key={item} style={styles.body}>
              • {item}
            </Text>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>CSV export preview</Text>
        <Text style={styles.preview}>{usageCsv || 'No usage snapshots recorded yet.'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Backup payload preview</Text>
        <Text style={styles.preview}>{backupPayload}</Text>
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
  preview: {
    color: '#44506e',
    fontFamily: 'monospace',
    fontSize: 12,
  },
});
