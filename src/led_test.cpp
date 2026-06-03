#ifdef LED_TEST_BUILD

#include <Arduino.h>
#include <FastLED.h>

#define LED_PIN   9
#define NUM_LEDS  16

CRGB leds[NUM_LEDS];

void setup() {
    FastLED.addLeds<WS2812B, LED_PIN, GRB>(leds, NUM_LEDS);
    FastLED.setBrightness(80);
}

void loop() {
    // Fade all LEDs down each frame
    fadeToBlackBy(leds, NUM_LEDS, 40);

    // Randomly spark a new LED
    if (random8() < 80) {
        int i = random16(NUM_LEDS);
        leds[i] = CHSV(random8(), 200, 255);
    }

    FastLED.show();
    delay(30);
}

#endif // LED_TEST_BUILD
