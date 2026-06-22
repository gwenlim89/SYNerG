# Order Stack Cognitive Rounds

Order Stack Cognitive Rounds, presented in the Electron interface as **Kitten Nibbles**, is an NFC memory and sorting game. The complete two-player setup uses two ESP32-C3 MCU sets, four PN532 readers, and two LED strips.

## Identify the two MCU sets

- **MCU 1 / Player 1:** the set with the **white outer casing**.
- **MCU 2 / Player 2:** the set with the **grey outer casing**.

For the normal setup, place the **white MCU set on the left** and the **grey MCU set on the right**.

Each MCU set controls its own two NFC holes and LED strip. The Electron app connects to the two MCU sets through two separate serial ports.

## What you need

- The white MCU 1 set.
- The grey MCU 2 set.
- **Two USB-C data cables**, one for each MCU.
- A desktop computer or Mac with two available USB ports. A USB hub may be used if necessary.
- Node.js and npm installed.
- The correct firmware already uploaded to each MCU.

Use USB-C cables that support data transfer. A charge-only cable may power the MCU but will not create a serial port in Electron.

## Physical setup

1. Put the **white MCU 1 set on the left** side of the game.
2. Put the **grey MCU 2 set on the right** side of the game.
3. Connect the white MCU to the computer using the first USB-C cable.
4. Connect the grey MCU to the computer using the second USB-C cable.
5. Wait a few seconds for both serial devices to appear.

On macOS, the ports normally look similar to:

```text
/dev/cu.usbmodem1101
/dev/cu.usbmodem1201
```

The numbers may be different each time the boards are connected.

## Start the Electron application from Terminal

The firmware is uploaded using **PlatformIO in VS Code**. Terminal is only needed to start the Electron application.

1. Open Terminal.
2. Go to the project folder:

   ```bash
   cd /Users/gwenlim/Documents/Codex/2026-05-20/include-arduino-h-include-wire-h/order-stack-cognitive-rounds
   ```

3. The first time this project is used on a computer, install the Electron dependencies:

   ```bash
   npm install
   ```

4. Start the Electron game:

   ```bash
   npm start
   ```

The Kitten Nibbles window should open automatically. Keep the Terminal window open while the game is running. To stop the application, return to Terminal and press `Control+C`.

## Connect both MCU sets in Electron

1. Click the **settings button** in the top-left corner of the Electron window.
2. Click **Refresh** to load the currently connected serial ports.
3. Under **Player 1**, select the port belonging to the **white MCU set**.
4. Click **Connect P1**.
5. Under **Player 2**, select the other port belonging to the **grey MCU set**.
6. Click **Connect P2**.
7. Confirm that both connection indicators show **Connected**.
8. Close the settings panel and return to the home screen.

Do not select the same serial port for both players.

If you cannot identify which port belongs to each MCU, disconnect one USB-C cable, click **Refresh**, and note which port disappeared. Reconnect it, refresh again, and assign it to the correct player.

### If the sets do not respond correctly

Start with the white set connected as Player 1 on the left and the grey set connected as Player 2 on the right. If the wrong physical set responds, or one side still does not work, swap the two selected serial ports in the Electron settings. If necessary, swap the physical white and grey sets as well, reconnect both ports, and test again.

## Start a game

1. Choose **1 Player** or **2 Players** on the home screen.
2. Enter the player name or names.
3. Press **Start**.
4. Read the instruction screen and press **OK**.
5. Wait for the `3, 2, 1` countdown.

For a one-player game, only Player 1's MCU is required. For a two-player game, both MCU sets must be connected before Start will work.

## How the game works

The complete game has twelve rounds: six memory rounds followed by six sorting rounds. Scanning is disabled during instructions, countdowns, sequence display, transitions, and result screens. The firmware only enables the NFC readers when the Electron game reaches an active input screen.

### Game 1: Memory

- There are six memory rounds.
- The sequence lengths increase as `3, 3, 4, 5, 5, 6`.
- Each round randomly tests either **colours** or **shapes**.
- The game randomly chooses one allowed NFC hole for the round.
- The sequence appears on screen during the memorisation period.
- After the sequence disappears, the player feeds the tokens in the remembered order.
- Only the selected hole is scanned during that round.
- Scanned tokens fill the blank boxes on screen.
- The result screen shows which positions were correct or wrong.

