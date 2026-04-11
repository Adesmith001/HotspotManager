import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {DeviceUsageReport} from '../services/reportService';
import {formatBytes} from '../utils/format';

interface ReportsScreenProps {
  reports: DeviceUsageReport[];
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({reports}) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Per-Device Data Reports</Text>
        <Text style={styles.caption}>
          Daily/weekly/monthly trend views can be expanded from this baseline
          report model.
        </Text>
      </View>
      {reports.map(report => (
        <View key={report.deviceId} style={styles.reportCard}>
          <Text style={styles.deviceName}>{report.deviceName}</Text>
          <Text style={styles.row}>Total: {formatBytes(report.totalBytes)}</Text>
          <Text style={styles.row}>Samples: {report.recordCount}</Text>
        </View>
      ))}
      {reports.length === 0 ? (
        <Text style={styles.empty}>No usage samples yet.</Text>
      ) : null}
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
    gap: 6,
  },
  title: {
    fontWeight: '700',
    color: '#20253a',
  },
  caption: {
    color: '#5b6686',
  },
  reportCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d8dced',
    backgroundColor: '#fff',
    padding: 12,
  },
  deviceName: {
    fontWeight: '700',
    color: '#24314c',
  },
  row: {
    color: '#44506e',
  },
  empty: {
    color: '#5b6686',
  },
});
