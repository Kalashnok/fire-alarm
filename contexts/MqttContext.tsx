import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createMqttClient, disconnectMqttClient, subscribeToTopic, publishMessage } from '../utils/mqttClient';

// Define MQTT configuration type
export interface MqttConfig {
  host: string;
  port: number;
  clientId: string;
  username?: string;
  password?: string;
}

// Define device type
export interface Device {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error' | 'warning';
  location: string;
  lastUpdated: string;
}

// Define alarm type
export interface Alarm {
  id: string;
  deviceId: string;
  deviceName: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

// Define context type
interface MqttContextType {
  mqttConnected: boolean;
  devices: Device[];
  alarms: Alarm[];
  mqttConfig: MqttConfig;
  connectMqtt: (config?: MqttConfig) => Promise<void>;
  disconnectMqtt: () => void;
  updateMqttConfig: (config: Partial<MqttConfig>) => void;
  addDevice: (device: Omit<Device, 'lastUpdated'>) => void;
  removeDevice: (deviceId: string) => void;
  acknowledgeAlarm: (alarmId: string) => void;
  testAlarm: () => void;
}

// Create context with default values
const MqttContext = createContext<MqttContextType>({
  mqttConnected: false,
  devices: [],
  alarms: [],
  mqttConfig: {
    host: 'broker.emqx.io',
    port: 8083,
    clientId: `fire-alarm-${Math.random().toString(16).slice(2, 10)}`,
  },
  connectMqtt: async () => {},
  disconnectMqtt: () => {},
  updateMqttConfig: () => {},
  addDevice: () => {},
  removeDevice: () => {},
  acknowledgeAlarm: () => {},
  testAlarm: () => {},
});

// Storage keys
const STORAGE_KEYS = {
  DEVICES: 'fire-alarm-devices',
  MQTT_CONFIG: 'fire-alarm-mqtt-config',
  ALARMS: 'fire-alarm-alarms',
};

// Provider component
export const MqttProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mqttConnected, setMqttConnected] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [mqttConfig, setMqttConfig] = useState<MqttConfig>({
    host: 'broker.emqx.io',
    port: 8083,
    clientId: `fire-alarm-${Math.random().toString(16).slice(2, 10)}`,
  });

  // Load saved data from storage and connect to MQTT
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        // Load devices
        const savedDevices = await AsyncStorage.getItem(STORAGE_KEYS.DEVICES);
        if (savedDevices) {
          setDevices(JSON.parse(savedDevices));
        }

        // Load MQTT config
        const savedConfig = await AsyncStorage.getItem(STORAGE_KEYS.MQTT_CONFIG);
        if (savedConfig) {
          const config = JSON.parse(savedConfig);
          setMqttConfig(config);
          
          // Auto-connect to MQTT if on web platform
          if (Platform.OS === 'web') {
            connectMqtt(config);
          }
        } else if (Platform.OS === 'web') {
          // Connect with default config if no saved config
          connectMqtt();
        }

        // Load alarms
        const savedAlarms = await AsyncStorage.getItem(STORAGE_KEYS.ALARMS);
        if (savedAlarms) {
          setAlarms(JSON.parse(savedAlarms));
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    };

    loadSavedData();
  }, []);

  // Save devices to storage
  useEffect(() => {
    const saveDevices = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(devices));
      } catch (error) {
        console.error('Error saving devices:', error);
      }
    };

    saveDevices();
  }, [devices]);

  // Save MQTT config to storage
  useEffect(() => {
    const saveMqttConfig = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.MQTT_CONFIG, JSON.stringify(mqttConfig));
      } catch (error) {
        console.error('Error saving MQTT config:', error);
      }
    };

    saveMqttConfig();
  }, [mqttConfig]);

  // Save alarms to storage
  useEffect(() => {
    const saveAlarms = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.ALARMS, JSON.stringify(alarms));
      } catch (error) {
        console.error('Error saving alarms:', error);
      }
    };

    saveAlarms();
  }, [alarms]);

  // Connect to MQTT broker
  const connectMqtt = async (config?: MqttConfig) => {
    if (Platform.OS !== 'web') {
      console.log('MQTT is only supported on web platform');
      return;
    }

    try {
      // Disconnect if already connected
      disconnectMqtt();

      // Use provided config or saved config
      const configToUse = config || mqttConfig;
      
      const client = await createMqttClient(configToUse);

      if (client) {
        client.on('connect', () => {
          console.log('Connected to MQTT broker');
          setMqttConnected(true);
          
          // Subscribe to device status topics
          devices.forEach(device => {
            subscribeToTopic(`devices/${device.id}/status`, { qos: 1 }, (err: Error | null) => {
              if (err) {
                console.error(`Error subscribing to device ${device.id} status:`, err);
              }
            });
          });

          // Subscribe to alarm topics
          devices.forEach(device => {
            subscribeToTopic(`devices/${device.id}/alarm`, { qos: 1 }, (err: Error | null) => {
              if (err) {
                console.error(`Error subscribing to device ${device.id} alarm:`, err);
              }
            });
          });
        });

        client.on('message', (topic: string, message: Buffer) => {
          console.log('Received message:', topic, message.toString());
          
          // Handle device status updates
          if (topic.match(/devices\/\d+\/status/)) {
            const deviceId = topic.split('/')[1];
            const status = message.toString();
            const timestamp = new Date().toISOString();
            
            setDevices(prevDevices => 
              prevDevices.map(device => 
                device.id === deviceId 
                  ? { ...device, status: status as Device['status'], lastUpdated: timestamp }
                  : device
              )
            );
          }
          
          // Handle alarm messages
          if (topic.match(/devices\/\d+\/alarm/)) {
            const deviceId = topic.split('/')[1];
            const device = devices.find(d => d.id === deviceId);
            
            if (device) {
              const alarmMessage = message.toString();
              const newAlarm: Alarm = {
                id: `${deviceId}-${Date.now()}`,
                deviceId,
                deviceName: device.name,
                message: alarmMessage,
                timestamp: new Date().toISOString(),
                acknowledged: false,
              };
              
              setAlarms(prevAlarms => [newAlarm, ...prevAlarms]);
              
              // Show alert for new alarms
              if (Platform.OS === 'web') {
                // For web, use browser alert
                alert(`ALARM: ${device.name} - ${alarmMessage}`);
              } else {
                // For mobile, use React Native Alert
                Alert.alert(
                  'Fire Alarm Alert',
                  `${device.name}: ${alarmMessage}`,
                  [
                    { 
                      text: 'Acknowledge', 
                      onPress: () => acknowledgeAlarm(newAlarm.id) 
                    },
                    { 
                      text: 'OK' 
                    }
                  ]
                );
              }
            }
          }
        });

        client.on('error', (err: Error) => {
          console.error('MQTT error:', err);
          setMqttConnected(false);
        });
      }
    } catch (error) {
      console.error('Error connecting to MQTT:', error);
      setMqttConnected(false);
    }
  };

  // Disconnect from MQTT broker
  const disconnectMqtt = () => {
    disconnectMqttClient();
    setMqttConnected(false);
  };

  // Update MQTT configuration
  const updateMqttConfig = (config: Partial<MqttConfig>) => {
    setMqttConfig(prevConfig => ({ ...prevConfig, ...config }));
  };

  // Add a new device
  const addDevice = (device: Omit<Device, 'lastUpdated'>) => {
    const newDevice: Device = {
      ...device,
      lastUpdated: new Date().toISOString(),
    };
    
    setDevices(prevDevices => [...prevDevices, newDevice]);
    
    // Subscribe to device topics if connected
    if (mqttConnected) {
      subscribeToTopic(`devices/${device.id}/status`, { qos: 1 });
      subscribeToTopic(`devices/${device.id}/alarm`, { qos: 1 });
    }
  };

  // Remove a device
  const removeDevice = (deviceId: string) => {
    setDevices(prevDevices => prevDevices.filter(device => device.id !== deviceId));
  };

  // Acknowledge an alarm
  const acknowledgeAlarm = (alarmId: string) => {
    setAlarms(prevAlarms => 
      prevAlarms.map(alarm => 
        alarm.id === alarmId ? { ...alarm, acknowledged: true } : alarm
      )
    );
  };

  // Test alarm function
  const testAlarm = () => {
    const testDevice = devices[0];
    if (testDevice) {
      const newAlarm: Alarm = {
        id: `test-${Date.now()}`,
        deviceId: testDevice.id,
        deviceName: testDevice.name,
        message: 'Test alarm - This is a simulated fire alarm',
        timestamp: new Date().toISOString(),
        acknowledged: false,
      };
      
      setAlarms(prevAlarms => [newAlarm, ...prevAlarms]);
      
      // Show alert for test alarm
      if (Platform.OS === 'web') {
        alert(`TEST ALARM: ${testDevice.name} - Test alarm - This is a simulated fire alarm`);
      } else {
        Alert.alert(
          'Test Fire Alarm Alert',
          `${testDevice.name}: Test alarm - This is a simulated fire alarm`,
          [
            { 
              text: 'Acknowledge', 
              onPress: () => acknowledgeAlarm(newAlarm.id) 
            },
            { 
              text: 'OK' 
            }
          ]
        );
      }
    }
  };

  return (
    <MqttContext.Provider
      value={{
        mqttConnected,
        devices,
        alarms,
        mqttConfig,
        connectMqtt,
        disconnectMqtt,
        updateMqttConfig,
        addDevice,
        removeDevice,
        acknowledgeAlarm,
        testAlarm,
      }}
    >
      {children}
    </MqttContext.Provider>
  );
};

// Custom hook to use the MQTT context
export const useMqtt = () => useContext(MqttContext); 