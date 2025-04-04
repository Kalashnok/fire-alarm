import { Platform } from 'react-native';

// Define a simple interface for our MQTT client
interface MqttClient {
  connect(): Promise<void>;
  disconnect(): void;
  publish(topic: string, message: string): void;
  subscribe(topic: string, callback: (message: string) => void): void;
  unsubscribe(topic: string): void;
  isConnected(): boolean;
}

// Create a browser-compatible MQTT client
const createBrowserMqttClient = (config: {
  host: string;
  port: number;
  clientId: string;
  username?: string;
  password?: string;
}): MqttClient => {
  // Dynamically import the browser version of MQTT
  let mqtt: any;
  let client: any = null;
  let messageCallbacks: Record<string, (message: string) => void> = {};

  // Load the MQTT library dynamically
  const loadMqtt = async () => {
    if (typeof window !== 'undefined') {
      // For web, use a CDN version of MQTT
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/mqtt@4.3.7/dist/mqtt.min.js';
      script.async = true;
      
      return new Promise<void>((resolve) => {
        script.onload = () => {
          mqtt = (window as any).mqtt;
          resolve();
        };
        document.head.appendChild(script);
      });
    }
  };

  const connect = async (): Promise<void> => {
    await loadMqtt();
    
    const { host, port, clientId, username, password } = config;
    // Use the correct WebSocket URL format for EMQX broker
    const url = `ws://${host}:${port}/mqtt`;
    
    const options = {
      clientId,
      username,
      password,
      clean: true,
      reconnectPeriod: 5000,
      connectTimeout: 30 * 1000,
    };

    client = mqtt.connect(url, options);
    
    client.on('connect', () => {
      console.log('MQTT Connected (Browser)');
    });
    
    client.on('message', (topic: string, message: Buffer) => {
      const callback = messageCallbacks[topic];
      if (callback) {
        callback(message.toString());
      }
    });
    
    client.on('error', (error: Error) => {
      console.error('MQTT Error (Browser):', error);
    });
    
    client.on('close', () => {
      console.log('MQTT Connection closed (Browser)');
      client = null;
    });
  };

  const disconnect = () => {
    if (client) {
      client.end();
      client = null;
    }
  };

  const publish = (topic: string, message: string) => {
    if (!client) {
      throw new Error('MQTT client not connected');
    }
    client.publish(topic, message);
  };

  const subscribe = (topic: string, callback: (message: string) => void) => {
    if (!client) {
      throw new Error('MQTT client not connected');
    }
    
    client.subscribe(topic);
    messageCallbacks[topic] = callback;
  };

  const unsubscribe = (topic: string) => {
    if (!client) {
      throw new Error('MQTT client not connected');
    }
    client.unsubscribe(topic);
    delete messageCallbacks[topic];
  };

  const isConnected = () => {
    return client?.connected || false;
  };

  return {
    connect,
    disconnect,
    publish,
    subscribe,
    unsubscribe,
    isConnected,
  };
};

// Create a mock MQTT client for non-web platforms
const createMockMqttClient = (): MqttClient => {
  console.log('Using mock MQTT client for non-web platform');
  
  return {
    connect: async (): Promise<void> => {
      console.log('Mock MQTT: Connected');
    },
    disconnect: () => {
      console.log('Mock MQTT: Disconnected');
    },
    publish: (topic: string, message: string) => {
      console.log(`Mock MQTT: Published to ${topic}: ${message}`);
    },
    subscribe: (topic: string, callback: (message: string) => void) => {
      console.log(`Mock MQTT: Subscribed to ${topic}`);
      // Simulate receiving messages
      setTimeout(() => {
        callback(`Mock message for ${topic}`);
      }, 1000);
    },
    unsubscribe: (topic: string) => {
      console.log(`Mock MQTT: Unsubscribed from ${topic}`);
    },
    isConnected: () => true,
  };
};

// Create the appropriate MQTT client based on platform
let mqttClient: MqttClient | null = null;

export const connect = (config: {
  host: string;
  port: number;
  clientId: string;
  username?: string;
  password?: string;
}) => {
  return new Promise<void>((resolve, reject) => {
    try {
      if (Platform.OS === 'web') {
        mqttClient = createBrowserMqttClient(config);
        mqttClient.connect().then(() => {
          resolve();
        }).catch((error: Error) => {
          console.error('Failed to connect to MQTT:', error);
          reject(error);
        });
      } else {
        // For non-web platforms, use a mock client
        mqttClient = createMockMqttClient();
        mqttClient.connect();
        resolve();
      }
    } catch (error) {
      console.error('MQTT Connection error:', error);
      reject(error);
    }
  });
};

export const disconnect = () => {
  if (mqttClient) {
    mqttClient.disconnect();
    mqttClient = null;
  }
};

export const publish = (topic: string, message: string) => {
  if (!mqttClient) {
    throw new Error('MQTT client not connected');
  }
  mqttClient.publish(topic, message);
};

export const subscribe = (topic: string, callback: (message: string) => void) => {
  if (!mqttClient) {
    throw new Error('MQTT client not connected');
  }
  mqttClient.subscribe(topic, callback);
};

export const unsubscribe = (topic: string) => {
  if (!mqttClient) {
    throw new Error('MQTT client not connected');
  }
  mqttClient.unsubscribe(topic);
};

export const isConnected = () => {
  return mqttClient?.isConnected() || false;
}; 