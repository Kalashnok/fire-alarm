import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, typography } from '../app/styles/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useMqtt } from '../contexts/MqttContext';

interface DeviceCardProps {
  name: string;
  status: string;
  location: string;
  lastUpdated?: Date;
  onPress?: () => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({ name, status, location, lastUpdated, onPress }) => {
  const { acknowledgeAlarm } = useMqtt();

  // Check if device was updated in the last minute
  const isRecentlyUpdated = () => {
    if (!lastUpdated) return false;
    const now = new Date();
    const lastUpdate = new Date(lastUpdated);
    const diffInSeconds = (now.getTime() - lastUpdate.getTime()) / 1000;
    return diffInSeconds < 60;
  };

  // Get status color based on device state
  const getStatusColor = () => {
    if (status === 'alarm') return colors.statusError; // Red for alarm
    if (isRecentlyUpdated()) return colors.statusActive; // Green for recently updated
    return colors.textSecondary; // Grey for inactive
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <MaterialIcons
            name="sensors" 
            size={24}
            color={getStatusColor()} 
          />
          <Text style={styles.name}>{name}</Text>
        </View>
      </View>
      
      <Text style={styles.location}>{location}</Text>
      
      {status === 'alarm' && (
        <TouchableOpacity 
          style={styles.alarmButton}
          onPress={onPress}
        >
          <Text style={styles.alarmButtonText}>Acknowledge Alarm</Text>
        </TouchableOpacity>
      )}
      
      {lastUpdated && (
        <Text style={styles.lastUpdate}>
          Last update: {new Date(lastUpdated).toLocaleTimeString()}
        </Text>
      )}
    </View>
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  } as ViewStyle,
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  name: {
    fontSize: typography.subheader.fontSize,
    fontWeight: typography.subheader.fontWeight,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  } as TextStyle,
  location: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  } as TextStyle,
  alarmButton: {
    backgroundColor: colors.statusError,
    padding: spacing.sm,
    borderRadius: 8,
    marginTop: spacing.sm,
  } as ViewStyle,
  alarmButtonText: {
    color: colors.textPrimary,
    textAlign: 'center',
    fontWeight: '600',
  } as TextStyle,
  lastUpdate: {
    fontSize: typography.caption.fontSize,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  } as TextStyle,
}); 