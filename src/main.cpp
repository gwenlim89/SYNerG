#include <Arduino.h>
#include <SPI.h>
#include <Adafruit_PN532.h>
#include <FastLED.h>

// Shared SPI bus for the two PN532 readers.
#define PN532_SCK_PIN    4
#define PN532_MISO_PIN   5
#define PN532_MOSI_PIN   6
#define LEFT_SS_PIN      3
#define RIGHT_SS_PIN     9

// WS2812B NeoPixel strip, data on pin 9.
#define LED_DATA_PIN     8
#define NUM_LEDS         16
#define LEFT_LED_START   8
#define LEFT_LED_END     16
#define RIGHT_LED_START  0
#define RIGHT_LED_END    8
#define SCAN_FLASH_MS    350
#define RESULT_MS        1600
#define SAME_UID_COOLDOWN_MS 1200

CRGB leds[NUM_LEDS];

enum LedMode {
  LED_MODE_OFF,
  LED_MODE_MEMORY,
  LED_MODE_SORTING,
  LED_MODE_SUCCESS,
  LED_MODE_ERROR,
  LED_MODE_RAINBOW
};

LedMode ledMode = LED_MODE_OFF;
CRGB leftBaseColor = CRGB::Black;
CRGB rightBaseColor = CRGB::Black;
unsigned long leftScanFlashUntil = 0;
unsigned long rightScanFlashUntil = 0;
unsigned long resultUntil = 0;
CRGB resultColor = CRGB::Green;
uint8_t rainbowHue = 0;
unsigned long lastLedFrameAt = 0;

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
uint8_t leftLastUid[7] = {0};
uint8_t rightLastUid[7] = {0};
uint8_t leftLastUidLength = 0;
uint8_t rightLastUidLength = 0;
unsigned long leftLastScanAt = 0;
unsigned long rightLastScanAt = 0;

void setupLeds() {
  FastLED.addLeds<WS2812B, LED_DATA_PIN, GRB>(leds, NUM_LEDS);
  FastLED.setBrightness(80);
  FastLED.clear(true);
}

CRGB colorFromName(String name) {
  name.toUpperCase();

  if (name == "YELLOW") return CRGB(255, 235, 0);
  if (name == "PURPLE") return CRGB(190, 0, 255);
  if (name == "BLUE") return CRGB(0, 95, 255);
  if (name == "RED") return CRGB(255, 0, 0);
  if (name == "GREEN") return CRGB(0, 220, 45);
  if (name == "WHITE") return CRGB(160, 160, 160);

  return CRGB::Black;
}

void fillSection(int start, int end, const CRGB &color) {
  for (int i = start; i < end; i++) {
    leds[i] = color;
  }
}

void renderBaseLeds() {
  fillSection(LEFT_LED_START, LEFT_LED_END, leftBaseColor);
  fillSection(RIGHT_LED_START, RIGHT_LED_END, rightBaseColor);
}

void setLedOff() {
  ledMode = LED_MODE_OFF;
  leftBaseColor = CRGB::Black;
  rightBaseColor = CRGB::Black;
  leftScanFlashUntil = 0;
  rightScanFlashUntil = 0;
  resultUntil = 0;
  FastLED.clear(true);
}

void setMemoryLed(const char *hole) {
  ledMode = LED_MODE_MEMORY;
  leftBaseColor = strcmp(hole, "LEFT") == 0 ? CRGB(255, 185, 0) : CRGB::Black;
  rightBaseColor = strcmp(hole, "RIGHT") == 0 ? CRGB(255, 185, 0) : CRGB::Black;
}

void setSortingLeds(String leftColor, String rightColor) {
  ledMode = LED_MODE_SORTING;
  leftBaseColor = colorFromName(leftColor);
  rightBaseColor = colorFromName(rightColor);
}

void flashScanLed(const char *hole) {
  unsigned long until = millis() + SCAN_FLASH_MS;

  if (strcmp(hole, "LEFT") == 0) {
    leftScanFlashUntil = until;
  } else if (strcmp(hole, "RIGHT") == 0) {
    rightScanFlashUntil = until;
  }
}

void startSuccessLeds() {
  ledMode = LED_MODE_SUCCESS;
  resultColor = CRGB::Green;
  resultUntil = millis() + RESULT_MS;
}

void startErrorLeds() {
  ledMode = LED_MODE_ERROR;
  resultColor = CRGB::Red;
  resultUntil = millis() + RESULT_MS;
}

void startRainbowLeds() {
  ledMode = LED_MODE_RAINBOW;
}

void renderResultLeds() {
  fadeToBlackBy(leds, NUM_LEDS, 45);

  for (int i = 0; i < NUM_LEDS; i++) {
    if (random8() < 80) {
      leds[i] = resultColor;
    }
  }
}

