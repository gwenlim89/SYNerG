const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("orderStackApi", {
  listPorts: () => ipcRenderer.invoke("serial:list"),
  connect: (portPath) => ipcRenderer.invoke("serial:connect", portPath),
  write: (text) => ipcRenderer.invoke("serial:write", text),
  onLine: (callback) => ipcRenderer.on("serial:line", (_event, line) => callback(line)),
  onError: (callback) => ipcRenderer.on("serial:error", (_event, message) => callback(message)),
  onClosed: (callback) => ipcRenderer.on("serial:closed", () => callback())
});

