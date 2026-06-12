const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("orderStackApi", {
  listPorts: () => ipcRenderer.invoke("serial:list"),
  connect: (portPath) => ipcRenderer.invoke("serial:connect", portPath),
  write: (text) => ipcRenderer.invoke("serial:write", text),
  databasePath: () => ipcRenderer.invoke("db:path"),
  listParticipants: () => ipcRenderer.invoke("db:list-participants"),
  saveParticipant: (participant) => ipcRenderer.invoke("db:save-participant", participant),
  getOrCreateParticipant: (name) => ipcRenderer.invoke("db:get-or-create-participant", name),
  saveGameSession: (payload) => ipcRenderer.invoke("db:save-game-session", payload),
  connectP2: (portPath) => ipcRenderer.invoke("serial:connect-p2", portPath),
  writeP2: (text) => ipcRenderer.invoke("serial:write-p2", text),
  createMatch: () => ipcRenderer.invoke("db:create-match"),
  onLine: (callback) => ipcRenderer.on("serial:line", (_event, line) => callback(line)),
  onLineP2: (callback) => ipcRenderer.on("serial:line-p2", (_event, line) => callback(line)),
  onError: (callback) => ipcRenderer.on("serial:error", (_event, message) => callback(message)),
  onErrorP2: (callback) => ipcRenderer.on("serial:error-p2", (_event, message) => callback(message)),
  onClosed: (callback) => ipcRenderer.on("serial:closed", () => callback()),
  onClosedP2: (callback) => ipcRenderer.on("serial:closed-p2", () => callback())
});