void updateLeds() {
  unsigned long now = millis();

  if (now - lastLedFrameAt < 30) {
    return;
  }

  lastLedFrameAt = now;

  if (ledMode == LED_MODE_SUCCESS || ledMode == LED_MODE_ERROR) {
    renderResultLeds();

    if (resultUntil && now >= resultUntil) {
      resultUntil = 0;
      ledMode = LED_MODE_OFF;
    }

    FastLED.show();
    return;
  }

  if (ledMode == LED_MODE_RAINBOW) {
    fill_rainbow(leds, NUM_LEDS, rainbowHue, 12);
    rainbowHue += 2;
    FastLED.show();
    return;
  }

  renderBaseLeds();

  if (leftScanFlashUntil && now < leftScanFlashUntil) {
    fillSection(LEFT_LED_START, LEFT_LED_END, CRGB::Blue);
  } else if (leftScanFlashUntil && now >= leftScanFlashUntil) {
    leftScanFlashUntil = 0;
  }

  if (rightScanFlashUntil && now < rightScanFlashUntil) {
    fillSection(RIGHT_LED_START, RIGHT_LED_END, CRGB::Blue);
  } else if (rightScanFlashUntil && now >= rightScanFlashUntil) {
    rightScanFlashUntil = 0;
  }

  FastLED.show();
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

bool sameUid(uint8_t *a, uint8_t aLength, uint8_t *b, uint8_t bLength) {
  if (aLength != bLength) {
    return false;
  }

  for (uint8_t i = 0; i < aLength; i++) {
    if (a[i] != b[i]) {
      return false;
    }
  }

  return true;
}

void rememberUid(uint8_t *destination, uint8_t &destinationLength, uint8_t *source, uint8_t sourceLength) {
  destinationLength = sourceLength;

  for (uint8_t i = 0; i < sourceLength; i++) {
    destination[i] = source[i];
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
  leftLastScanAt = 0;
  rightLastScanAt = 0;
  leftLastUidLength = 0;
  rightLastUidLength = 0;

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
  } else if (command == "LED:OFF") {
    setLedOff();
  } else if (command == "LED:MEMORY:LEFT") {
    setMemoryLed("LEFT");
  } else if (command == "LED:MEMORY:RIGHT") {
    setMemoryLed("RIGHT");
  } else if (command == "LED:SCAN:LEFT") {
    flashScanLed("LEFT");
  } else if (command == "LED:SCAN:RIGHT") {
    flashScanLed("RIGHT");
  } else if (command.startsWith("LED:SORT:")) {
    int leftIndex = command.indexOf("LEFT:");
    int rightIndex = command.indexOf(":RIGHT:");

    if (leftIndex >= 0 && rightIndex > leftIndex) {
      String leftColor = command.substring(leftIndex + 5, rightIndex);
      String rightColor = command.substring(rightIndex + 7);
      setSortingLeds(leftColor, rightColor);
    }
  } else if (command == "LED:SUCCESS") {
    startSuccessLeds();
  } else if (command == "LED:ERROR") {
    startErrorLeds();
  } else if (command == "LED:RAINBOW") {
    startRainbowLeds();
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
  bool &tagPresent,
  uint8_t *lastUid,
  uint8_t &lastUidLength,
  unsigned long &lastScanAt
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
    if (tagPresent) {
      tagPresent = false;
      Serial.print("REMOVED|HOLE:");
      Serial.println(hole);
    }

    if (!armed) {
      armed = true;
      Serial.print("ARMED|HOLE:");
      Serial.println(hole);
    }

    return;
  }

  if (!armed || tagPresent) {
    return;
  }

  unsigned long now = millis();

  if (
    lastScanAt &&
    now - lastScanAt < SAME_UID_COOLDOWN_MS &&
    sameUid(uid, uidLength, lastUid, lastUidLength)
  ) {
    tagPresent = true;
    Serial.print("COOLDOWN|HOLE:");
    Serial.print(hole);
    Serial.print("|UID:");
    printUid(uid, uidLength);
    Serial.println();
    return;
  }

  tagPresent = true;
  lastScanAt = now;
  rememberUid(lastUid, lastUidLength, uid, uidLength);

  Serial.print("SCAN|HOLE:");
  Serial.print(hole);
  Serial.print("|UID:");
  printUid(uid, uidLength);
  Serial.println();
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
    pollReader(leftReader, "LEFT", leftReady, leftArmed, leftTagPresent, leftLastUid, leftLastUidLength, leftLastScanAt);
  }

  if (scanRightEnabled) {
    pollReader(rightReader, "RIGHT", rightReady, rightArmed, rightTagPresent, rightLastUid, rightLastUidLength, rightLastScanAt);
  }
}
