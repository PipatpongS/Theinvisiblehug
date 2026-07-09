#include "MAX30105.h"
#include "heartRate.h"
#include <ArduinoOTA.h>
#include <ClosedCube_MAX30205.h>
#include <Preferences.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <Wire.h>

// --- เพิ่ม Library สำหรับ Web ---
#include <InfluxDbClient.h>
#include <InfluxDbCloud.h>
#include <PubSubClient.h>

// ================= CONFIG: HARDWARE =================
#define GSR_PIN 34
#define VIB_MOTOR_PIN 25
#define MPU6050_ADDR 0x68

// ================= CONFIG: WIFI =================
String ssid = "iPhone";
String password = "suppanat";
Preferences preferences;

// ================= CONFIG: HIVEMQ (Live Data) =================
const char *mqtt_server =
    "6b5fa73a93a1478e87b92ff1da642331.s1.eu.hivemq.cloud"; // **เปลี่ยนตรงนี้**
const int mqtt_port = 8883;                  // ใช้พอร์ต 8883 สำหรับความปลอดภัย TLS
const char *mqtt_user = "the_invisible_hug"; // **เปลี่ยนตรงนี้**
const char *mqtt_password = "Invisible16402INVISIBLE!?"; // **เปลี่ยนตรงนี้**
const char *mqtt_topic = "sensor/health";

// ================= CONFIG: INFLUXDB (History Data) =================
#define INFLUXDB_URL                                                           \
  "https://us-east-1-1.aws.cloud2.influxdata.com" // **เปลี่ยนตามหน้าเว็บของคุณ**
#define INFLUXDB_TOKEN                                                         \
  "Xs4k_"                                                                      \
  "6XWlI2Yv0UGxGpK6SW8m922HZGqn65xStfdbeyroeoNbOgdIqYPypDsQ9Hqmq2ewZzZPnttBRy" \
  "wIWNizg=="                           // **เปลี่ยนตรงนี้**
#define INFLUXDB_ORG "97eb4fb19476e566" // **เปลี่ยนตรงนี้**
#define INFLUXDB_BUCKET "jcc_data"      // **เปลี่ยนตรงนี้**
#define TZ_INFO "UTC7"                  // เวลาประเทศไทย

// ================= INSTANCES =================
MAX30105 particleSensor;
ClosedCube_MAX30205 max30205;

// Web Clients
WiFiClientSecure espClient;
PubSubClient mqttClient(espClient);
InfluxDBClient influxClient(INFLUXDB_URL, INFLUXDB_ORG, INFLUXDB_BUCKET,
                            INFLUXDB_TOKEN, InfluxDbCloud2CACert);
Point sensorPoint("patient_status"); // ชื่อ Measurement ใน InfluxDB

// ================= VARIABLES =================
const byte RATE_SIZE = 4;
byte rates[RATE_SIZE];
byte rateSpot = 0;
long lastBeat = 0;
float beatsPerMinute = 0;
int beatAvg = 0;

unsigned long lastDisplayTime = 0;
const unsigned long displayInterval = 150; // ทำงานหลักทุก 150ms

unsigned long motorTimer = 0;
bool motorState = false;

unsigned long lastInfluxTime = 0;
const unsigned long influxInterval = 5000; // ส่ง InfluxDB ทุก 5 วินาที

// ฟังก์ชันหาค่าเฉลี่ยสำหรับ InfluxDB
float sumBPM = 0;
float sumTemp = 0;
long sumGSR = 0;
float sumIMU = 0; // เพิ่มตัวแปรสะสม IMU
int sampleCount = 0;

// ================= FUNCTIONS =================
bool initMPU6050() {
  Wire.beginTransmission(MPU6050_ADDR);
  Wire.write(0x6B);
  Wire.write(0x00);
  return (Wire.endTransmission() == 0);
}

void readMPU6050(int16_t &ax, int16_t &ay, int16_t &az, int16_t &gx,
                 int16_t &gy, int16_t &gz) {
  Wire.beginTransmission(MPU6050_ADDR);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU6050_ADDR, 14, true);

  if (Wire.available() >= 14) {
    ax = (Wire.read() << 8) | Wire.read();
    ay = (Wire.read() << 8) | Wire.read();
    az = (Wire.read() << 8) | Wire.read();
    int16_t rawTemp = (Wire.read() << 8) | Wire.read();
    gx = (Wire.read() << 8) | Wire.read();
    gy = (Wire.read() << 8) | Wire.read();
    gz = (Wire.read() << 8) | Wire.read();
  }
}

