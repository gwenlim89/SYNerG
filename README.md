# Order Stack Cognitive Rounds

Single-MCU Electron game with two PN532 readers and twelve rounds:

- Rounds 1-6 are memory rounds: remember a color or shape sequence and scan through one instructed hole.
- Rounds 7-12 are sorting rounds: place reusable tokens into the left or right hole based on the displayed color or shape.
- Sorting rounds are grouped into pairs. Both rounds in each pair use the same randomized attribute type: color or shape.
- Sorting targets are randomized from one to four scans per hole.

Scanning is disabled during instruction screens, countdowns, memory display, transition screens, and the final screen.
During memory input, only the instructed left or right reader is polled. During sorting input, both readers are polled.
During memory input, two consecutive scans from the same physical tag UID are treated as one scan. Sorting rounds still allow deliberate reuse of the same token.

Game instructions appear once before the first memory round and once before the first sorting round. Each memory sequence is displayed with a large five-second draining clock. A persistent progress bar shows completion across all twelve rounds.

## PN532 SPI wiring

| PN532 pin | ESP32-C3 pin |
| --- | --- |
| SCK | GPIO4 |
| MISO | GPIO5 |
| MOSI | GPIO6 |
| Left reader SS | GPIO7 |
| Right reader SS | GPIO2 |

## LED strip wiring

The game firmware uses the same FastLED setup as the working LED test:

| LED strip input | ESP32-C3 pin |
| --- | --- |
| Data input | GPIO9 |
| 5V | 5V / VBUS |
| GND | GND |

The strip is treated as 16 LEDs:

| LEDs | Game side |
| --- | --- |
| 1-8 | Left hole |
| 9-16 | Right hole |

Memory rounds light the selected side yellow. Each accepted scan flashes that side blue. At the end of a round, the final blue scan shows first, then a perfect round flashes green sparkles and an imperfect round flashes red sparkles. Sorting color rounds light each side using the requested color; sorting shape rounds use soft white. The final screen shows a moving rainbow.

The firmware emits `REMOVED|HOLE:LEFT` or `REMOVED|HOLE:RIGHT` when a tag leaves a reader. This lets the same token be reused immediately after removal without counting a stuck token repeatedly.

## Upload firmware

```bash
pio run -t upload
```

## Run desktop app

```bash
npm install
npm start
```

Open the staff settings button, refresh ports, connect the MCU, close settings, and press **Start Game**.
