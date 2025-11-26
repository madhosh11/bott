const { app, BrowserWindow, BrowserView, ipcMain } = require("electron")
const path = require("path")

app.setPath("userData", path.join(app.getPath("appData"), "MadhoshBotTool"))

let mainWindow
const browserViews = new Map()
const closedViews = new Map()
const autoMovementState = {
  enabled: false,
  currentDirection: 0, // 0: forward, 1: right, 2: backward, 3: left
  isMoving: false,
  timeoutId: null,
}
const autoShootState = {
  enabled: false,
  intervalId: null,
}
const viewLayouts = new Map()

const isDev =
  process.env.NODE_ENV === "development" || process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath)

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: "#0a0a0a",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      backgroundThrottling: false,
    },
    frame: true,
    title: "Chrome Multi Controller",
  })

  mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"))

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on("closed", () => {
    mainWindow = null
  })

  mainWindow.on("resize", () => {
    updateAllViewLayouts()
  })
}

app.whenReady().then(createWindow)

app.on("window-all-closed", () => {
  closeAllBots()
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow()
  }
})

function calculateViewBounds(index, totalCount, windowBounds) {
  const CONTROL_BAR_HEIGHT = 80 // Top control bar
  const CONTAINER_PADDING = 16 // Padding around all tabs
  const TAB_SPACING = 12 // Space between tabs
  const HEADER_HEIGHT = 36 // Height of control buttons above each tab

  const windowWidth = windowBounds ? windowBounds.width : mainWindow.getBounds().width
  const windowHeight = windowBounds ? windowBounds.height : mainWindow.getBounds().height

  // Calculate available space
  const availableWidth = windowWidth - CONTAINER_PADDING * 2
  const availableHeight = windowHeight - CONTROL_BAR_HEIGHT - CONTAINER_PADDING * 2

  // Calculate grid layout
  const cols = Math.ceil(Math.sqrt(totalCount))
  const rows = Math.ceil(totalCount / cols)

  // Calculate cell size (each cell includes the tab + spacing)
  const cellWidth = (availableWidth + TAB_SPACING) / cols
  const cellHeight = (availableHeight + TAB_SPACING) / rows

  // Calculate actual tab dimensions (cell minus spacing and header)
  const tabWidth = cellWidth - TAB_SPACING
  const tabHeight = cellHeight - TAB_SPACING - HEADER_HEIGHT

  // Calculate position in grid
  const col = index % cols
  const row = Math.floor(index / cols)

  const x = Math.round(CONTAINER_PADDING + col * cellWidth)
  const y = Math.round(CONTROL_BAR_HEIGHT + CONTAINER_PADDING + row * cellHeight + HEADER_HEIGHT - TAB_SPACING / 2)

  return {
    x,
    y,
    width: Math.round(tabWidth),
    height: Math.round(tabHeight),
  }
}

function updateAllViewLayouts() {
  const activeViews = Array.from(browserViews.values())
  activeViews.forEach((viewData, index) => {
    const bounds = calculateViewBounds(index, activeViews.length, mainWindow.getContentBounds())
    viewData.view.setBounds(bounds)
    viewLayouts.set(viewData.id, { index, bounds })
  })
}

