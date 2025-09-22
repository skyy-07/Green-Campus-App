/*
  Automatic Room Power Controller with Infrared Occupancy Sensor
  --------------------------------------------------------------
  Switches a relay (electric supply) ON when an infrared (IR) occupancy sensor is triggered.

  Components:
  - Arduino Uno (or compatible)
  - IR occupancy sensor (e.g., IR break‐beam or IR proximity module) connected to digital pin 2
  - 5V relay module connected to digital pin 7
  - (Optional) LED indicator on digital pin 13

  Wiring:
  IR Sensor VCC   -> Arduino 5V
  IR Sensor GND   -> Arduino GND
  IR Sensor OUT   -> Arduino D2

  Relay VCC        -> Arduino 5V
  Relay GND        -> Arduino GND
  Relay IN         -> Arduino D7

  LED (optional):
  + (through 220 Ω resistor) -> Arduino D13
  – -> Arduino GND
*/

#define IR_SENSOR_PIN  2    // IR sensor output
#define RELAY_PIN      7    // Relay module input
#define LED_PIN        13   // Optional LED indicator

void setup() {
  pinMode(IR_SENSOR_PIN, INPUT);
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);

  // Ensure relay and LED are off
  digitalWrite(RELAY_PIN, LOW);
  digitalWrite(LED_PIN, LOW);

  Serial.begin(9600);
  Serial.println("Room Power Controller (IR Sensor) Initialized");
}

void loop() {
  int occupied = digitalRead(IR_SENSOR_PIN);

  if (occupied == HIGH) {
    // IR beam broken or proximity detected: switch ON relay
    digitalWrite(RELAY_PIN, HIGH);
    digitalWrite(LED_PIN, HIGH);
    Serial.println("Occupancy detected: Relay ON");
  } else {
    // No detection: switch OFF relay
    digitalWrite(RELAY_PIN, LOW);
    digitalWrite(LED_PIN, LOW);
    Serial.println("Room empty: Relay OFF");
  }

  delay(100);  // Debounce/delay for sensor stability
}
