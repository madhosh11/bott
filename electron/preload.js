const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("electronAPI", {
  launchBots: (count) => ipcRenderer.invoke("launch-bots", count),
  closeBot: (botId) => ipcRenderer.invoke("close-bot", botId),
  reopenBot: (botId) => ipcRenderer.invoke("reopen-bot", botId),
  refreshBot: (botId) => ipcRenderer.invoke("refresh-bot", botId),
  toggleAutoMovement: (enabled) => ipcRenderer.invoke("toggle-auto-movement", enabled),
  toggleAutoShoot: (enabled) => ipcRenderer.invoke("toggle-auto-shoot", enabled),
  minimizeBot: (botId) => ipcRenderer.invoke("minimize-bot", botId),
  fullscreenBot: (botId) => ipcRenderer.invoke("fullscreen-bot", botId),
})
