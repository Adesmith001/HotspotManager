import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {ConnectedDevice} from '../types/domain';

interface DevicesScreenProps {
  devices: ConnectedDevice[];
  canBlockClients: boolean;
  onToggleBlock: (device: ConnectedDevice) => void;
}

export const DevicesScreen: React.FC<DevicesScreenProps> = ({
  devices,
  canBlockClients,
  onToggleBlock,
}) => {
  return (
    <View style={styles.container}>
      {!canBlockClients ? (
        <View style={styles.warning}>
          <Text style={styles.warningTitle}>Limited control mode</Text>
          <Text style={styles.warningText}>
            Native block/unblock may not be available on this device. The app
            will keep policy flags and guide manual fallback.
          </Text>
        </View>
      ) : null}
      {devices.map(device => (
        <View key={device.id} style={styles.deviceCard}>
          <View>
            <Text style={styles.deviceName}>{device.displayName}</Text>
            <Text style={styles.deviceMeta}>{device.id}</Text>
            {device.ipAddress ? (
              <Text style={styles.deviceMeta}>IP: {device.ipAddress}</Text>
            ) : null}
          </View>
          <Pressable
            onPress={() => onToggleBlock(device)}
            style={device.blocked ? styles.unblockButton : styles.blockButton}>
            <Text style={styles.buttonText}>
              {device.blocked ? 'Unblock' : 'Block'}
            </Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  warning: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f1ca7a',
    backgroundColor: '#fff8e7',
    padding: 10,
  },
  warningTitle: {
    fontWeight: '700',
    color: '#715300',
    marginBottom: 3,
  },
  warningText: {
    color: '#715300',
  },
  deviceCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dce1f1',
    backgroundColor: '#ffffff',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceName: {
    fontWeight: '700',
    color: '#23293e',
  },
  deviceMeta: {
    color: '#5d637f',
    fontSize: 12,
  },
  blockButton: {
    backgroundColor: '#e43636',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  unblockButton: {
    backgroundColor: '#1a7e42',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
