import mqtt from 'mqtt';

let client: mqtt.MqttClient | null = null;

export const connect = (config: {
  host: string;
  port: number;
  clientId: string;
  username?: string;
  password?: string;
}) => {
  return new Promise<void>((resolve, reject) => {
    try {
      const { host, port, clientId, username, password } = config;
      const url = `ws://${host}:${port}/mqtt`;
      
      const options: mqtt.IClientOptions = {
        clientId,
        username,
        password,
        clean: true,
        reconnectPeriod: 5000,
        connectTimeout: 30 * 1000,
      };

      client = mqtt.connect(url, options);

      client.on('connect', () => {
        console.log('MQTT Connected');
        resolve();
      });

      client.on('error', (error) => {
        console.error('MQTT Error:', error);
        reject(error);
      });

      client.on('close', () => {
        console.log('MQTT Connection closed');
        client = null;
      });

      client.on('reconnect', () => {
        console.log('MQTT Reconnecting...');
      });

    } catch (error) {
      console.error('MQTT Connection error:', error);
      reject(error);
    }
  });
};

export const disconnect = () => {
  if (client) {
    client.end();
    client = null;
  }
};

export const publish = (topic: string, message: string) => {
  if (!client) {
    throw new Error('MQTT client not connected');
  }
  client.publish(topic, message);
};

export const subscribe = (topic: string, callback: (message: string) => void) => {
  if (!client) {
    throw new Error('MQTT client not connected');
  }
  
  client.subscribe(topic, (error) => {
    if (error) {
      console.error('Subscribe error:', error);
      return;
    }
  });

  client.on('message', (receivedTopic, message) => {
    if (receivedTopic === topic) {
      callback(message.toString());
    }
  });
};

export const unsubscribe = (topic: string) => {
  if (!client) {
    throw new Error('MQTT client not connected');
  }
  client.unsubscribe(topic);
};

export const isConnected = () => {
  return client?.connected || false;
}; 