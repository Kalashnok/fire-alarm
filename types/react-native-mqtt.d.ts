declare module 'react-native-mqtt' {
  interface MqttClient {
    connect(): void;
    disconnect(): void;
    publish(topic: string, payload: string, qos?: number, retained?: boolean): void;
    subscribe(topic: string, qos?: number): void;
    unsubscribe(topic: string): void;
    isConnected(): boolean;
    onConnect: () => void;
    onConnectionLost: (error: any) => void;
    onFailure: (error: any) => void;
    onMessageArrived: (message: { destinationName: string; payloadString: string }) => void;
  }

  interface MqttClientOptions {
    uri: string;
    clientId: string;
    auth?: { user: string; pass: string } | false;
    automaticReconnect?: boolean;
  }

  interface MqttStatic {
    createClient(options: MqttClientOptions): Promise<MqttClient>;
  }

  const MQTT: MqttStatic;
  export default MQTT;
} 