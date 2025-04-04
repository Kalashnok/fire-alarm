import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TextInput, TouchableOpacity, Alert } from 'react-native';
import { DeviceCard } from '../components/DeviceCard';
import { colors, spacing, typography } from './styles/theme';
import { useMqtt } from '../contexts/MqttContext';
import { MaterialIcons } from '@expo/vector-icons';

export default function DevicesScreen() {
  const { devices, mqttConnected, addDevice, alarms, acknowledgeAlarm } = useMqtt();
  const [isAddDeviceModalVisible, setIsAddDeviceModalVisible] = useState(false);
  const [newDevice, setNewDevice] = useState({
    id: '',
    name: '',
    location: '',
  });

  const handleAddDevice = () => {
    if (newDevice.id && newDevice.name) {
      addDevice({
        ...newDevice,
        status: 'inactive',
      });
      setNewDevice({ id: '', name: '', location: '' });
      setIsAddDeviceModalVisible(false);
    }
  };

  // Get active alarms (not acknowledged)
  const activeAlarms = alarms.filter(alarm => !alarm.acknowledged);

  // Handle alarm acknowledgment
  const handleAcknowledgeAlarm = (alarmId: string) => {
    acknowledgeAlarm(alarmId);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Fire Alarm System</Text>
        <Text style={styles.subtitle}>
          {mqttConnected ? 'Connected to MQTT Broker' : 'Disconnected'}
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAddDeviceModalVisible(true)}
        >
          <Text style={styles.addButtonText}>Add Device</Text>
        </TouchableOpacity>
      </View>
      
      {/* Active Alarms Section */}
      {activeAlarms.length > 0 && (
        <View style={styles.alarmsSection}>
          <Text style={styles.sectionTitle}>Active Alarms</Text>
          {activeAlarms.map((alarm) => (
            <View key={alarm.id} style={styles.alarmCard}>
              <View style={styles.alarmHeader}>
                <MaterialIcons name="warning" size={24} color={colors.statusError} />
                <Text style={styles.alarmTitle}>{alarm.deviceName}</Text>
              </View>
              <Text style={styles.alarmMessage}>{alarm.message}</Text>
              <Text style={styles.alarmTime}>
                {new Date(alarm.timestamp).toLocaleString()}
              </Text>
              <TouchableOpacity
                style={styles.acknowledgeButton}
                onPress={() => handleAcknowledgeAlarm(alarm.id)}
              >
                <Text style={styles.acknowledgeButtonText}>Acknowledge</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      
      <View style={styles.deviceList}>
        <Text style={styles.sectionTitle}>Connected Devices</Text>
        {devices.map((device) => (
          <DeviceCard
            key={device.id}
            name={device.name}
            status={device.status}
            location={device.location}
            lastUpdated={device.lastUpdated}
            onPress={() => {
              console.log('Device pressed:', device.id);
            }}
          />
        ))}
      </View>

      <Modal
        visible={isAddDeviceModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddDeviceModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Device</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Device ID"
              value={newDevice.id}
              onChangeText={(text) => setNewDevice(prev => ({ ...prev, id: text }))}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Device Name"
              value={newDevice.name}
              onChangeText={(text) => setNewDevice(prev => ({ ...prev, name: text }))}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Location (optional)"
              value={newDevice.location}
              onChangeText={(text) => setNewDevice(prev => ({ ...prev, location: text }))}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsAddDeviceModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={handleAddDevice}
              >
                <Text style={styles.modalButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: typography.header.fontSize,
    fontWeight: typography.header.fontWeight,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.body.fontSize,
    color: colors.textPrimary,
    opacity: 0.8,
  },
  sectionTitle: {
    fontSize: typography.subheader.fontSize,
    fontWeight: typography.subheader.fontWeight,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    marginLeft: spacing.md,
  },
  deviceList: {
    padding: spacing.md,
  },
  alarmsSection: {
    padding: spacing.md,
    backgroundColor: colors.surfaceBackground,
    marginBottom: spacing.md,
  },
  alarmCard: {
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
  },
  alarmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  alarmTitle: {
    fontSize: typography.subheader.fontSize,
    fontWeight: typography.subheader.fontWeight,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  alarmMessage: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  alarmTime: {
    fontSize: typography.caption.fontSize,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
  },
  acknowledgeButton: {
    backgroundColor: colors.statusActive,
    padding: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  acknowledgeButtonText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.lg,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: typography.subheader.fontSize,
    fontWeight: typography.subheader.fontWeight,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.surfaceBackground,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    color: colors.textPrimary,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  modalButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 8,
    marginHorizontal: spacing.xs,
  },
  cancelButton: {
    backgroundColor: colors.textSecondary,
  },
  addButton: {
    backgroundColor: colors.statusActive,
  },
  modalButtonText: {
    color: colors.textPrimary,
    textAlign: 'center',
    fontWeight: '600',
  },
  addButtonText: {
    color: colors.textPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
}); 