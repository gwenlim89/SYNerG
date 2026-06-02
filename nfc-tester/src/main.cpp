/*
 * NFC Tag Multi-Tester
 * Board  : Arduino Uno
 * Module : PN532 NFC/RFID (I2C mode)
 *
 * ================================================================
 *  WIRING DIAGRAM
 * ================================================================
 *  PN532 pin    →   Arduino Uno pin
 * ----------------------------------------------------------------
 *  VCC          →   5V  (most breakout boards are 5V tolerant;
 *                        check your module — some are 3.3V only)
 *  GND          →   GND
 *  SDA          →   A4
 *  SCL          →   A5
 *  IRQ          →   D2  (optional — used for faster detection)
 *  RSTO         →   D3  (optional — used for hardware reset)
 *
 *  *** IMPORTANT: set the PN532 to I2C mode ***
 *  On Adafruit breakout: SEL0 = LOW, SEL1 = HIGH
 *  On many cheap modules: two solder jumpers labeled I2C / SPI / HSU
 *  Consult your specific module's datasheet if unsure.
 *
 *  I2C is chosen here over SPI because:
 *   - Only 2 data wires (vs 4 for SPI)
 *   - Avoids sharing pin 13 (SCK in SPI) with the onboard LED
 * ================================================================
 *
 * HOW TO DISCOVER AND REGISTER NEW TAG UIDs
 * ================================================================
 *  1. Open Serial Monitor at 115200 baud.
 *  2. Tap an unregistered tag — the output will show:
 *       [12345 ms]  UID: DE:AD:BE:EF  (4 bytes)  *** UNKNOWN TAG ***
 *  3. Copy the hex bytes (e.g. DE, AD, BE, EF) and the byte count.
 *  4. Add a new row to knownTags[] below:
 *       { {0xDE, 0xAD, 0xBE, 0xEF, 0x00, 0x00, 0x00}, 4, "My Object", 0 },
 *     - Fill from left; pad the remaining bytes with 0x00.
 *     - Set uidLen to match the byte count printed (usually 4 or 7).
 *     - Give it a descriptive label string.
 *     - Leave scanCount as 0 — it auto-increments at runtime.
 *  5. Re-flash and test.
 * ================================================================
 */

#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_PN532.h>

// ── Pin definitions ────────────────────────────────────────────────
#define PN532_IRQ   2
#define PN532_RESET 3
#define LED_PIN     13

// ── PN532 instance (I2C mode: pass IRQ + RESET pins) ───────────────
Adafruit_PN532 nfc(PN532_IRQ, PN532_RESET);

// ── Tag registry ───────────────────────────────────────────────────
// Replace the placeholder UIDs below with real ones you discover.
// UIDs are up to 7 bytes; for shorter UIDs pad with 0x00 on the right
// and set uidLen to the actual length.
struct TagEntry {
  uint8_t  uid[7];
  uint8_t  uidLen;
  const char* label;
  uint32_t scanCount;
};

TagEntry knownTags[] = {
  // uid bytes (7 slots),                              len  label           scans
  { {0xDE, 0xAD, 0xBE, 0xEF, 0x00, 0x00, 0x00},       4, "Red Object",    0 },
  { {0x12, 0x34, 0x56, 0x78, 0x00, 0x00, 0x00},        4, "Blue Object",   0 },
  { {0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF, 0x00},        7, "Green Object",  0 },
};
const uint8_t TAG_COUNT = sizeof(knownTags) / sizeof(knownTags[0]);

// Minimum milliseconds between successive reads of the same tag.
// Prevents the same physical tap registering twice.
static const uint16_t READ_HOLDOFF_MS = 1000;

// ── Helper: print UID as colon-separated hex ───────────────────────
static void printUID(const uint8_t* uid, uint8_t len) {
  for (uint8_t i = 0; i < len; i++) {
    if (uid[i] < 0x10) Serial.print('0');
    Serial.print(uid[i], HEX);
    if (i < len - 1) Serial.print(':');
  }
}

// ── Helper: byte-level UID comparison ─────────────────────────────
static bool uidMatches(const uint8_t* a, uint8_t aLen,
                       const uint8_t* b, uint8_t bLen) {
  if (aLen != bLen) return false;
  for (uint8_t i = 0; i < aLen; i++) {
    if (a[i] != b[i]) return false;
  }
  return true;
}

// ── LED blink patterns ─────────────────────────────────────────────
// 3 quick flashes → known tag
static void blinkKnown() {
  for (uint8_t i = 0; i < 3; i++) {
    digitalWrite(LED_PIN, HIGH); delay(80);
    digitalWrite(LED_PIN, LOW);  delay(80);
  }
}

// 1 long flash → unknown tag
static void blinkUnknown() {
  digitalWrite(LED_PIN, HIGH); delay(600);
  digitalWrite(LED_PIN, LOW);
}

// ── Setup ──────────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);

  Serial.println(F("\n============================="));
  Serial.println(F("   NFC Tag Multi-Tester"));
  Serial.println(F("============================="));
  Serial.println(F("Initializing PN532 over I2C..."));

  nfc.begin();

  uint32_t ver = nfc.getFirmwareVersion();
  if (!ver) {
    Serial.println(F("ERROR: PN532 not found."));
    Serial.println(F("  - Check VCC/GND wiring"));
    Serial.println(F("  - Confirm SDA→A4, SCL→A5"));
    Serial.println(F("  - Confirm module is in I2C mode (check jumpers)"));
    while (1) {
      // Fast blink to signal hardware fault
      digitalWrite(LED_PIN, HIGH); delay(100);
      digitalWrite(LED_PIN, LOW);  delay(100);
    }
  }

  Serial.print(F("PN532 found. Firmware v"));
  Serial.print((ver >> 16) & 0xFF, DEC);
  Serial.print('.');
  Serial.println((ver >> 8) & 0xFF, DEC);

  nfc.SAMConfig();  // put PN532 into normal operating mode

  Serial.print(F("Registered tags: "));
  Serial.println(TAG_COUNT);
  Serial.println(F("Tap a tag to begin...\n"));
}

// ── Main loop ──────────────────────────────────────────────────────
void loop() {
  uint8_t uid[7];
  uint8_t uidLen = 0;

  // Block up to 500 ms waiting for a Mifare / ISO14443A tag.
  // Returns true when a tag is in range.
  bool detected = nfc.readPassiveTargetID(
      PN532_MIFARE_ISO14443A, uid, &uidLen, 500);

  if (!detected) return;

  // ── Print timestamp + raw UID ────────────────────────────────────
  Serial.print(F("["));
  Serial.print(millis());
  Serial.print(F(" ms]  UID: "));
  printUID(uid, uidLen);
  Serial.print(F("  ("));
  Serial.print(uidLen);
  Serial.print(F(" bytes)"));

  // ── Look up in registry ─────────────────────────────────────────
  TagEntry* match = nullptr;
  for (uint8_t i = 0; i < TAG_COUNT; i++) {
    if (uidMatches(uid, uidLen, knownTags[i].uid, knownTags[i].uidLen)) {
      match = &knownTags[i];
      break;
    }
  }

  if (match) {
    match->scanCount++;
    Serial.print(F("  Label: \""));
    Serial.print(match->label);
    Serial.print(F("\"  Scans: "));
    Serial.println(match->scanCount);
    blinkKnown();
  } else {
    Serial.println(F("  *** UNKNOWN TAG — add UID to knownTags[] to register ***"));
    blinkUnknown();
  }

  // Hold-off prevents double-counting while the tag stays in field
  delay(READ_HOLDOFF_MS);
}
