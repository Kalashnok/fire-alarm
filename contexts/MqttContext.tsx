import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as mqttClient from '../utils/mqttClient';

// Define types for our context
interface Device {
  id: string;
  name: string;
  location: string;
  lastUpdate?: Date;
  status: string;
}

interface Alarm {
  id: string;
  deviceId: string;
  deviceName: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

interface MqttConfig {
  host: string;
  port: number;
  clientId: string;
  username?: string;
  password?: string;
}

interface MqttContextType {
  devices: Device[];
  alarms: Alarm[];
  isConnected: boolean;
  mqttConnected: boolean;
  mqttConfig: MqttConfig;
  connect: (config: MqttConfig) => Promise<void>;
  disconnect: () => void;
  addDevice: (device: Omit<Device, 'lastUpdate' | 'status'>) => void;
  removeDevice: (deviceId: string) => void;
  updateDevice: (deviceId: string, updates: Partial<Omit<Device, 'id' | 'lastUpdate' | 'status'>>) => void;
  acknowledgeAlarm: (deviceId: string) => void;
  updateMqttConfig: (config: Partial<MqttConfig>) => void;
  testAlarm: () => void;
}

// Create the context with default values
const MqttContext = createContext<MqttContextType>({
  devices: [],
  alarms: [],
  isConnected: false,
  mqttConnected: false,
  mqttConfig: {
    host: 'broker.emqx.io',
    port: 8083,
    clientId: `fire-alarm-${Math.random().toString(16).slice(2, 10)}`,
  },
  connect: async () => {},
  disconnect: () => {},
  addDevice: () => {},
  removeDevice: () => {},
  updateDevice: () => {},
  acknowledgeAlarm: () => {},
  updateMqttConfig: () => {},
  testAlarm: () => {},
});

// Create a provider component
export const MqttProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [mqttConfig, setMqttConfig] = useState<MqttConfig>({
    host: 'broker.emqx.io',
    port: 8083,
    clientId: `fire-alarm-${Math.random().toString(16).slice(2, 10)}`,
  });

  // Load saved data and connect on initialization
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        // Load saved devices
        const savedDevices = await AsyncStorage.getItem('devices');
        if (savedDevices) {
          const parsedDevices = JSON.parse(savedDevices);
          setDevices(parsedDevices);
        }

        // Load saved MQTT config
        const savedConfig = await AsyncStorage.getItem('mqttConfig');
        if (savedConfig) {
          const config = JSON.parse(savedConfig);
          setMqttConfig(config);
          
          // Auto-connect if we have saved config
          try {
            await connect(config);
          } catch (error) {
            console.error('Failed to auto-connect to MQTT:', error);
          }
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    };

