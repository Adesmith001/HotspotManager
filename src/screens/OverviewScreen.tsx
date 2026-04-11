import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {FeatureSection} from '../components/FeatureSection';
import {CapabilityState, DataLimit} from '../types/domain';
import {formatBytes} from '../utils/format';

interface OverviewScreenProps {
  capability: CapabilityState;
  premiumActive: boolean;
  globalUsageBytes: number;
  globalLimit: DataLimit;
}

export const OverviewScreen: React.FC<OverviewScreenProps> = ({
  capability,
  premiumActive,
  globalUsageBytes,
  globalLimit,
}) => {
  return (
    <View style={styles.container}>
      <FeatureSection
        title="Free Features"
        subtitle="Always available in the base app tier.">
        <Text style={styles.item}>- Device management (view and block)</Text>
        <Text style={styles.item}>- Basic data limits</Text>
        <Text style={styles.item}>- Hotspot timer</Text>
      </FeatureSection>

      <FeatureSection
        title="Premium Features"
        subtitle="Unlocked by RevenueCat entitlement `premium`.">
        <Text style={styles.item}>- Specific data scheduling</Text>
        <Text style={styles.item}>- Per-device usage reports</Text>
        <Text style={styles.item}>- Custom per-user plans</Text>
      </FeatureSection>

      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Capability Tier</Text>
        <Text style={styles.statusText}>Tier {capability.tier}</Text>
        <Text style={styles.statusText}>
          Toggle hotspot: {capability.canToggleHotspot ? 'yes' : 'no'}
        </Text>
        <Text style={styles.statusText}>
          List clients: {capability.canListClients ? 'yes' : 'no'}
        </Text>
        <Text style={styles.statusText}>
          Block clients: {capability.canBlockClients ? 'yes' : 'no'}
        </Text>
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Subscription</Text>
        <Text style={styles.statusText}>
          Premium active: {premiumActive ? 'yes' : 'no'}
        </Text>
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Global Usage</Text>
        <Text style={styles.statusText}>
          Used: {formatBytes(globalUsageBytes)}
        </Text>
        <Text style={styles.statusText}>
          Limit: {formatBytes(globalLimit.byteLimit)} ({globalLimit.periodType})
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  item: {
    color: '#2f344f',
  },
  statusCard: {
    borderWidth: 1,
    borderColor: '#d8dced',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
  },
  statusTitle: {
    fontWeight: '700',
    marginBottom: 6,
    color: '#1d2233',
  },
  statusText: {
    color: '#404762',
    marginBottom: 2,
  },
});
