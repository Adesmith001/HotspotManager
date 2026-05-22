import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';

import {ConnectedDevice} from '../types/domain';

interface DevicesScreenProps {
  devices: ConnectedDevice[];
  canBlockClients: boolean;
  onToggleBlock: (device: ConnectedDevice) => void;
  onRenameDevice: (device: ConnectedDevice, nickname: string) => void;
  onToggleTrusted: (device: ConnectedDevice) => void;
}

const formatLastSeen = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString();
};

export const DevicesScreen: React.FC<DevicesScreenProps> = ({
  devices,
  canBlockClients,
  onToggleBlock,
  onRenameDevice,
  onToggleTrusted,
}) => {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(
    devices[0]?.id ?? null,
  );
  const selectedDevice =
    devices.find(device => device.id === selectedDeviceId) ?? devices[0] ?? null;
  const [nicknameInput, setNicknameInput] = useState(selectedDevice?.nickname ?? '');

  useEffect(() => {
    setSelectedDeviceId(current => current ?? devices[0]?.id ?? null);
  }, [devices]);

  useEffect(() => {
    setNicknameInput(selectedDevice?.nickname ?? '');
  }, [selectedDevice?.id, selectedDevice?.nickname]);

  if (devices.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>No hotspot devices detected</Text>
        <Text style={styles.emptyText}>
          Connect a client or refresh the hotspot session to build your device roster.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!canBlockClients ? (
        <View style={styles.warning}>
          <Text style={styles.warningTitle}>Manual fallback required</Text>
          <Text style={styles.warningText}>
            This device can track clients but cannot enforce native block actions.
          </Text>
        </View>
      ) : null}

      <View style={styles.list}>
        {devices.map(device => {
          const active = device.id === selectedDevice?.id;
          return (
            <Pressable
              key={device.id}
              onPress={() => setSelectedDeviceId(device.id)}
              style={[styles.deviceCard, active ? styles.deviceCardActive : undefined]}>
              <View style={styles.deviceHeader}>
                <Text style={styles.deviceName}>
                  {device.nickname || device.displayName}
                </Text>
                <Text style={styles.deviceStatus}>{device.policyStatus}</Text>
              </View>
              <Text style={styles.deviceMeta}>
                {device.vendor || 'Unknown vendor'} • Seen {device.connectionCount} times
              </Text>
              <Text style={styles.deviceMeta}>Last seen: {formatLastSeen(device.lastSeenAt)}</Text>
            </Pressable>
          );
        })}
      </View>

      {selectedDevice ? (
        <View style={styles.detailCard}>
          <Text style={styles.detailTitle}>Device detail</Text>
          <Text style={styles.detailMeta}>Hardware name: {selectedDevice.displayName}</Text>
          <Text style={styles.detailMeta}>
            IP / MAC: {selectedDevice.ipAddress || 'n/a'} /{' '}
            {selectedDevice.macAddress || selectedDevice.id}
          </Text>
          <Text style={styles.detailMeta}>
            Trusted: {selectedDevice.trusted ? 'yes' : 'no'} • Policy: {selectedDevice.policyStatus}
          </Text>

          <TextInput
            value={nicknameInput}
            onChangeText={setNicknameInput}
            placeholder="Nickname"
            placeholderTextColor="#7d85a2"
            style={styles.input}
          />

          <View style={styles.row}>
            <Pressable
              onPress={() => onRenameDevice(selectedDevice, nicknameInput.trim())}
              style={styles.button}>
              <Text style={styles.buttonText}>Save Nickname</Text>
            </Pressable>
            <Pressable
              onPress={() => onToggleTrusted(selectedDevice)}
              style={styles.subtleButton}>
              <Text style={styles.subtleButtonText}>
                {selectedDevice.trusted ? 'Remove Trust' : 'Mark Trusted'}
              </Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() => onToggleBlock(selectedDevice)}
            style={selectedDevice.blocked ? styles.unblockButton : styles.blockButton}>
            <Text style={styles.buttonText}>
              {selectedDevice.blocked ? 'Unblock Device' : 'Block Device'}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  warning: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1ca7a',
    backgroundColor: '#fff7e1',
    padding: 12,
  },
  warningTitle: {
    fontWeight: '800',
    color: '#715300',
    marginBottom: 4,
  },
  warningText: {
    color: '#715300',
  },
  list: {
    gap: 10,
  },
  deviceCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dce1f1',
    backgroundColor: '#ffffff',
    padding: 12,
    gap: 4,
  },
  deviceCardActive: {
    borderColor: '#1b66ff',
    shadowColor: '#0d265f',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceName: {
    fontWeight: '800',
    color: '#23293e',
  },
  deviceStatus: {
    color: '#2b56ce',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  deviceMeta: {
    color: '#5d637f',
    fontSize: 12,
  },
  detailCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dce1f1',
    backgroundColor: '#fbfcff',
    padding: 14,
    gap: 8,
  },
  detailTitle: {
    fontWeight: '800',
    color: '#20253a',
  },
  detailMeta: {
    color: '#46506f',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccd3eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    color: '#1d2233',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  button: {
    backgroundColor: '#1b66ff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  subtleButton: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#c7d2ff',
    backgroundColor: '#eef2ff',
  },
  blockButton: {
    backgroundColor: '#e43636',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  unblockButton: {
    backgroundColor: '#1a7e42',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '800',
  },
  subtleButtonText: {
    color: '#2b56ce',
    fontWeight: '800',
  },
  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dce1f1',
    backgroundColor: '#ffffff',
    padding: 16,
  },
  emptyTitle: {
    fontWeight: '800',
    color: '#20253a',
    marginBottom: 6,
  },
  emptyText: {
    color: '#576182',
  },
});
