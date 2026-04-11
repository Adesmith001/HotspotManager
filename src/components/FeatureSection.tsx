import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

interface FeatureSectionProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export const FeatureSection: React.FC<FeatureSectionProps> = ({
  title,
  subtitle,
  children,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
    padding: 14,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5ee',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2233',
  },
  subtitle: {
    marginTop: 4,
    color: '#626583',
    marginBottom: 12,
  },
  content: {
    gap: 10,
  },
});
