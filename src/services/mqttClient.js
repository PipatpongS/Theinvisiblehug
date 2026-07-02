import mqtt from "mqtt";

// ================= CONFIG: HIVEMQ WEBSOCKET =================
// 1. ใส่ URL จากหน้า Broker Details (ลบ https:// และ /mqtt ออก)
const MQTT_URL = "6b5fa73a93a1478e87b92ff1da642331.s1.eu.hivemq.cloud";

// 2. ใส่ Username และ Password ของคุณ
const MQTT_USER = "the_invisible_hug";
const MQTT_PASSWORD = "Invisible16402INVISIBLE!?";

const MQTT_TOPIC = "sensor/health";
// =============================================================

let client = null;

export const isMQTTConnected = () => {
  return client !== null && client.connected;
};

export const connectMQTT = (onMessageCallback, onStatusChange) => {
  if (client) {
    console.log("MQTT already connected");
    if (client.connected && onStatusChange) onStatusChange("Connected");
    return;
  }

  // สำหรับหน้าเว็บ ต้องใช้ wss:// (WebSocket Secure) พอร์ต 8884
  const connectUrl = `wss://${MQTT_URL}:8884/mqtt`;
  const clientId = `web-dashboard-${Math.random().toString(16).slice(2)}`;

  if (onStatusChange) onStatusChange("Connecting...");
  console.log(`Connecting to MQTT broker at ${connectUrl}...`);

  client = mqtt.connect(connectUrl, {
    clientId,
    username: MQTT_USER,
    password: MQTT_PASSWORD,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
  });

  client.on("connect", () => {
    console.log("Connected to HiveMQ Cloud!");
    if (onStatusChange) onStatusChange("Connected");
    client.subscribe([MQTT_TOPIC], () => {
      console.log(`Subscribe to topic '${MQTT_TOPIC}'`);
    });
  });

  client.on("message", (topic, payload) => {
    if (topic === MQTT_TOPIC) {
      try {
        const data = JSON.parse(payload.toString());
        onMessageCallback(data);
      } catch (err) {
        console.error("Failed to parse MQTT message:", err);
      }
    }
  });

  client.on("error", (error) => {
    console.error("MQTT connection error:", error);
    if (onStatusChange) onStatusChange("Disconnected");
  });

  client.on("close", () => {
    if (onStatusChange) onStatusChange("Disconnected");
  });
  
  client.on("offline", () => {
    if (onStatusChange) onStatusChange("Disconnected");
  });
};

export const disconnectMQTT = () => {
  if (client) {
    client.end();
    client = null;
    console.log("Disconnected from MQTT broker");
  }
};

export const publishMQTT = (topic, message) => {
  if (client && client.connected) {
    // message must be a string. If it's an object, stringify it before passing
    client.publish(topic, message, { qos: 0 }, (error) => {
      if (error) {
        console.error("Publish error:", error);
      } else {
        console.log(`Published to ${topic}: ${message}`);
      }
    });
  } else {
    console.warn("Cannot publish, MQTT client not connected.");
  }
};
