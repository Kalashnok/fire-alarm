import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, typography } from '../styles/theme';

interface DeviceCardProps {
  name: string;
  status: 'active' | 'inactive' | 'error' | 'warning';
  location: string;
  lastUpdated: string;
  onPress?: () => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
  name,
  status,
  location,
  lastUpdated,
  onPress,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return colors.statusActive;
      case 'inactive':
        return colors.statusInactive;
      case 'error':
        return colors.statusError;
      case 'warning':
        return colors.statusWarning;
      default:
        return colors.statusInactive;
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.name}>{name}</Text>
      </View>
      <View style={styles.details}>
        <Text style={styles.location}>{location}</Text>
        <Text style={styles.lastUpdated}>Last updated: {lastUpdated}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: spacing.md,
    marginVertical: spacing.sm,
    marginHorizontal: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  } as ViewStyle,
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  } as ViewStyle,
  name: {
    fontSize: typography.subheader.fontSize,
    fontWeight: typography.subheader.fontWeight,
    color: colors.textPrimary,
  } as TextStyle,
  details: {
    marginTop: spacing.xs,
  } as ViewStyle,
  location: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
  } as TextStyle,
  lastUpdated: {
    fontSize: typography.caption.fontSize,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  } as TextStyle,
}); 