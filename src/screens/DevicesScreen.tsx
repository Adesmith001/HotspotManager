import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ConnectedDevice } from '../types/domain';

interface DevicesScreenProps {
  devices: ConnectedDevice[];
  canBlockClients: boolean;
  busy: boolean;
  onAddDevice: (name: string) => Promise<boolean>;
  onLogUsage: (device: ConnectedDevice, bytes: number) => Promise<boolean>;
  onToggleBlock: (device: ConnectedDevice) => void;
  onRenameDevice: (device: ConnectedDevice, nickname: string) => void;
  onToggleTrusted: (device: ConnectedDevice) => void;
}

export const DevicesScreen: React.FC<DevicesScreenProps> = ({
  devices,
  canBlockClients,
  busy,
  onAddDevice,
  onLogUsage,
  onToggleBlock,
  onRenameDevice,
  onToggleTrusted,
}) => {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const selectedDevice =
    devices.find(device => device.id === selectedDeviceId) ??
    devices[0] ??
    null;
  const [nameInput, setNameInput] = useState('');
  const [usageInput, setUsageInput] = useState('');
  const [nicknameInput, setNicknameInput] = useState<string | null>(null);

  const addDevice = async () => {
    const name = nameInput.trim();
    if (!name) {
      Alert.alert('Enter a device name.');
      return;
    }
    if (await onAddDevice(name)) {
      setNameInput('');
    }
  };

  const logUsage = async (device: ConnectedDevice) => {
    const bytes = Math.round(Number(usageInput.replace(',', '.')) * 1024 ** 2);
    if (!Number.isSafeInteger(bytes) || bytes <= 0) {
      Alert.alert('Enter a positive amount in MiB.');
      return;
    }
    if (await onLogUsage(device, bytes)) {
      setUsageInput('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.detailCard}>
        <Text style={styles.detailTitle}>Tracked devices</Text>
        <Text style={styles.detailMeta}>
          Add a device to keep a record of its hotspot data usage.
        </Text>
        <TextInput
          accessibilityLabel="Device name"
          value={nameInput}
          onChangeText={setNameInput}
          maxLength={80}
          placeholder="Device name"
          placeholderTextColor="#65708f"
          style={styles.input}
        />
        <Pressable disabled={busy} onPress={addDevice} style={styles.button}>
          <Text style={styles.buttonText}>Add device</Text>
        </Pressable>
      </View>

      <View style={styles.list}>
        {devices.map(device => {
          const active = device.id === selectedDevice?.id;
          return (
            <Pressable
              key={device.id}
              onPress={() => {
                setSelectedDeviceId(device.id);
                setNicknameInput(null);
                setUsageInput('');
              }}
              style={[
                styles.deviceCard,
                active ? styles.deviceCardActive : undefined,
              ]}
            >
              <View style={styles.deviceHeader}>
                <Text style={styles.deviceName}>
                  {device.nickname || device.displayName}
                </Text>
                <Text style={styles.deviceStatus}>{device.policyStatus}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {selectedDevice ? (
        <View style={styles.detailCard}>
          <Text style={styles.detailTitle}>
            {selectedDevice.nickname || selectedDevice.displayName}
          </Text>
          <Text style={styles.detailMeta}>
            Log the amount used since your last entry.
          </Text>
          <TextInput
            accessibilityLabel="Data used in MiB"
            value={usageInput}
            onChangeText={setUsageInput}
            placeholder="Data used (MiB)"
            placeholderTextColor="#65708f"
            keyboardType="decimal-pad"
            style={styles.input}
          />
          <Pressable
            disabled={busy}
            onPress={() => logUsage(selectedDevice)}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Save usage</Text>
          </Pressable>
          <Text style={styles.detailMeta}>Device settings</Text>
          <TextInput
            accessibilityLabel="Nickname"
            value={nicknameInput ?? selectedDevice.nickname ?? ''}
            onChangeText={setNicknameInput}
            maxLength={80}
            placeholder="Nickname"
            placeholderTextColor="#7d85a2"
            style={styles.input}
          />

          <View style={styles.row}>
            <Pressable
              disabled={busy}
              onPress={() =>
                onRenameDevice(
                  selectedDevice,
                  (nicknameInput ?? selectedDevice.nickname ?? '').trim(),
                )
              }
              style={styles.button}
            >
              <Text style={styles.buttonText}>Save Nickname</Text>
            </Pressable>
            <Pressable
              disabled={busy}
              onPress={() => onToggleTrusted(selectedDevice)}
              style={styles.subtleButton}
            >
              <Text style={styles.subtleButtonText}>
                {selectedDevice.trusted ? 'Remove Trust' : 'Mark Trusted'}
              </Text>
            </Pressable>
          </View>

          {canBlockClients ? (
            <Pressable
              onPress={() => onToggleBlock(selectedDevice)}
              style={
                selectedDevice.blocked
                  ? styles.unblockButton
                  : styles.blockButton
              }
            >
              <Text style={styles.buttonText}>
                {selectedDevice.blocked ? 'Unblock Device' : 'Block Device'}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
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
});
