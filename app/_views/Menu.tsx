import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useMqtt } from '../../contexts/MqttContext';

interface MenuProps {
  onSettingsPress: () => void;
}

export const Menu: React.FC<MenuProps> = ({ onSettingsPress }) => {
  const { mqttConnected, connect, disconnect, mqttConfig } = useMqtt();

  const handleConnectionToggle = () => {
    if (mqttConnected) {
      disconnect();
    } else {
      connect(mqttConfig);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, mqttConnected ? styles.connectedButton : styles.disconnectedButton]}
        onPress={handleConnectionToggle}
      >
        <MaterialIcons
          name={mqttConnected ? "wifi" : "wifi-off"}
          size={24}
          color="#fff"
        />
        <Text style={styles.buttonText}>
          {mqttConnected ? 'Disconnect' : 'Connect'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.settingsButton]}
        onPress={onSettingsPress}
      >
        <MaterialIcons name="settings" size={24} color="#fff" />
        <Text style={styles.buttonText}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    minWidth: 120,
    justifyContent: 'center',
  },
  connectedButton: {
    backgroundColor: '#4CAF50',
  },
  disconnectedButton: {
    backgroundColor: '#f44336',
  },
  settingsButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 