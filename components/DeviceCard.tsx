import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, typography } from '../app/styles/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useMqtt } from '../contexts/MqttContext';

interface DeviceCardProps {
  device: {
    id: string;
    name: string;
    location: string;
    lastUpdate?: Date;
    isAlarming: boolean;
  };
  onRemove: () => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({ device, onRemove }) => {
  const { acknowledgeAlarm } = useMqtt();

  // Check if device was updated in the last minute
  const isRecentlyUpdated = () => {
    if (!device.lastUpdate) return false;
    const now = new Date();
    const lastUpdate = new Date(device.lastUpdate);
    const diffInSeconds = (now.getTime() - lastUpdate.getTime()) / 1000;
    return diffInSeconds < 60;
  };

  // Get status color based on device state
  const getStatusColor = () => {
    if (device.isAlarming) return '#ff4444'; // Red for alarm
    if (isRecentlyUpdated()) return '#4CAF50'; // Green for recently updated
    return '#9e9e9e'; // Grey for inactive
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <MaterialIcons 
            name="sensors" 
            size={24} 
            color={getStatusColor()} 
            style={styles.icon}
          />
          <Text style={styles.name}>{device.name}</Text>
        </View>
        <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
          <MaterialIcons name="delete" size={20} color="#ff4444" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.location}>{device.location}</Text>
      
      {device.isAlarming && (
        <TouchableOpacity 
          style={styles.alarmButton}
          onPress={() => acknowledgeAlarm(device.id)}
        >
          <Text style={styles.alarmButtonText}>Acknowledge Alarm</Text>
        </TouchableOpacity>
      )}
      
      {device.lastUpdate && (
        <Text style={styles.lastUpdate}>
          Last update: {new Date(device.lastUpdate).toLocaleTimeString()}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  } as ViewStyle,
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  icon: {
    marginRight: 8,
  } as ViewStyle,
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  } as TextStyle,
  location: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  } as TextStyle,
  removeButton: {
    padding: 4,
  } as ViewStyle,
  alarmButton: {
    backgroundColor: '#ff4444',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  } as ViewStyle,
  alarmButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
  } as TextStyle,
  lastUpdate: {
    fontSize: 12,
    color: '#999999',
    marginTop: 8,
  } as TextStyle,
}); 