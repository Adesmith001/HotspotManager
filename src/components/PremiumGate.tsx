import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface PremiumGateProps {
  premium: boolean;
  onUpgrade?: () => void;
  onRestore?: () => void;
  busy?: boolean;
  children: React.ReactNode;
}

export const PremiumGate: React.FC<PremiumGateProps> = ({
  premium,
  onUpgrade,
  onRestore,
  busy,
  children,
}) => {
  if (!premium) {
    return (
      <View style={styles.lockCard}>
        <Text style={styles.lockTitle}>Hotspot Manager Pro</Text>
        <Text style={styles.lockText}>
          Pro unlocks scheduled budgets, per-device caps, detailed reports, and
          data exports.
        </Text>
        {onUpgrade ? (
          <Pressable
            disabled={busy}
            onPress={onUpgrade}
            style={styles.upgradeButton}
          >
            <Text style={styles.upgradeButtonText}>Unlock Pro</Text>
          </Pressable>
        ) : null}
        {onRestore ? (
          <Pressable
            disabled={busy}
            onPress={onRestore}
            style={styles.restoreButton}
          >
            <Text style={styles.lockText}>Restore purchases</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }
  return <>{children}</>;
};

const styles = StyleSheet.create({
  lockCard: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#d7d7e5',
    backgroundColor: '#f4f4fa',
  },
  lockTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    color: '#1e1e2b',
  },
  lockText: {
    color: '#38384d',
    marginBottom: 10,
  },
  restoreButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  upgradeButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#1b66ff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  upgradeButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
