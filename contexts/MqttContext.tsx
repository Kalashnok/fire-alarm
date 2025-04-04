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
  isAlarming: boolean;
}

interface Alarm {
  deviceId: string;
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
  mqttConfig: MqttConfig;
  connect: (config: MqttConfig) => Promise<void>;
  disconnect: () => void;
  addDevice: (device: Omit<Device, 'lastUpdate' | 'isAlarming'>) => void;
  removeDevice: (deviceId: string) => void;
  acknowledgeAlarm: (deviceId: string) => void;
  updateMqttConfig: (config: Partial<MqttConfig>) => void;
}

// Create the context with default values
const MqttContext = createContext<MqttContextType>({
  devices: [],
  alarms: [],
  isConnected: false,
  mqttConfig: {
    host: 'broker.emqx.io',
    port: 8083,
    clientId: `fire-alarm-${Math.random().toString(16).slice(2, 10)}`,
  },
  connect: async () => {},
  disconnect: () => {},
  addDevice: () => {},
  removeDevice: () => {},
  acknowledgeAlarm: () => {},
  updateMqttConfig: () => {},
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

  // Load saved data on initialization
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        // Load saved devices
        const savedDevices = await AsyncStorage.getItem('devices');
        if (savedDevices) {
          setDevices(JSON.parse(savedDevices));
        }

        // Load saved MQTT config
        const savedConfig = await AsyncStorage.getItem('mqttConfig');
        if (savedConfig) {
          const config = JSON.parse(savedConfig);
          setMqttConfig(config);
          
          // Auto-connect if we have saved config
          if (Platform.OS === 'web') {
            try {
              await connect(config);
            } catch (error) {
              console.error('Failed to auto-connect to MQTT:', error);
            }
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

  // Handle device status updates
  const handleDeviceStatus = (deviceId: string, message: string) => {
    setDevices(prevDevices => {
      return prevDevices.map(device => {
        if (device.id === deviceId) {
          const isAlarming = message.toLowerCase().includes('alarm');
          
          // If device is alarming, add to alarms list
          if (isAlarming && !device.isAlarming) {
            setAlarms(prevAlarms => [
              ...prevAlarms,
              {
                deviceId,
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
            isAlarming,
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
      
      // Subscribe to device topics
      devices.forEach(device => {
        mqttClient.subscribe(`devices/${device.id}/status`, (message) => {
          handleDeviceStatus(device.id, message);
        });
      });
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
  const addDevice = (device: Omit<Device, 'lastUpdate' | 'isAlarming'>) => {
    const newDevice: Device = {
      ...device,
      lastUpdate: new Date(),
      isAlarming: false,
    };
    
    setDevices(prevDevices => [...prevDevices, newDevice]);
    
    // Subscribe to device topic if connected
    if (isConnected) {
      mqttClient.subscribe(`devices/${device.id}/status`, (message) => {
        handleDeviceStatus(device.id, message);
      });
    }
  };

  // Remove a device
  const removeDevice = (deviceId: string) => {
    setDevices(prevDevices => prevDevices.filter(device => device.id !== deviceId));
    
    // Unsubscribe from device topic if connected
    if (isConnected) {
      mqttClient.unsubscribe(`devices/${deviceId}/status`);
    }
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
        device.id === deviceId ? { ...device, isAlarming: false } : device
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
        mqttConfig,
        connect,
        disconnect,
        addDevice,
        removeDevice,
        acknowledgeAlarm,
        updateMqttConfig,
      }}
    >
      {children}
    </MqttContext.Provider>
  );
};

// Create a hook to use the MQTT context
export const useMqtt = () => useContext(MqttContext); 