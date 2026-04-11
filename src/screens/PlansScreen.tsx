import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {ConnectedDevice, DevicePlan} from '../types/domain';
import {formatBytes} from '../utils/format';

interface PlansScreenProps {
  devices: ConnectedDevice[];
  plans: DevicePlan[];
  onAddPlan: (deviceId: string) => void;
}

export const PlansScreen: React.FC<PlansScreenProps> = ({
  devices,
  plans,
  onAddPlan,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Custom Data Plans</Text>
        <Text style={styles.caption}>
          Assign per-device plans with custom caps and overage actions.
        </Text>
      </View>

      {devices.map(device => {
        const devicePlans = plans.filter(plan => plan.deviceId === device.id);
        return (
          <View key={device.id} style={styles.deviceCard}>
            <Text style={styles.deviceName}>{device.displayName}</Text>
            <Text style={styles.meta}>{device.id}</Text>
            <Pressable
              onPress={() => onAddPlan(device.id)}
              style={styles.addButton}>
              <Text style={styles.addButtonText}>Add Plan</Text>
            </Pressable>
            {devicePlans.map(plan => (
              <View key={plan.id} style={styles.planChip}>
                <Text style={styles.planTitle}>{plan.planName}</Text>
                <Text style={styles.planText}>
                  Cap: {formatBytes(plan.byteCap)}
                </Text>
                <Text style={styles.planText}>
                  Action: {plan.overageAction.toUpperCase()}
                </Text>
              </View>
            ))}
          </View>
        );
      })}
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
  deviceCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d8dced',
    backgroundColor: '#fff',
    padding: 12,
    gap: 6,
  },
  deviceName: {
    fontWeight: '700',
    color: '#24314c',
  },
  meta: {
    color: '#5a6481',
    fontSize: 12,
  },
  addButton: {
    borderWidth: 1,
    borderColor: '#c7d2ff',
    backgroundColor: '#eef2ff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: '#2b56ce',
    fontWeight: '700',
  },
  planChip: {
    borderWidth: 1,
    borderColor: '#e1e5f3',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#f9faff',
  },
  planTitle: {
    fontWeight: '700',
    color: '#2d3552',
  },
  planText: {
    color: '#4b5677',
  },
});
