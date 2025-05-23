import { Platform } from 'react-native';
import { Buffer } from 'buffer';          // поліфіл для mqtt
import mqtt, { MqttClient as MQTTClient, IClientOptions } from 'mqtt/dist/mqtt';

global.Buffer = Buffer as any;

interface MqttClientOptions {
  host: string;
  port: number;
  clientId: string;
  username?: string;
  password?: string;
  useTLS?: boolean;
}

let client: MQTTClient | null = null;

export const connect = async (opts: MqttClientOptions): Promise<void> => {
  const protocol = opts.useTLS ? 'wss' : 'ws';
  const url = `${protocol}://${opts.host}:${opts.port}/mqtt`;
  const options: IClientOptions = {
    clientId: opts.clientId,
    username: opts.username,
    password: opts.password,
    clean: true,
    reconnectPeriod: 5000,
    connectTimeout: 30_000,
  };

  client = mqtt.connect(url, options);

  return new Promise((resolve, reject) => {
    if (!client) return reject(new Error('MQTT client not initialized'));

    client.on('connect', () => {
      console.log('✅ MQTT connected:', url);
      resolve();
    });
    client.on('error', err => {
      console.error('🔴 MQTT error:', err);
      reject(err);
    });
  });
};

export const subscribe = (topic: string, callback: (msg: string) => void): void => {
  if (!client) throw new Error('MQTT not connected');
  client.subscribe(topic, { qos: 1 }, err => {
    if (err) console.error('Subscribe error:', err);
  });
  client.on('message', (_, payload) => {
    callback(payload.toString());
  });
};

export const publish = (topic: string, message: string): void => {
  if (!client) throw new Error('MQTT not connected');
  client.publish(topic, message, { qos: 1 }, err => {
    if (err) console.error('Publish error:', err);
  });
};

export const disconnect = (): void => {
  if (client) {
    client.end();
    client = null;
    console.log('🔌 MQTT disconnected');
  }
};

export const isConnected = (): boolean => {
  return client?.connected || false;
};