    loadSavedData();
  }, []);

  // Save devices when they change
  useEffect(() => {
    AsyncStorage.setItem('devices', JSON.stringify(devices));
  }, [devices]);

  // Save MQTT config when it changes
  useEffect(() => {
    AsyncStorage.setItem('mqttConfig', JSON.stringify(mqttConfig));
  }, [mqttConfig]);

  // Subscribe to device topics when connected
  useEffect(() => {
    if (isConnected) {
      devices.forEach(device => {
        // Subscribe to status topic
        mqttClient.subscribe(`devices/${device.id}/status`, (message) => {
          handleDeviceStatus(device.id, message);
        });
        
        // Subscribe to alarm topic
        mqttClient.subscribe(`devices/${device.id}/alarm`, (message) => {
          handleDeviceAlarm(device.id, message);
        });
      });
    }
  }, [isConnected, devices]);

  // Handle device status updates
  const handleDeviceStatus = (deviceId: string, message: string) => {
    console.log(`MQTT Status Update - Device ${deviceId}: ${message}`);
    
    setDevices(prevDevices => {
      return prevDevices.map(device => {
        if (device.id === deviceId) {
          const isAlarming = message.toLowerCase().includes('alarm');
          
          // If device is alarming, add to alarms list
          if (isAlarming && device.status !== 'alarm') {
            setAlarms(prevAlarms => [
              ...prevAlarms,
              {
                id: Math.random().toString(36).substring(2, 9),
                deviceId,
                deviceName: device.name,
                message,
                timestamp: new Date(),
                acknowledged: false,
              },
            ]);
            
            // Show alert for new alarm
            if (Platform.OS === 'web') {
              window.alert(`ALARM: ${device.name} at ${device.location}`);
            } else {
              Alert.alert(
                'Fire Alarm',
                `${device.name} at ${device.location}`,
                [
                  {
                    text: 'Acknowledge',
                    onPress: () => acknowledgeAlarm(deviceId),
                  },
                ],
              );
            }
          }
          
          return {
            ...device,
            lastUpdate: new Date(),
            status: isAlarming ? 'alarm' : 'active',
          };
        }
        return device;
      });
    });
  };

  // Handle device alarm updates
  const handleDeviceAlarm = (deviceId: string, message: string) => {
    console.log(`MQTT Alarm Update - Device ${deviceId}: ${message}`);
    
    setDevices(prevDevices => {
      return prevDevices.map(device => {
        if (device.id === deviceId) {
          // Add to alarms list
          setAlarms(prevAlarms => [
            ...prevAlarms,
            {
              id: Math.random().toString(36).substring(2, 9),
              deviceId,
              deviceName: device.name,
              message,
              timestamp: new Date(),
              acknowledged: false,
            },
          ]);
          
          // Show alert for new alarm
          if (Platform.OS === 'web') {
            window.alert(`ALARM: ${device.name} at ${device.location}`);
          } else {
            Alert.alert(
              'Fire Alarm',
              `${device.name} at ${device.location}`,
              [
                {
                  text: 'Acknowledge',
                  onPress: () => acknowledgeAlarm(deviceId),
                },
              ],
            );
          }
          
          return {
            ...device,
            lastUpdate: new Date(),
            status: 'alarm',
          };
        }
        return device;
      });
    });
  };

  // Connect to MQTT broker
  const connect = async (config: MqttConfig) => {
    try {
      await mqttClient.connect(config);
      setIsConnected(true);
      console.log('Connected to MQTT broker:', config.host);
    } catch (error) {
      console.error('Failed to connect to MQTT:', error);
      throw error;
    }
  };

  // Disconnect from MQTT broker
  const disconnect = () => {
    mqttClient.disconnect();
    setIsConnected(false);
  };

  // Add a new device
  const addDevice = (device: Omit<Device, 'lastUpdate' | 'status'>) => {
    const newDevice: Device = {
      ...device,
      lastUpdate: new Date(),
      status: 'inactive',
    };
    
    setDevices(prevDevices => [...prevDevices, newDevice]);
    console.log('Added new device:', newDevice);
    
    // Subscribe to device topics if connected
    if (isConnected) {
      // Subscribe to status topic
      mqttClient.subscribe(`devices/${device.id}/status`, (message) => {
        handleDeviceStatus(device.id, message);
      });
      
      // Subscribe to alarm topic
      mqttClient.subscribe(`devices/${device.id}/alarm`, (message) => {
        handleDeviceAlarm(device.id, message);
      });
    }
  };

  // Remove a device
  const removeDevice = (deviceId: string) => {
    console.log(`Removing device with ID: ${deviceId}`);
    
    // Unsubscribe from device topics if connected
    if (isConnected) {
      try {
        mqttClient.unsubscribe(`devices/${deviceId}/status`);
        mqttClient.unsubscribe(`devices/${deviceId}/alarm`);
        console.log(`Unsubscribed from topics for device ${deviceId}`);
      } catch (error) {
        console.error(`Error unsubscribing from topics for device ${deviceId}:`, error);
      }
    }
    
    // Remove device from state
    setDevices(prevDevices => {
      const updatedDevices = prevDevices.filter(device => device.id !== deviceId);
      console.log(`Device removed. Remaining devices: ${updatedDevices.length}`);
      return updatedDevices;
    });
    
    // Remove any alarms for this device
    setAlarms(prevAlarms => {
      const updatedAlarms = prevAlarms.filter(alarm => alarm.deviceId !== deviceId);
      console.log(`Alarms removed for device ${deviceId}. Remaining alarms: ${updatedAlarms.length}`);
      return updatedAlarms;
    });
  };

  // Update device settings
  const updateDevice = (deviceId: string, updates: Partial<Omit<Device, 'id' | 'lastUpdate' | 'status'>>) => {
    setDevices(prevDevices => 
      prevDevices.map(device => 
        device.id === deviceId ? { ...device, ...updates } : device
      )
    );
  };

  // Acknowledge an alarm
  const acknowledgeAlarm = (deviceId: string) => {
    setAlarms(prevAlarms => 
      prevAlarms.map(alarm => 
        alarm.deviceId === deviceId ? { ...alarm, acknowledged: true } : alarm
      )
    );
    
    setDevices(prevDevices =>
      prevDevices.map(device =>
        device.id === deviceId ? { ...device, status: 'active' } : device
      )
    );
  };

  // Update MQTT configuration
  const updateMqttConfig = (config: Partial<MqttConfig>) => {
    const newConfig = { ...mqttConfig, ...config };
    setMqttConfig(newConfig);
  };

  return (
    <MqttContext.Provider
      value={{
        devices,
        alarms,
        isConnected,
        mqttConnected: isConnected,
        mqttConfig,
        connect,
        disconnect,
        addDevice,
        removeDevice,
        updateDevice,
        acknowledgeAlarm,
        updateMqttConfig,
        testAlarm: () => {
          // Simulate a test alarm
          const testDevice = devices[0];
          if (testDevice) {
            handleDeviceStatus(testDevice.id, 'TEST ALARM');
          }
        },
      }}
    >
      {children}
    </MqttContext.Provider>
  );
};

// Create a hook to use the MQTT context
export const useMqtt = () => useContext(MqttContext); 