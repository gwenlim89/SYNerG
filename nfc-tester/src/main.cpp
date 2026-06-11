#include <Arduino.h>
#include <SPI.h>
#include <Adafruit_PN532.h>

// ── Pin definitions — matches main game wiring ────────────────────
#define PN532_SCK   4
#define PN532_MISO  5
#define PN532_MOSI  6
#define PN532_SS    3   // left scanner; change to 9 for right scanner

Adafruit_PN532 nfc(PN532_SS, &SPI);

#define MAX_TAGS 64
static uint8_t seenUids[MAX_TAGS][7];
static uint8_t seenLens[MAX_TAGS];
static uint8_t seenCount = 0;

static bool alreadySeen(uint8_t *uid, uint8_t len) {
  for (uint8_t i = 0; i < seenCount; i++) {
    if (seenLens[i] != len) continue;
    bool match = true;
    for (uint8_t j = 0; j < len; j++) {
      if (seenUids[i][j] != uid[j]) { match = false; break; }
    }
    if (match) return true;
  }
  return false;
}

static void remember(uint8_t *uid, uint8_t len) {
  if (seenCount >= MAX_TAGS) return;
  seenLens[seenCount] = len;
  for (uint8_t j = 0; j < len; j++) seenUids[seenCount][j] = uid[j];
  seenCount++;
}

static void printTagsLine(uint8_t *uid, uint8_t len) {
  Serial.print("  \"");
  for (uint8_t i = 0; i < len; i++) {
    if (uid[i] < 0x10) Serial.print("0");
    Serial.print(uid[i], HEX);
    if (i < len - 1) Serial.print(":");
  }
  Serial.println("\": { name: \"???\", color: \"???\", shape: \"???\" },");
}

void setup() {
  Serial.begin(115200);
  delay(1500);

  Serial.println();
  Serial.println("==============================");
  Serial.println("  NFC Tag UID Collector");
  Serial.println("==============================");
  Serial.println("Scan tokens one at a time.");
  Serial.println("Each new UID prints one line");
  Serial.println("ready to paste into TAGS.");
  Serial.println("Duplicates are ignored.");
  Serial.println("------------------------------");

  SPI.begin(PN532_SCK, PN532_MISO, PN532_MOSI);
  nfc.begin();

  uint32_t ver = nfc.getFirmwareVersion();
  if (!ver) {
    Serial.println("ERROR: PN532 not found. Check wiring and SS pin.");
    while (1) delay(500);
  }

  nfc.SAMConfig();
  nfc.setPassiveActivationRetries(0x01);

  Serial.print("PN532 ready. Firmware v");
  Serial.print((ver >> 16) & 0xFF);
  Serial.print(".");
  Serial.println((ver >> 8) & 0xFF);
  Serial.println();
  Serial.println("const TAGS = {");
}

void loop() {
  uint8_t uid[7];
  uint8_t uidLen = 0;

  bool found = nfc.readPassiveTargetID(PN532_MIFARE_ISO14443A, uid, &uidLen, 500);

  if (!found) return;
  if (alreadySeen(uid, uidLen)) { delay(600); return; }

  remember(uid, uidLen);
  printTagsLine(uid, uidLen);
  delay(600);
}
