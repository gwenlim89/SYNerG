#include <Arduino.h>
#include <SPI.h>
#include <Adafruit_PN532.h>
#include <FastLED.h>

// Shared SPI bus for the two PN532 readers.
#define PN532_SCK_PIN    4
#define PN532_MISO_PIN   5
#define PN532_MOSI_PIN   6
#define LEFT_SS_PIN      3
#define RIGHT_SS_PIN     7

// WS2812B NeoPixel strip, data on pin 9.
#define LED_DATA_PIN     9
#define NUM_LEDS         16
#define LED_DURATION_MS  1000

CRGB leds[NUM_LEDS];
unsigned long leftLedOffAt  = 0;
unsigned long rightLedOffAt = 0;

#define READ_TIMEOUT_MS 200
#define SETUP_ATTEMPTS  3

Adafruit_PN532 leftReader(LEFT_SS_PIN, &SPI);
Adafruit_PN532 rightReader(RIGHT_SS_PIN, &SPI);

bool leftReady = false;
bool rightReady = false;
bool scanningEnabled = false;
bool scanLeftEnabled = false;
bool scanRightEnabled = false;
bool leftArmed = false;
bool rightArmed = false;
bool leftTagPresent = false;
bool rightTagPresent = false;

void setupLeds() {
  FastLED.addLeds<WS2812B, LED_DATA_PIN, GRB>(leds, NUM_LEDS);
  FastLED.setBrightness(80);
  FastLED.clear(true);
}

void triggerLed(const char* hole) {
  unsigned long offAt = millis() + LED_DURATION_MS;
  if (strcmp(hole, "LEFT") == 0) {
    for (int i = 0; i < 8; i++) leds[i] = CRGB(255, 20, 147);  // deep pink
    leftLedOffAt = offAt;
  } else {
    for (int i = 8; i < 16; i++) leds[i] = CRGB::Blue;
    rightLedOffAt = offAt;
  }
  FastLED.show();
}

void updateLeds() {
  unsigned long now = millis();
  bool changed = false;
  if (leftLedOffAt && now >= leftLedOffAt) {
    for (int i = 0; i < 8; i++) leds[i] = CRGB::Black;
    leftLedOffAt = 0;
    changed = true;
  }
  if (rightLedOffAt && now >= rightLedOffAt) {
    for (int i = 8; i < 16; i++) leds[i] = CRGB::Black;
    rightLedOffAt = 0;
    changed = true;
  }
  if (changed) FastLED.show();
}

void deselectAllReaders() {
  digitalWrite(LEFT_SS_PIN, HIGH);
  digitalWrite(RIGHT_SS_PIN, HIGH);
  delayMicroseconds(10);
}

void printUid(uint8_t *uid, uint8_t uidLength) {
  for (uint8_t i = 0; i < uidLength; i++) {
    if (uid[i] < 0x10) {
      Serial.print("0");
    }

    Serial.print(uid[i], HEX);

    if (i < uidLength - 1) {
      Serial.print(":");
    }
  }
}

bool initializeReader(Adafruit_PN532 &reader, const char *hole) {
  uint32_t versionData = 0;

  for (int attempt = 1; attempt <= SETUP_ATTEMPTS; attempt++) {
    Serial.print("SETUP|HOLE:");
    Serial.print(hole);
    Serial.print("|ATTEMPT:");
    Serial.println(attempt);

    deselectAllReaders();
    reader.begin();
    deselectAllReaders();
    delay(150);

    versionData = reader.getFirmwareVersion();
    deselectAllReaders();

    if (versionData) {
      break;
    }

    delay(250);
  }

  if (!versionData) {
    Serial.print("OFFLINE|HOLE:");
    Serial.print(hole);
    Serial.println("|REASON:NO_FIRMWARE_RESPONSE");
    return false;
  }

  if (!reader.SAMConfig()) {
    deselectAllReaders();
    Serial.print("OFFLINE|HOLE:");
    Serial.print(hole);
    Serial.println("|REASON:SAM_CONFIG_FAILED");
    return false;
  }

  deselectAllReaders();

  if (!reader.setPassiveActivationRetries(0x01)) {
    deselectAllReaders();
    Serial.print("OFFLINE|HOLE:");
    Serial.print(hole);
    Serial.println("|REASON:RETRY_CONFIG_FAILED");
    return false;
  }

  deselectAllReaders();
  delay(150);

  Serial.print("ONLINE|HOLE:");
  Serial.print(hole);
  Serial.print("|FIRMWARE:");
  Serial.print((versionData >> 16) & 0xFF);
  Serial.print(".");
  Serial.println((versionData >> 8) & 0xFF);

  return true;
}

