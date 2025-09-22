/*
  IR + Current Detection Controller with No-Load Logging
  -----------------------------------------------------
  - IR occupancy sensor triggers relay to switch room power ON/OFF
  - ACS712 current sensor detects actual load current
  - If no load while power is ON, log event to remote database via HTTP POST
  - Use ESP8266 for WiFi and HTTP requests

  Components:
  - NodeMCU/ESP8266 (replaces Arduino Uno)
  - IR occupancy sensor on D2
  - 5V relay module on D7 (use level shifter)
  - ACS712-20A current sensor on A0
  - Green LED (occupancy) on D5
  - Red LED (current status) on D6

  Wiring:
  IR Sensor VCC   -> 3.3V
  IR Sensor GND   -> GND
  IR Sensor OUT   -> D2

  Relay VCC       -> 5V
  Relay GND       -> GND
  Relay IN        -> D7

  ACS712 VCC      -> 5V
  ACS712 GND      -> GND
  ACS712 OUT      -> A0

  Green LED + (220Ω) -> D5
  Green LED –        -> GND

  Red LED + (220Ω)   -> D6
  Red LED –          -> GND
*/

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

#define IR_PIN        D2
#define RELAY_PIN     D7
#define LED_OCC_PIN   D5
#define LED_CURR_PIN  D6
#define ACS_PIN       A0

// WiFi credentials
const char* ssid     = "Your_SSID";
const char* password = "Your_Password";

// Server endpoint to log no-load events
const char* serverUrl = "http://your-server.com/api/no-load";

const float VCC = 5.0;
const float ADC_MAX = 1023.0;
const float ACS_OFFSET = VCC / 2;      // ~2.5V at zero current
const float SENSITIVITY = 0.100;       // V per A for ACS712-20A
const float CURRENT_THRESHOLD = 0.5;   // amps

void setup() {
  pinMode(IR_PIN, INPUT);
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(LED_OCC_PIN, OUTPUT);
  pinMode(LED_CURR_PIN, OUTPUT);

  digitalWrite(RELAY_PIN, LOW);
  digitalWrite(LED_OCC_PIN, LOW);
  digitalWrite(LED_CURR_PIN, LOW);

  Serial.begin(115200);
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(" connected");
}

void loop() {
  bool occupied = digitalRead(IR_PIN) == HIGH;

  if (occupied) {
    digitalWrite(RELAY_PIN, HIGH);
    digitalWrite(LED_OCC_PIN, HIGH);
    Serial.println("Occupancy detected: Power ON");
  } else {
    digitalWrite(RELAY_PIN, LOW);
    digitalWrite(LED_OCC_PIN, LOW);
    Serial.println("No occupancy: Power OFF");
  }

  delay(100);  // relay stabilization

  // Read ACS712
  int raw = analogRead(ACS_PIN);
  float voltage = (raw / ADC_MAX) * VCC;
  float current = fabs(voltage - ACS_OFFSET) / SENSITIVITY;

  bool loadOn = current > CURRENT_THRESHOLD;

  if (loadOn) {
    digitalWrite(LED_CURR_PIN, HIGH);
    Serial.printf("Load current: %.2f A\n", current);
  } else {
    digitalWrite(LED_CURR_PIN, LOW);
    Serial.println("No significant load current");
    if (occupied) {
      logNoLoadEvent(current);
    }
  }

  delay(500);
}

void logNoLoadEvent(float current) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");

  String payload = "{";
  payload += "\"timestamp\":\"" + String(millis()) + "\",";
  payload += "\"current\":" + String(current, 2) + ",";
  payload += "\"occupied\":true";
  payload += "}";

  int code = http.POST(payload);
  if (code == HTTP_CODE_OK) {
    Serial.println("No-load event logged");
  } else {
    Serial.printf("Logging failed, code: %d\n", code);
  }
  http.end();
}
