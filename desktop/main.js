const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const database = require("./database");

// The renderer plays background music on load; this lets Electron autoplay it
// without waiting for the first screen click.
app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");

// Main-process state. The main process owns serial ports and the database so
// the renderer can stay sandboxed and talk through IPC only.
let mainWindow;
let activePort;
let port2;
let databaseReady;

// Create the game window and load the pixel-art renderer.
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 960,
    minHeight: 700,
    title: "Order Stack",
    backgroundColor: "#fffdf9",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, "renderer", "index.html"));
}

// Initialize SQLite first so the UI can save participants/scores immediately.
app.whenReady().then(async () => {
  databaseReady = database.initDatabase();

  try {
    await databaseReady;
  } catch (error) {
    console.error("Database setup failed:", error);
  }

  createWindow();
});

// Release serial ports before quitting so PlatformIO/serial monitor can reopen them.
app.on("window-all-closed", () => {
  closePort();

  if (process.platform !== "darwin") {
    app.quit();
  }
});

// List available USB serial devices for the staff settings panel.
ipcMain.handle("serial:list", async () => {
  const ports = await SerialPort.list();

  return ports.map((port) => ({
    path: port.path,
    friendlyName: [port.path, port.manufacturer].filter(Boolean).join(" - ")
  }));
});

// Connect Player 1's MCU and forward each newline-delimited firmware event to the renderer.
ipcMain.handle("serial:connect", async (_event, portPath) => {
  await closePort();

  activePort = new SerialPort({
    path: portPath,
    baudRate: 115200,
    autoOpen: false
  });

  await new Promise((resolve, reject) => {
    activePort.open((error) => error ? reject(error) : resolve());
  });

  const parser = activePort.pipe(new ReadlineParser({ delimiter: "\n" }));

  parser.on("data", (line) => send("serial:line", line.trim()));
  activePort.on("error", (error) => send("serial:error", error.message));
  activePort.on("close", () => send("serial:closed"));

  send("serial:line", `CONNECTED|PORT:${portPath}`);
  return { path: portPath };
});

// Send scan/LED commands from the renderer to Player 1's firmware.
ipcMain.handle("serial:write", async (_event, text) => {
  if (!activePort?.isOpen) {
    throw new Error("Serial port is not connected.");
  }

  await new Promise((resolve, reject) => {
    activePort.write(text, (error) => error ? reject(error) : resolve());
  });
});

// Database IPC handlers expose the persistent participant/session store to the UI.
ipcMain.handle("db:path", async () => {
  await databaseReady;
  return database.dbPath;
});

ipcMain.handle("db:list-participants", async () => {
  await databaseReady;
  return database.listParticipants();
});

ipcMain.handle("db:get-leaderboard", async (_event, limit) => {
  await databaseReady;
  return database.getLeaderboard(limit);
});

ipcMain.handle("db:save-participant", async (_event, participant) => {
  await databaseReady;
  return database.saveParticipant(participant);
});

ipcMain.handle("db:get-or-create-participant", async (_event, name) => {
  await databaseReady;
  return database.getOrCreateParticipant(name);
});

ipcMain.handle("db:save-game-session", async (_event, payload) => {
  await databaseReady;
  return database.saveGameSession(payload);
});

ipcMain.handle("db:create-match", async () => {
  await databaseReady;
  return database.createMatch();
});

// Connect Player 2's MCU for two-player mode and forward its events separately.
ipcMain.handle("serial:connect-p2", async (_event, portPath) => {
  if (port2?.isOpen) {
    const p = port2;
    port2 = null;
    await new Promise((resolve) => p.close(() => resolve()));
  }

  port2 = new SerialPort({ path: portPath, baudRate: 115200, autoOpen: false });

  await new Promise((resolve, reject) => {
    port2.open((error) => error ? reject(error) : resolve());
  });

  const parser = port2.pipe(new ReadlineParser({ delimiter: "\n" }));
  parser.on("data", (line) => send("serial:line-p2", line.trim()));
  port2.on("error", (error) => send("serial:error-p2", error.message));
  port2.on("close", () => send("serial:closed-p2"));

  send("serial:line-p2", `CONNECTED|PORT:${portPath}`);
  return { path: portPath };
});

// Send scan/LED commands from the renderer to Player 2's firmware.
ipcMain.handle("serial:write-p2", async (_event, text) => {
  if (!port2?.isOpen) {
    throw new Error("P2 serial port is not connected.");
  }

  await new Promise((resolve, reject) => {
    port2.write(text, (error) => error ? reject(error) : resolve());
  });
});

// Close any open serial ports; used before reconnecting and during app shutdown.
async function closePort() {
  const toClose = [activePort, port2].filter((p) => p?.isOpen);
  activePort = null;
  port2 = null;
  await Promise.all(toClose.map((p) => new Promise((resolve) => p.close(() => resolve()))));
}

// Safely forward main-process events to the renderer if the window still exists.
function send(channel, payload) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, payload);
  }
}