void setScanningMode(bool leftEnabled, bool rightEnabled) {
  scanLeftEnabled = leftEnabled;
  scanRightEnabled = rightEnabled;
  scanningEnabled = scanLeftEnabled || scanRightEnabled;
  leftArmed = false;
  rightArmed = false;
  leftTagPresent = false;
  rightTagPresent = false;

  Serial.print("SCAN_STATE|VALUE:");
  if (scanLeftEnabled && scanRightEnabled) {
    Serial.println("BOTH");
  } else if (scanLeftEnabled) {
    Serial.println("LEFT");
  } else if (scanRightEnabled) {
    Serial.println("RIGHT");
  } else {
    Serial.println("OFF");
  }
}

void handleSerialCommands() {
  if (!Serial.available()) {
    return;
  }

  String command = Serial.readStringUntil('\n');
  command.trim();

  if (command == "SCAN:BOTH" || command == "SCAN:ON") {
    setScanningMode(true, true);
  } else if (command == "SCAN:LEFT") {
    setScanningMode(true, false);
  } else if (command == "SCAN:RIGHT") {
    setScanningMode(false, true);
  } else if (command == "SCAN:OFF") {
    setScanningMode(false, false);
  } else if (command == "STATUS") {
    Serial.print("STATUS|SCAN_LEFT:");
    Serial.print(scanLeftEnabled ? "ON" : "OFF");
    Serial.print("|SCAN_RIGHT:");
    Serial.print(scanRightEnabled ? "ON" : "OFF");
    Serial.print("|LEFT:");
    Serial.print(leftReady ? "ONLINE" : "OFFLINE");
    Serial.print("|RIGHT:");
    Serial.println(rightReady ? "ONLINE" : "OFFLINE");
  }
}

void pollReader(
  Adafruit_PN532 &reader,
  const char *hole,
  bool readerReady,
  bool &armed,
  bool &tagPresent
) {
  if (!readerReady) {
    return;
  }

  uint8_t uid[7];
  uint8_t uidLength = 0;

  deselectAllReaders();
  bool success = reader.readPassiveTargetID(
    PN532_MIFARE_ISO14443A,
    uid,
    &uidLength,
    READ_TIMEOUT_MS
  );
  deselectAllReaders();

  if (!success) {
    if (!armed) {
      armed = true;
      Serial.print("ARMED|HOLE:");
      Serial.println(hole);
    }

    tagPresent = false;
    return;
  }

  if (!armed || tagPresent) {
    return;
  }

  tagPresent = true;
  Serial.print("SCAN|HOLE:");
  Serial.print(hole);
  Serial.print("|UID:");
  printUid(uid, uidLength);
  Serial.println();
  triggerLed(hole);
}

void setup() {
  Serial.begin(115200);
  delay(2500);

  Serial.println();
  Serial.println("BOOT|DEVICE:ORDER_STACK_COGNITIVE_ROUNDS");

  setupLeds();

  pinMode(LEFT_SS_PIN, OUTPUT);
  pinMode(RIGHT_SS_PIN, OUTPUT);
  deselectAllReaders();

  SPI.begin(
    PN532_SCK_PIN,
    PN532_MISO_PIN,
    PN532_MOSI_PIN
  );

  rightReady = initializeReader(rightReader, "RIGHT");
  leftReady = initializeReader(leftReader, "LEFT");

  Serial.print("READY|LEFT:");
  Serial.print(leftReady ? "ONLINE" : "OFFLINE");
  Serial.print("|RIGHT:");
  Serial.println(rightReady ? "ONLINE" : "OFFLINE");

  setScanningMode(false, false);
}

void loop() {
  handleSerialCommands();
  updateLeds();

  if (scanLeftEnabled) {
    pollReader(leftReader, "LEFT", leftReady, leftArmed, leftTagPresent);
  }

  if (scanRightEnabled) {
    pollReader(rightReader, "RIGHT", rightReady, rightArmed, rightTagPresent);
  }
}