// IPC Handlers
ipcMain.handle("launch-bots", async (event, count) => {
  try {
    const bots = []

    for (let i = 0; i < count; i++) {
      const botId = `bot-${Date.now()}-${i}`
      const botName = i === 0 ? `Host ${i + 1}` : `Bot ${i}`

      const view = new BrowserView({
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          partition: `persist:bot-${botId}`,
          backgroundThrottling: false,
        },
      })

      mainWindow.addBrowserView(view)

      // Calculate and set bounds
      const bounds = calculateViewBounds(i, count, mainWindow.getContentBounds())
      view.setBounds(bounds)

      view.webContents.on("did-finish-load", () => {
        view.webContents.executeJavaScript(`
          let isActive = true;
          function keepAlive() {
            if (isActive) {
              requestAnimationFrame(keepAlive);
            }
          }
          keepAlive();

          // Pointer Lock API Spoofing - Make page think mouse is always locked but keep actual cursor free
          Object.defineProperty(document, 'pointerLockElement', {
            get: function() { return document.documentElement; }
          });
          Object.defineProperty(document, 'webkitPointerLockElement', {
            get: function() { return document.documentElement; }
          });
          Object.defineProperty(document, 'mozPointerLockElement', {
            get: function() { return document.documentElement; }
          });

          // Override requestPointerLock to always "succeed" without actually locking
          Element.prototype.requestPointerLock = function() {
            setTimeout(() => {
              const event = new Event('pointerlockchange');
              document.dispatchEvent(event);
            }, 0);
          };
          Element.prototype.webkitRequestPointerLock = Element.prototype.requestPointerLock;
          Element.prototype.mozRequestPointerLock = Element.prototype.requestPointerLock;

          // Override exitPointerLock to do nothing
          document.exitPointerLock = function() {};
          document.webkitExitPointerLock = function() {};
          document.mozExitPointerLock = function() {};

          // Block pointer lock error events
          const originalDocAddEventListener = document.addEventListener.bind(document);
          document.addEventListener = function(type, listener, options) {
            if (type === 'pointerlockerror' || type === 'webkitpointerlockerror' || type === 'mozpointerlockerror' || type === 'pointerlockchange' && listener.toString().includes('null')) {
              return; // Don't register pointer lock error or "lost lock" listeners
            }
            return originalDocAddEventListener(type, listener, options);
          };

          // Fullscreen API Spoofing - Make page think it's always in fullscreen
          Object.defineProperty(document, 'fullscreenElement', {
            get: function() { return document.documentElement; }
          });
          Object.defineProperty(document, 'webkitFullscreenElement', {
            get: function() { return document.documentElement; }
          });
          Object.defineProperty(document, 'mozFullScreenElement', {
            get: function() { return document.documentElement; }
          });
          Object.defineProperty(document, 'msFullscreenElement', {
            get: function() { return document.documentElement; }
          });
          Object.defineProperty(document, 'fullscreen', {
            get: function() { return true; }
          });
          Object.defineProperty(document, 'webkitIsFullScreen', {
            get: function() { return true; }
          });
          Object.defineProperty(document, 'mozFullScreen', {
            get: function() { return true; }
          });

          // Page Visibility API Spoofing - Make page think it's always visible and focused
          Object.defineProperty(document, 'hidden', {
            get: function() { return false; }
          });
          Object.defineProperty(document, 'webkitHidden', {
            get: function() { return false; }
          });
          Object.defineProperty(document, 'mozHidden', {
            get: function() { return false; }
          });
          Object.defineProperty(document, 'msHidden', {
            get: function() { return false; }
          });
          Object.defineProperty(document, 'visibilityState', {
            get: function() { return 'visible'; }
          });
          Object.defineProperty(document, 'webkitVisibilityState', {
            get: function() { return 'visible'; }
          });

          // Block visibility change events
          const originalAddEventListener = document.addEventListener.bind(document);
          document.addEventListener = function(type, listener, options) {
            if (type === 'visibilitychange' || type === 'webkitvisibilitychange') {
              return; // Don't register visibility change listeners
            }
            return originalAddEventListener(type, listener, options);
          };

          // Window focus spoofing - Make window think it always has focus
          Object.defineProperty(document, 'hasFocus', {
            value: function() { return true; }
          });

          // Block blur events on window
          const originalWindowAddEventListener = window.addEventListener.bind(window);
          window.addEventListener = function(type, listener, options) {
            if (type === 'blur' || type === 'focusout') {
              return; // Don't register blur listeners
            }
            return originalWindowAddEventListener(type, listener, options);
          };

          // Always dispatch focus events, never blur
          const originalDispatchEvent = window.dispatchEvent.bind(window);
          window.dispatchEvent = function(event) {
            if (event.type === 'blur' || event.type === 'focusout') {
              return true; // Block blur events
            }
            return originalDispatchEvent(event);
          };

          // Virtual Gamepad
          window.virtualGamepad = {
            index: 0,
            id: "Virtual Gamepad",
            connected: true,
            timestamp: performance.now(),
            mapping: "standard",
            axes: [0, 0, 0, 0],
            buttons: Array(17).fill().map(() => ({ pressed: false, touched: false, value: 0 }))
          };

          const originalGetGamepads = navigator.getGamepads.bind(navigator);
          navigator.getGamepads = function() {
            const gamepads = originalGetGamepads();
            gamepads[0] = window.virtualGamepad;
            return gamepads;
          };

          console.log("[Virtual Gamepad] Injected successfully");
          console.log("[Fullscreen Spoofing] Page will always think it's in fullscreen");
          console.log("[Visibility Spoofing] Page will always think it's visible and focused");
          console.log("[Pointer Lock Spoofing] Page will think mouse is locked but cursor remains free");
        `)
      })

      view.webContents.loadURL("https://www.xbox.com/play")

      const botData = {
        id: botId,
        name: botName,
        view,
        status: "active",
        index: i,
      }

      browserViews.set(botId, botData)
      viewLayouts.set(botId, { index: i, bounds })
      bots.push({ id: botId, name: botName, status: "active" })

      console.log(`[v0] Launched embedded bot ${botId}`)
    }

    return { success: true, bots }
  } catch (error) {
    console.error("[v0] Error launching bots:", error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle("close-bot", async (event, botId) => {
  try {
    const botData = browserViews.get(botId)
    if (botData) {
      mainWindow.removeBrowserView(botData.view)
      botData.view.webContents.destroy()

      const layout = viewLayouts.get(botId)
      closedViews.set(botId, { ...botData, layout })

      browserViews.delete(botId)
      viewLayouts.delete(botId)

      updateAllViewLayouts()
      console.log(`[v0] Closed bot ${botId}`)
    }
    return { success: true }
  } catch (error) {
    console.error("[v0] Error closing bot:", error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle("reopen-bot", async (event, botId) => {
  try {
    const closedBot = closedViews.get(botId)
    if (closedBot) {
      const view = new BrowserView({
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          partition: `persist:bot-${botId}`,
          backgroundThrottling: false,
        },
      })

      mainWindow.addBrowserView(view)

      const originalIndex = closedBot.layout.index
      const currentCount = browserViews.size
      const bounds = calculateViewBounds(originalIndex, currentCount + 1, mainWindow.getContentBounds())
      view.setBounds(bounds)

      view.webContents.on("did-finish-load", () => {
        view.webContents.executeJavaScript(`
          let isActive = true;
          function keepAlive() {
            if (isActive) {
              requestAnimationFrame(keepAlive);
            }
          }
          keepAlive();

          // Pointer Lock API Spoofing - Make page think mouse is always locked but keep actual cursor free
          Object.defineProperty(document, 'pointerLockElement', {
            get: function() { return document.documentElement; }
          });
          Object.defineProperty(document, 'webkitPointerLockElement', {
            get: function() { return document.documentElement; }
          });
          Object.defineProperty(document, 'mozPointerLockElement', {
            get: function() { return document.documentElement; }
          });

          // Override requestPointerLock to always "succeed" without actually locking
          Element.prototype.requestPointerLock = function() {
            setTimeout(() => {
              const event = new Event('pointerlockchange');
              document.dispatchEvent(event);
            }, 0);
          };
          Element.prototype.webkitRequestPointerLock = Element.prototype.requestPointerLock;
          Element.prototype.mozRequestPointerLock = Element.prototype.requestPointerLock;

          // Override exitPointerLock to do nothing
          document.exitPointerLock = function() {};
          document.webkitExitPointerLock = function() {};
          document.mozExitPointerLock = function() {};

          // Block pointer lock error events
          const originalDocAddEventListener = document.addEventListener.bind(document);
          document.addEventListener = function(type, listener, options) {
            if (type === 'pointerlockerror' || type === 'webkitpointerlockerror' || type === 'mozpointerlockerror' || type === 'pointerlockchange' && listener.toString().includes('null')) {
              return; // Don't register pointer lock error or "lost lock" listeners
            }
            return originalDocAddEventListener(type, listener, options);
          };

          // Fullscreen API Spoofing - Make page think it's always in fullscreen
          Object.defineProperty(document, 'fullscreenElement', {
            get: function() { return document.documentElement; }
          });
          Object.defineProperty(document, 'webkitFullscreenElement', {
            get: function() { return document.documentElement; }
          });
          Object.defineProperty(document, 'mozFullScreenElement', {
            get: function() { return document.documentElement; }
          });
          Object.defineProperty(document, 'msFullscreenElement', {
            get: function() { return document.documentElement; }
          });
          Object.defineProperty(document, 'fullscreen', {
            get: function() { return true; }
          });
          Object.defineProperty(document, 'webkitIsFullScreen', {
            get: function() { return true; }
          });
          Object.defineProperty(document, 'mozFullScreen', {
            get: function() { return true; }
          });

          // Page Visibility API Spoofing - Make page think it's always visible and focused
          Object.defineProperty(document, 'hidden', {
            get: function() { return false; }
          });
          Object.defineProperty(document, 'webkitHidden', {
            get: function() { return false; }
          });
          Object.defineProperty(document, 'mozHidden', {
            get: function() { return false; }
          });
          Object.defineProperty(document, 'msHidden', {
            get: function() { return false; }
          });
          Object.defineProperty(document, 'visibilityState', {
            get: function() { return 'visible'; }
          });
          Object.defineProperty(document, 'webkitVisibilityState', {
            get: function() { return 'visible'; }
          });

          // Block visibility change events
          const originalAddEventListener = document.addEventListener.bind(document);
          document.addEventListener = function(type, listener, options) {
            if (type === 'visibilitychange' || type === 'webkitvisibilitychange') {
              return; // Don't register visibility change listeners
            }
            return originalAddEventListener(type, listener, options);
          };

          // Window focus spoofing - Make window think it always has focus
          Object.defineProperty(document, 'hasFocus', {
            value: function() { return true; }
          });

          // Block blur events on window
          const originalWindowAddEventListener = window.addEventListener.bind(window);
          window.addEventListener = function(type, listener, options) {
            if (type === 'blur' || type === 'focusout') {
              return; // Don't register blur listeners
            }
            return originalWindowAddEventListener(type, listener, options);
          };

          // Always dispatch focus events, never blur
          const originalDispatchEvent = window.dispatchEvent.bind(window);
          window.dispatchEvent = function(event) {
            if (event.type === 'blur' || event.type === 'focusout') {
              return true; // Block blur events
            }
            return originalDispatchEvent(event);
          };

          // Virtual Gamepad
          window.virtualGamepad = {
            index: 0,
            id: "Virtual Gamepad",
            connected: true,
            timestamp: performance.now(),
            mapping: "standard",
            axes: [0, 0, 0, 0],
            buttons: Array(17).fill().map(() => ({ pressed: false, touched: false, value: 0 }))
          };

          const originalGetGamepads = navigator.getGamepads.bind(navigator);
          navigator.getGamepads = function() {
            const gamepads = originalGetGamepads();
            gamepads[0] = window.virtualGamepad;
            return gamepads;
          };
        `)
      })

      view.webContents.loadURL("https://www.xbox.com/play")

      const botData = {
        id: botId,
        name: closedBot.name,
        view,
        status: "active",
        index: originalIndex,
      }

      browserViews.set(botId, botData)
      viewLayouts.set(botId, { index: originalIndex, bounds })
      closedViews.delete(botId)

      updateAllViewLayouts()
      console.log(`[v0] Reopened bot ${botId}`)
      return { success: true, bot: { id: botId, name: closedBot.name, status: "active" } }
    }
    return { success: false, error: "Bot not found in closed bots" }
  } catch (error) {
    console.error("[v0] Error reopening bot:", error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle("refresh-bot", async (event, botId) => {
  try {
    const botData = browserViews.get(botId)
    if (botData && botData.view) {
      botData.view.webContents.reload()
      console.log(`[v0] Refreshed bot ${botId}`)
    }
    return { success: true }
  } catch (error) {
    console.error("[v0] Error refreshing bot:", error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle("toggle-auto-movement", async (event, enabled) => {
  try {
    if (enabled) {
      startAutoMovement()
    } else {
      stopAutoMovement()
    }
    return { success: true }
  } catch (error) {
    console.error("[v0] Error toggling auto movement:", error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle("toggle-auto-shoot", async (event, enabled) => {
  try {
    if (enabled) {
      startAutoShoot()
    } else {
      stopAutoShoot()
    }
    return { success: true }
  } catch (error) {
    console.error("[v0] Error toggling auto shoot:", error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle("minimize-bot", async (event, botId) => {
  try {
    const botData = browserViews.get(botId)
    if (botData) {
      const layout = viewLayouts.get(botId)
      if (layout) {
        layout.minimized = !layout.minimized
        if (layout.minimized) {
          const bounds = botData.view.getBounds()
          layout.previousBounds = { ...bounds }
          botData.view.setBounds({ ...bounds, height: 0 })
        } else {
          if (layout.previousBounds) {
            botData.view.setBounds(layout.previousBounds)
          }
        }
      }
    }
    return { success: true }
  } catch (error) {
    console.error("[v0] Error minimizing bot:", error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle("fullscreen-bot", async (event, botId) => {
  try {
    const botData = browserViews.get(botId)
    if (botData) {
      const layout = viewLayouts.get(botId)
      if (layout) {
        layout.fullscreen = !layout.fullscreen
        if (layout.fullscreen) {
          layout.previousBounds = botData.view.getBounds()
          const windowBounds = mainWindow.getContentBounds()
          botData.view.setBounds({
            x: 0,
            y: 0,
            width: windowBounds.width,
            height: windowBounds.height,
          })
          mainWindow.removeBrowserView(botData.view)
          mainWindow.addBrowserView(botData.view)
        } else {
          if (layout.previousBounds) {
            botData.view.setBounds(layout.previousBounds)
          }
          updateAllViewLayouts()
        }
      }
    }
    return { success: true }
  } catch (error) {
    console.error("[v0] Error toggling fullscreen bot:", error)
    return { success: false, error: error.message }
  }
})

function startAutoMovement() {
  if (autoMovementState.enabled) return

  autoMovementState.enabled = true
  autoMovementState.currentDirection = 0
  console.log("[v0] Starting auto movement cycle")

  performMovementCycle()
}

async function performMovementCycle() {
  if (!autoMovementState.enabled) return

  const directions = [
    { name: "forward", axisX: 0, axisY: -1 }, // LS forward
    { name: "right", axisX: 1, axisY: 0 }, // LS right
    { name: "backward", axisX: 0, axisY: 1 }, // LS backward
    { name: "left", axisX: -1, axisY: 0 }, // LS left
  ]

  const currentDir = directions[autoMovementState.currentDirection]
  console.log(`[v0] Moving ${currentDir.name} for 1.5 seconds`)

  autoMovementState.isMoving = true
  for (const [botId, botData] of browserViews.entries()) {
    if (botData.view && botData.view.webContents) {
      try {
        await botData.view.webContents.executeJavaScript(`
          if (window.virtualGamepad) {
            window.virtualGamepad.axes[0] = ${currentDir.axisX};
            window.virtualGamepad.axes[1] = ${currentDir.axisY};
            window.virtualGamepad.timestamp = performance.now();
            window.dispatchEvent(new Event('gamepadconnected'));
            console.log("[v0] Moving ${currentDir.name}: axes[0]=${currentDir.axisX}, axes[1]=${currentDir.axisY}");
          }
        `)
      } catch (error) {
        console.error(`[v0] Error sending input to bot ${botId}:`, error)
      }
    }
  }

  autoMovementState.timeoutId = setTimeout(async () => {
    console.log(`[v0] Stopping ${currentDir.name} movement`)

    for (const [botId, botData] of browserViews.entries()) {
      if (botData.view && botData.view.webContents) {
        try {
          await botData.view.webContents.executeJavaScript(`
            if (window.virtualGamepad) {
              window.virtualGamepad.axes[0] = 0;
              window.virtualGamepad.axes[1] = 0;
              window.virtualGamepad.timestamp = performance.now();
            }
          `)
        } catch (error) {
          console.error(`[v0] Error resetting axes for bot ${botId}:`, error)
        }
      }
    }

    autoMovementState.isMoving = false

    console.log("[v0] Waiting 5 seconds before next direction")
    autoMovementState.timeoutId = setTimeout(() => {
      autoMovementState.currentDirection = (autoMovementState.currentDirection + 1) % 4

      if (autoMovementState.enabled) {
        performMovementCycle()
      }
    }, 5000)
  }, 1500)
}

function stopAutoMovement() {
  if (!autoMovementState.enabled) return

  autoMovementState.enabled = false

  if (autoMovementState.timeoutId) {
    clearTimeout(autoMovementState.timeoutId)
    autoMovementState.timeoutId = null
  }

  console.log("[v0] Stopped auto movement")

  for (const [botId, botData] of browserViews.entries()) {
    if (botData.view && botData.view.webContents) {
      botData.view.webContents
        .executeJavaScript(`
        if (window.virtualGamepad) {
          window.virtualGamepad.axes[0] = 0;
          window.virtualGamepad.axes[1] = 0;
          window.virtualGamepad.timestamp = performance.now();
        }
      `)
        .catch((error) => {
          console.error(`[v0] Error resetting axes for bot ${botId}:`, error)
        })
    }
  }
}

function startAutoShoot() {
  if (autoShootState.enabled) return

  autoShootState.enabled = true
  console.log("[v0] Starting auto shoot - RT every 30 seconds")

  performAutoShoot()
  autoShootState.intervalId = setInterval(performAutoShoot, 30000)
}

async function performAutoShoot() {
  if (!autoShootState.enabled) return

  console.log("[v0] Sending RT (Right Trigger) press")

  for (const [botId, botData] of browserViews.entries()) {
    if (botData.view && botData.view.webContents) {
      try {
        await botData.view.webContents.executeJavaScript(`
          if (window.virtualGamepad) {
            // Press RT (button 7, axes[5] for trigger value)
            window.virtualGamepad.buttons[7] = { pressed: true, touched: true, value: 1.0 };
            window.virtualGamepad.axes[5] = 1.0;
            window.virtualGamepad.timestamp = performance.now();
            window.dispatchEvent(new Event('gamepadconnected'));
            console.log("[v0] RT pressed");
            
            // Release after 100ms
            setTimeout(() => {
              window.virtualGamepad.buttons[7] = { pressed: false, touched: false, value: 0 };
              window.virtualGamepad.axes[5] = 0;
              window.virtualGamepad.timestamp = performance.now();
              console.log("[v0] RT released");
            }, 100);
          }
        `)
      } catch (error) {
        console.error(`[v0] Error sending RT to bot ${botId}:`, error)
      }
    }
  }
}

function stopAutoShoot() {
  if (!autoShootState.enabled) return

  autoShootState.enabled = false

  if (autoShootState.intervalId) {
    clearInterval(autoShootState.intervalId)
    autoShootState.intervalId = null
  }

  console.log("[v0] Stopped auto shoot")
}

function closeAllBots() {
  for (const [botId, botData] of browserViews.entries()) {
    mainWindow.removeBrowserView(botData.view)
    botData.view.webContents.destroy()
  }
  browserViews.clear()
  viewLayouts.clear()
  stopAutoMovement()
  stopAutoShoot()
}
