import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

interface PremiumGateProps {
  premium: boolean;
  onUpgrade?: () => void;
  children: React.ReactNode;
}

export const PremiumGate: React.FC<PremiumGateProps> = ({
  premium,
  onUpgrade,
  children,
}) => {
  if (!premium) {
    return (
      <View style={styles.lockCard}>
        <Text style={styles.lockTitle}>Premium required</Text>
        <Text style={styles.lockText}>
          Upgrade to unlock scheduling, per-device reports, and custom plans.
        </Text>
        {onUpgrade ? (
          <Pressable onPress={onUpgrade} style={styles.upgradeButton}>
            <Text style={styles.upgradeButtonText}>Upgrade</Text>
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
