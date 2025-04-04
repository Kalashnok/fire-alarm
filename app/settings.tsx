import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { colors, spacing, typography } from './styles/theme';
import { useMqtt } from '../contexts/MqttContext';

export default function SettingsScreen() {
  const { mqttConfig, updateMqttConfig, connectMqtt, disconnectMqtt, mqttConnected, testAlarm } = useMqtt();
  const [tempConfig, setTempConfig] = useState(mqttConfig);

  const handleUpdateConfig = async () => {
    updateMqttConfig(tempConfig);
    
    // Reconnect with new configuration
    if (mqttConnected) {
      disconnectMqtt();
    }
    await connectMqtt(tempConfig);
  };

  const handleTestAlarm = () => {
    if (!mqttConnected) {
      Alert.alert(
        'Not Connected',
        'Please connect to MQTT broker first to test the alarm.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Test Alarm',
      'This will trigger a test alarm. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            testAlarm();
            Alert.alert('Test Alarm', 'Test alarm has been triggered.');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>MQTT Configuration</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Host</Text>
          <TextInput
            style={styles.input}
            value={tempConfig.host}
            onChangeText={(text) => setTempConfig(prev => ({ ...prev, host: text }))}
            placeholder="MQTT Broker Host"
            placeholderTextColor={colors.textTertiary}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Port</Text>
          <TextInput
            style={styles.input}
            value={tempConfig.port.toString()}
            onChangeText={(text) => setTempConfig(prev => ({ ...prev, port: parseInt(text) || prev.port }))}
            placeholder="MQTT Broker Port"
            placeholderTextColor={colors.textTertiary}
            keyboardType="numeric"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Client ID</Text>
          <TextInput
            style={styles.input}
            value={tempConfig.clientId}
            onChangeText={(text) => setTempConfig(prev => ({ ...prev, clientId: text }))}
            placeholder="Client ID"
            placeholderTextColor={colors.textTertiary}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username (Optional)</Text>
          <TextInput
            style={styles.input}
            value={tempConfig.username}
            onChangeText={(text) => setTempConfig(prev => ({ ...prev, username: text }))}
            placeholder="Username"
            placeholderTextColor={colors.textTertiary}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password (Optional)</Text>
          <TextInput
            style={styles.input}
            value={tempConfig.password}
            onChangeText={(text) => setTempConfig(prev => ({ ...prev, password: text }))}
            placeholder="Password"
            placeholderTextColor={colors.textTertiary}
            secureTextEntry
          />
        </View>
        
        <TouchableOpacity
          style={[styles.button, mqttConnected ? styles.disconnectButton : styles.connectButton]}
          onPress={mqttConnected ? disconnectMqtt : handleUpdateConfig}
        >
          <Text style={styles.buttonText}>
            {mqttConnected ? 'Disconnect' : 'Connect'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Functions</Text>
        
        <TouchableOpacity
          style={[styles.button, styles.testButton]}
          onPress={handleTestAlarm}
        >
          <Text style={styles.buttonText}>Test Alarm</Text>
        </TouchableOpacity>
        
        <Text style={styles.connectionStatus}>
          Status: {mqttConnected ? 'Connected' : 'Disconnected'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.subheader.fontSize,
    fontWeight: typography.subheader.fontWeight,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surfaceBackground,
    borderRadius: 8,
    padding: spacing.md,
    color: colors.textPrimary,
  },
  button: {
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.sm,
  },
  connectButton: {
    backgroundColor: colors.statusActive,
  },
  disconnectButton: {
    backgroundColor: colors.statusError,
  },
  testButton: {
    backgroundColor: colors.statusWarning,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  connectionStatus: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
}); 