### Game 2: Sorting and executive function

- There are six sorting rounds arranged as three two-round blocks: `2, 2, 2`.
- Both rounds in a block use the same rule type: colour or shape.
- The rule switches between blocks so the game can measure how the player adapts.
- Each hole displays the colour or shape it should receive.
- Each hole requests a random target of one to four tokens.
- Both NFC holes are active during sorting.
- Incorrect placements still count toward the requested total, but reduce accuracy.
- The game records placement correctness, reaction time, switch cost, and perseverative-error patterns for the database.

### Scan and LED feedback

- A successful accepted scan flashes the corresponding LEDs blue and makes the cat eat.
- Memory rounds light the selected hole yellow.
- Colour-sorting rounds light each hole using its required colour.
- A correct round produces green result feedback.
- An incorrect round produces red result feedback.
- The final screen uses a rainbow LED animation.
- A token must normally be removed from the reader before the same token can be accepted again.

## Upload firmware using PlatformIO in VS Code

Upload the firmware through the **PlatformIO extension in VS Code**, not through the Terminal instructions above. The two boards use the same `src/main.cpp` file, but each board must be uploaded separately with the correct `PLAYER_NUM`.

### Open the PlatformIO project

1. Open VS Code.
2. Select **File > Open Folder**.
3. Open the complete `order-stack-cognitive-rounds` folder. Do not open only `src/main.cpp`.
4. Confirm that `platformio.ini` is visible at the top level of the VS Code Explorer.
5. Wait for PlatformIO to finish loading the project.

If the PlatformIO controls do not appear, install the **PlatformIO IDE** extension from the VS Code Extensions panel and reopen the project folder.

### Upload MCU 1: white outer casing

1. Disconnect the grey MCU and connect only the **white MCU** using a USB-C data cable.
2. Open `src/main.cpp` in VS Code.
3. Set the board number near the top of the file:

   ```cpp
   #define PLAYER_NUM 1
   ```

4. Save `src/main.cpp`.
5. Click the **PlatformIO icon** in the VS Code sidebar.
6. Open **Project Tasks**.
7. Open the `esp32-c3-super-mini` environment.
8. Under **General**, click **Upload**.
9. Wait until the VS Code terminal displays `SUCCESS`.
10. Disconnect the white MCU after the upload finishes.

The white board is now configured as MCU 1 / Player 1.

### Upload MCU 2: grey outer casing

1. Connect only the **grey MCU** using a USB-C data cable.
2. Change the board number in `src/main.cpp`:

   ```cpp
   #define PLAYER_NUM 2
   ```

3. Save `src/main.cpp`.
4. In PlatformIO, open **Project Tasks > esp32-c3-super-mini > General**.
5. Click **Upload**.
6. Wait until the VS Code terminal displays `SUCCESS`.

The grey board is now configured as MCU 2 / Player 2.

### After uploading both boards

1. Close any PlatformIO Serial Monitor that is still using either board.
2. Connect both boards to the computer using the two USB-C data cables.
3. Start Electron from Terminal using `npm start`.
4. Connect the white board as **P1** and the grey board as **P2** in the Electron settings.

Only one program can normally use a serial port at a time. If PlatformIO Serial Monitor is open, Electron may be unable to connect to that MCU until the monitor is closed.

## Current firmware pin assignments

Both boards share these SPI pins:

| Signal | ESP32-C3 pin |
| --- | --- |
| PN532 SCK | GPIO4 |
| PN532 MISO | GPIO5 |
| PN532 MOSI | GPIO6 |

MCU-specific pins:

| MCU | Left PN532 SS | Right PN532 SS | LED data |
| --- | ---: | ---: | ---: |
| White MCU 1 | GPIO7 | GPIO2 | GPIO10 |
| Grey MCU 2 | GPIO3 | GPIO9 | GPIO8 |

Each MCU controls eight LEDs divided between its own left and right holes. The exact LED index direction differs between the two builds and is handled automatically by the `PLAYER_NUM` definitions in the firmware.