// ================= CONTROL VARIABLES =================
int activePattern = 0;        // เริ่มต้นด้วย 0 (Off) เพื่อไม่ให้สั่นเอง
int vibrationIntensity = 150; // PWM (0-255)

void mqttCallback(char *topic, byte *payload, unsigned int length) {
  String message = "";
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  if (String(topic) == "sensor/control") {
    if (message.startsWith("P")) {
      int underscoreIndex = message.indexOf('_');
      if (underscoreIndex != -1) {
        activePattern = message.substring(1, underscoreIndex).toInt();
        vibrationIntensity = message.substring(underscoreIndex + 1).toInt();
        Serial.print("Pattern changed to: ");
        Serial.print(activePattern);
        Serial.print(" | Intensity: ");
        Serial.println(vibrationIntensity);
      }
    }
  } else if (message.startsWith("WIFI:")) {
    int secondColon = message.indexOf(':', 5);
    if (secondColon != -1) {
      String newSSID = message.substring(5, secondColon);
      String newPass = message.substring(secondColon + 1);
      Serial.println("Received new WiFi credentials!");
      preferences.begin("wifi", false);
      preferences.putString("ssid", newSSID);
      preferences.putString("password", newPass);
      preferences.end();
      Serial.println("Saved! Restarting ESP32 in 2 seconds...");
      delay(2000);
      ESP.restart();
    }
  }
}
}

