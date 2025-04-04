// Simple MQTT client for web platform
let mqttClient = null;

// Function to load MQTT script
export const loadMqttScript = () => {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    if (window.mqtt) {
      resolve(window.mqtt);
      return;
    }
    
    // Create script element
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/mqtt/dist/mqtt.min.js';
    script.async = true;
    
    // Set up event handlers
    script.onload = () => {
      console.log('MQTT library loaded from CDN');
      resolve(window.mqtt);
    };
    
    script.onerror = (error) => {
      console.error('Error loading MQTT library:', error);
      reject(error);
    };
    
    // Add script to document
    document.head.appendChild(script);
  });
};

// Function to create MQTT client
export const createMqttClient = async (config) => {
  try {
    // Load MQTT script if needed
    await loadMqttScript();
    
    // Create WebSocket URL
    const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const brokerUrl = `${wsProtocol}://${config.host}:${config.port}/mqtt`;
    
    console.log('Connecting to MQTT broker:', brokerUrl);
    
    // Create MQTT client
    mqttClient = window.mqtt.connect(brokerUrl, {
      clientId: config.clientId,
      username: config.username || undefined,
      password: config.password || undefined,
      protocol: 'ws',
      rejectUnauthorized: false,
    });
    
    return mqttClient;
  } catch (error) {
    console.error('Error creating MQTT client:', error);
    return null;
  }
};

// Function to disconnect MQTT client
export const disconnectMqttClient = () => {
  if (mqttClient) {
    mqttClient.end();
    mqttClient = null;
  }
};

// Function to publish message
export const publishMessage = (topic, message, options = { qos: 1 }) => {
  if (mqttClient) {
    mqttClient.publish(topic, message, options);
    return true;
  }
  return false;
};

// Function to subscribe to topic
export const subscribeToTopic = (topic, options = { qos: 1 }, callback) => {
  if (mqttClient) {
    mqttClient.subscribe(topic, options, callback);
    return true;
  }
  return false;
}; 