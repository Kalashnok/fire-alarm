import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle, Modal, TextInput, Alert } from 'react-native';
import { colors, spacing, typography } from '../styles/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useMqtt } from '../contexts/MqttContext';

interface DeviceCardProps {
  id: string;
  name: string;
  status: string;
  location: string;
  lastUpdated?: Date;
  onPress?: () => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
  id,
  name,
  status,
  location,
  lastUpdated,
  onPress,
}) => {
  const { removeDevice, updateDevice } = useMqtt();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editedDevice, setEditedDevice] = useState({
    name,
    location,
  });

  // Check if device was updated in the last minute
  const isRecentlyUpdated = lastUpdated && 
    (new Date().getTime() - new Date(lastUpdated).getTime()) < 60000;

  // Determine status color
  const getStatusColor = () => {
    switch (status) {
      case 'alarm':
        return colors.statusError;
      case 'active':
        return isRecentlyUpdated ? colors.statusActive : colors.statusWarning;
      default:
        return colors.statusInactive;
    }
  };

  const handleEditDevice = () => {
    if (editedDevice.name.trim()) {
      updateDevice(id, editedDevice);
      setIsEditModalVisible(false);
    } else {
      Alert.alert('Error', 'Device name cannot be empty');
    }
  };

  const handleRemoveDevice = () => {
    Alert.alert(
      'Remove Device',
      `Are you sure you want to remove ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            console.log(`Removing device with ID: ${id}`);
            removeDevice(id);
          }
        },
      ]
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.name}>{name}</Text>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
        </View>
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => setIsEditModalVisible(true)}
          >
            <MaterialIcons name="edit" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleRemoveDevice}
          >
            <MaterialIcons name="delete" size={20} color={colors.statusError} />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.location}>{location}</Text>
      
      {lastUpdated && (
        <Text style={styles.lastUpdated}>
          Last updated: {new Date(lastUpdated).toLocaleTimeString()}
        </Text>
      )}
      
      {status === 'alarm' && (
        <TouchableOpacity 
          style={styles.acknowledgeButton} 
          onPress={onPress}
        >
          <Text style={styles.acknowledgeButtonText}>Acknowledge Alarm</Text>
        </TouchableOpacity>
      )}

      {/* Edit Device Modal */}
      <Modal
        visible={isEditModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Device</Text>
            
            <Text style={styles.inputLabel}>Device Name</Text>
            <TextInput
              style={styles.input}
              value={editedDevice.name}
              onChangeText={(text) => setEditedDevice({ ...editedDevice, name: text })}
              placeholder="Device Name"
            />
            
            <Text style={styles.inputLabel}>Location</Text>
            <TextInput
              style={styles.input}
              value={editedDevice.location}
              onChangeText={(text) => setEditedDevice({ ...editedDevice, location: text })}
              placeholder="Location"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setIsEditModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={handleEditDevice}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: typography.subheader.fontSize,
    fontWeight: typography.subheader.fontWeight,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  location: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  lastUpdated: {
    fontSize: typography.caption.fontSize,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
  },
  acknowledgeButton: {
    backgroundColor: colors.primary,
    padding: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  acknowledgeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: spacing.lg,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: typography.header.fontSize,
    fontWeight: typography.header.fontWeight,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surfaceBackground,
    borderRadius: 8,
    padding: spacing.sm,
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
    padding: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  cancelButton: {
    backgroundColor: colors.textSecondary,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
}); 