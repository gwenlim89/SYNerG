const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

let mainWindow;
let activePort;

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

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  closePort();

  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.handle("serial:list", async () => {
  const ports = await SerialPort.list();

  return ports.map((port) => ({
    path: port.path,
    friendlyName: [port.path, port.manufacturer].filter(Boolean).join(" - ")
  }));
});

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

ipcMain.handle("serial:write", async (_event, text) => {
  if (!activePort?.isOpen) {
    throw new Error("Serial port is not connected.");
  }

  await new Promise((resolve, reject) => {
    activePort.write(text, (error) => error ? reject(error) : resolve());
  });
});

async function closePort() {
  if (!activePort?.isOpen) {
    activePort = null;
    return;
  }

  const port = activePort;
  activePort = null;
  await new Promise((resolve) => port.close(() => resolve()));
}

function send(channel, payload) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, payload);
  }
}