void reconnectMQTT() {
  while (!mqttClient.connected() && WiFi.status() == WL_CONNECTED) {
    Serial.print("Attempting MQTT connection...");
    // สุ่ม Client ID
    String clientId = "ESP32Client-";
    clientId += String(random(0xffff), HEX);

    if (mqttClient.connect(clientId.c_str(), mqtt_user, mqtt_password)) {
      Serial.println("MQTT Connected!");
      mqttClient.subscribe("sensor/control");
    } else {
      Serial.print("failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

// ================= SETUP =================
void setup() {
  Serial.begin(115200);
  delay(1000);

  // ตั้งค่าขาขับมอเตอร์สั่นให้ชัดเจน
  pinMode(VIB_MOTOR_PIN, OUTPUT);
  digitalWrite(VIB_MOTOR_PIN, LOW);
  analogReadResolution(12);

  // 1. เชื่อมต่อ WiFi
  preferences.begin("wifi", false);
  String savedSSID = preferences.getString("ssid", "");
  String savedPass = preferences.getString("password", "");
  if (savedSSID.length() > 0) {
    ssid = savedSSID;
    password = savedPass;
  }
  preferences.end();

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid.c_str(), password.c_str());
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  int temp_count = 0;
  while (WiFi.status() != WL_CONNECTED && temp_count < 20) {
    delay(500);
    Serial.print(".");
    temp_count++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Connected!");
    ArduinoOTA.setHostname("ESP32-Health-Monitor");
    ArduinoOTA.begin();

    // 2. ตั้งค่าการเชื่อมต่อคลาวด์ (ทำเมื่อมี WiFi เท่านั้น)
    espClient.setInsecure(); // บังคับข้ามการเช็คใบรับรอง SSL
    mqttClient.setServer(mqtt_server, mqtt_port);
    mqttClient.setCallback(mqttCallback);

    // ซิงค์เวลาโลก (NTP) สำหรับ InfluxDB
    Serial.println("Syncing time...");
    timeSync(TZ_INFO, "pool.ntp.org", "time.nis.gov");

    if (influxClient.validateConnection()) {
      Serial.print("Connected to InfluxDB: ");
      Serial.println(influxClient.getServerUrl());
    } else {
      Serial.print("InfluxDB connection failed: ");
      Serial.println(influxClient.getLastErrorMessage());
    }
  } else {
    Serial.println("\nWiFi Connection Failed! Running offline mode.");
  }

  // 3. เริ่มต้น Sensors
  Wire.begin(21, 22);
  Wire.setClock(100000);

  Serial.println("Initializing MPU6050 (Bypass Mode)...");
  if (!initMPU6050()) {
    Serial.println("MPU6050 Communication Failed!");
  } else {
    Serial.println("MPU6050 Ready!");
  }

  max30205.begin(0x49);
  Serial.println("MAX30205 Ready!");

  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    Serial.println("MAX30105 not found!");
  } else {
    Serial.println("MAX30105 Ready!");
    byte ledBrightness = 60;
    byte sampleAverage = 4;
    byte ledMode = 2;
    int sampleRate = 100;
    int pulseWidth = 411;
    int adcRange = 4096;
    particleSensor.setup(ledBrightness, sampleAverage, ledMode, sampleRate,
                         pulseWidth, adcRange);
    particleSensor.setPulseAmplitudeRed(0x1F);
    particleSensor.setPulseAmplitudeIR(0x1F);
    particleSensor.setPulseAmplitudeGreen(0);
  }

  Serial.println("System All Ready!");
  motorTimer = millis(); // เริ่มจับเวลามอเตอร์
}

// ================= LOOP =================
void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    ArduinoOTA.handle();

    if (!mqttClient.connected()) {
      reconnectMQTT();
    }
    mqttClient.loop();
  }

  long irValue = particleSensor.getIR();
  if (checkForBeat(irValue)) {
    long delta = millis() - lastBeat;
    lastBeat = millis();
    beatsPerMinute = 60 / (delta / 1000.0);
    if (beatsPerMinute > 20 && beatsPerMinute < 255) {
      rates[rateSpot++] = (byte)beatsPerMinute;
      rateSpot %= RATE_SIZE;
      beatAvg = 0;
      for (byte x = 0; x < RATE_SIZE; x++) {
        beatAvg += rates[x];
      }
      beatAvg /= RATE_SIZE;
    }
  }

  // --- 🛠️ ส่วนควบคุมมอเตอร์สั่น 4 รูปแบบ (Non-blocking) ---
  unsigned long currentMillis = millis();

  switch (activePattern) {
  case 0: // Off
    analogWrite(VIB_MOTOR_PIN, 0);
    motorState = false;
    break;

  case 1: // Continuous
    analogWrite(VIB_MOTOR_PIN, vibrationIntensity);
    motorState = true;
    break;

  case 2: // Breathing Sync (Fade in 4s, Fade out 6s)
  {
    long cycleTime = currentMillis % 10000;
    if (cycleTime < 4000) {
      int pwm = map(cycleTime, 0, 4000, 0, vibrationIntensity);
      analogWrite(VIB_MOTOR_PIN, pwm);
    } else {
      int pwm = map(cycleTime, 4000, 10000, vibrationIntensity, 0);
      analogWrite(VIB_MOTOR_PIN, pwm);
    }
    motorState = true;
  } break;

  case 3: // Pulse Waves (Lub-Dub)
  {
    long cycleTime = currentMillis % 1000;
    if (cycleTime < 100) {
      analogWrite(VIB_MOTOR_PIN, vibrationIntensity); // Lub
    } else if (cycleTime < 200) {
      analogWrite(VIB_MOTOR_PIN, 0); // Rest
    } else if (cycleTime < 350) {
      analogWrite(VIB_MOTOR_PIN, vibrationIntensity * 0.7); // Dub
    } else {
      analogWrite(VIB_MOTOR_PIN, 0); // Rest
    }
    motorState = true;
  } break;

  case 4: // Gentle Taps
  {
    long cycleTime = currentMillis % 2000;
    if (cycleTime < 50) {
      analogWrite(VIB_MOTOR_PIN, vibrationIntensity); // Tap
    } else {
      analogWrite(VIB_MOTOR_PIN, 0); // Rest
    }
    motorState = true;
  } break;
  }

  // ---------------------------------------------------------
  // งานที่ 1: การอ่านค่าหลักและส่ง Live Data เข้า MQTT (ทุกๆ 150ms)
  // ---------------------------------------------------------
  if (millis() - lastDisplayTime >= displayInterval) {
    lastDisplayTime = millis();

    int gsrValue = analogRead(GSR_PIN);
    float skinTemp = max30205.readTemperature();

    int16_t ax, ay, az, gx, gy, gz;
    readMPU6050(ax, ay, az, gx, gy, gz);
    float accelX = ax / 16384.0 * 9.80665;
    float accelY = ay / 16384.0 * 9.80665;
    float accelZ = az / 16384.0 * 9.80665;
    float gyroX = gx / 131.0 * 0.01745329251;
    float gyroY = gy / 131.0 * 0.01745329251;
    float gyroZ = gz / 131.0 * 0.01745329251;

    // --- แสดงผลทาง Serial ---
    Serial.print("IR=");
    Serial.print(irValue);
    if (irValue < 50000) {
      Serial.print(" No Finger");
    } else {
      Serial.print(" BPM=");
      Serial.print(beatsPerMinute);
      Serial.print(" Avg BPM=");
      Serial.print(beatAvg);
    }
    Serial.print(" | GSR: ");
    Serial.print(gsrValue);
    Serial.print(" | SkinTemp: ");
    Serial.print(skinTemp);
    Serial.print(" C | Motor: ");
    Serial.println(motorState ? "HIGH" : "LOW");

    // สะสมค่าเพื่อส่งให้ InfluxDB หาค่าเฉลี่ย
    sumBPM += beatsPerMinute;
    sumTemp += skinTemp;
    sumGSR += gsrValue;
    sumIMU += sqrt(accelX * accelX + accelY * accelY +
                   accelZ * accelZ); // สะสมค่า Movement
    sampleCount++;

    // --- ส่ง JSON เข้า MQTT (ส่งตลอดเวลาเมื่อเชื่อมต่อ MQTT ได้) ---
    if (mqttClient.connected()) {
      struct timeval tv;
      gettimeofday(&tv, NULL);
      long long current_time_ms = (tv.tv_sec * 1000LL) + (tv.tv_usec / 1000);
      char tsBuf[32];
      snprintf(tsBuf, sizeof(tsBuf), "%llu", current_time_ms);

      String payload = "{";
      payload += "\"ts\":" + String(tsBuf) + ",";
      payload += "\"bpm\":" + String(beatsPerMinute) + ",";
      payload += "\"avg_bpm\":" + String(beatAvg) + ",";
      payload += "\"temp\":" + String(skinTemp) + ",";
      payload += "\"gsr\":" + String(gsrValue) + ",";
      payload += "\"ax\":" + String(accelX) + ",";
      payload += "\"ay\":" + String(accelY) + ",";
      payload += "\"az\":" + String(accelZ) + ",";
      payload += "\"gx\":" + String(gyroX) + ",";
      payload += "\"gy\":" + String(gyroY) + ",";
      payload += "\"gz\":" + String(gyroZ);
      payload += "}";

      mqttClient.publish(mqtt_topic, payload.c_str());
    }
  }

  // ---------------------------------------------------------
  // งานที่ 2: ส่ง History Data เข้า InfluxDB (ทุกๆ 5 วินาที)
  // ---------------------------------------------------------
  if (millis() - lastInfluxTime >= influxInterval) {
    lastInfluxTime = millis();

    // เช็คว่ามีเน็ตและมีการอ่านค่าเซ็นเซอร์ได้
    if (WiFi.status() == WL_CONNECTED && sampleCount > 0) {

      // หาค่าเฉลี่ยในรอบ 5 วินาที
      float avgBpm5s = sumBPM / sampleCount;
      float avgTemp5s = sumTemp / sampleCount;
      int avgGsr5s = sumGSR / sampleCount;
      float avgImu5s = sumIMU / sampleCount; // เฉลี่ย IMU

      sensorPoint.clearFields();
      sensorPoint.addField("bpm", avgBpm5s);
      sensorPoint.addField("temp", avgTemp5s);
      sensorPoint.addField("gsr", avgGsr5s);
      sensorPoint.addField("imu", avgImu5s); // ส่ง IMU ขึ้น InfluxDB

      // ส่งข้อมูลขึ้น InfluxDB Cloud
      if (!influxClient.writePoint(sensorPoint)) {
        Serial.print("InfluxDB write failed: ");
        Serial.println(influxClient.getLastErrorMessage());
      } else {
        Serial.println("Saved 5s Average to InfluxDB!");
      }

      // รีเซ็ตค่าสะสม
      sumBPM = 0;
      sumTemp = 0;
      sumGSR = 0;
      sumIMU = 0; // รีเซ็ต IMU
      sampleCount = 0;
    }
  }
}