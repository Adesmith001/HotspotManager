import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {AutomationProfile, ConnectedDevice, DevicePolicy} from '../types/domain';

interface AutomationsScreenProps {
  devices: ConnectedDevice[];
  policies: DevicePolicy[];
  automationProfiles: AutomationProfile[];
  onAddPolicy: (deviceId?: string) => void;
  onToggleAutomationProfile: (profile: AutomationProfile) => void;
}

export const AutomationsScreen: React.FC<AutomationsScreenProps> = ({
  devices,
  policies,
  automationProfiles,
  onAddPolicy,
  onToggleAutomationProfile,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Policy automations</Text>
        <Text style={styles.caption}>
          Build per-device caps and recurring behavior without taking essential
          manual controls away from the free tier.
        </Text>
        <Pressable onPress={() => onAddPolicy(devices[0]?.id)} style={styles.button}>
          <Text style={styles.buttonText}>Create device policy</Text>
        </Pressable>
      </View>

      {policies.map(policy => (
        <View key={policy.id} style={styles.itemCard}>
          <Text style={styles.itemTitle}>{policy.name}</Text>
          <Text style={styles.itemText}>
            Scope: {policy.scope} • Action: {policy.overageAction}
          </Text>
          <Text style={styles.itemText}>
            Cap: {policy.byteCap ?? 'none'} • Warn at {policy.warningThresholdPct}%
          </Text>
        </View>
      ))}

      <View style={styles.card}>
        <Text style={styles.title}>Automation profiles</Text>
        {automationProfiles.map(profile => (
          <View key={profile.id} style={styles.profileRow}>
            <View style={styles.profileBody}>
              <Text style={styles.itemTitle}>{profile.name}</Text>
              <Text style={styles.itemText}>{profile.triggerDescription}</Text>
            </View>
            <Pressable
              onPress={() => onToggleAutomationProfile(profile)}
              style={profile.enabled ? styles.enabledButton : styles.disabledButton}>
              <Text style={styles.buttonText}>
                {profile.enabled ? 'Enabled' : 'Disabled'}
              </Text>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
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
  caption: {
    color: '#5b6686',
  },
  itemCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e1e5f3',
    padding: 12,
    backgroundColor: '#fbfcff',
    gap: 4,
  },
  itemTitle: {
    fontWeight: '800',
    color: '#2d3552',
  },
  itemText: {
    color: '#4b5677',
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eef1fb',
    paddingTop: 10,
  },
  profileBody: {
    flex: 1,
    gap: 2,
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#1b66ff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  enabledButton: {
    backgroundColor: '#1a7e42',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  disabledButton: {
    backgroundColor: '#d65b33',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '800',
  },
});
