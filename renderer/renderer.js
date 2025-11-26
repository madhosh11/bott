let bots = []
const closedBots = []

// DOM Elements
const launchDialog = document.getElementById("launchDialog")
const mainApp = document.getElementById("mainApp")
const botCountInput = document.getElementById("botCount")
const launchBtn = document.getElementById("launchBtn")
const botOverlays = document.getElementById("botOverlays")
const autoMovementBtn = document.getElementById("autoMovementBtn")
const addBotBtn = document.getElementById("addBotBtn")
const autoShootBtn = document.getElementById("autoShootBtn")

// Launch Dialog
launchBtn.addEventListener("click", async () => {
  const count = Number.parseInt(botCountInput.value)
  if (count < 1 || count > 50) {
    alert("Please enter a number between 1 and 50")
    return
  }

  launchBtn.disabled = true
  launchBtn.textContent = "Launching..."

  const result = await window.electronAPI.launchBots(count)

  if (result.success) {
    bots = result.bots
    launchDialog.style.display = "none"
    mainApp.style.display = "flex"
    renderBotOverlays()
  } else {
    alert("Error launching bots: " + result.error)
    launchBtn.disabled = false
    launchBtn.textContent = "Launch Bots"
  }
})

function renderBotOverlays() {
  botOverlays.innerHTML = ""

  const CONTROL_BAR_HEIGHT = 80
  const CONTAINER_PADDING = 16
  const TAB_SPACING = 12
  const HEADER_HEIGHT = 36

  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight

  const availableWidth = windowWidth - CONTAINER_PADDING * 2
  const availableHeight = windowHeight - CONTROL_BAR_HEIGHT - CONTAINER_PADDING * 2

  const cols = Math.ceil(Math.sqrt(bots.length))
  const rows = Math.ceil(bots.length / cols)

  const cellWidth = (availableWidth + TAB_SPACING) / cols
  const cellHeight = (availableHeight + TAB_SPACING) / rows

  const tabWidth = cellWidth - TAB_SPACING
  const tabHeight = cellHeight - TAB_SPACING - HEADER_HEIGHT

  bots.forEach((bot, index) => {
    const col = index % cols
    const row = Math.floor(index / cols)

    const overlay = document.createElement("div")
    overlay.className = "bot-overlay"
    overlay.id = `overlay-${bot.id}`

    const headerTop = Math.round(CONTROL_BAR_HEIGHT + CONTAINER_PADDING + row * cellHeight)
    const viewTop = headerTop + HEADER_HEIGHT

    overlay.style.left = `${Math.round(CONTAINER_PADDING + col * cellWidth)}px`
    overlay.style.top = `${headerTop}px`
    overlay.style.width = `${Math.round(tabWidth)}px`
    overlay.style.height = `${HEADER_HEIGHT}px`
    overlay.style.pointerEvents = "auto"

    overlay.innerHTML = `
      <div class="bot-overlay-header">
        <div class="bot-title">${bot.name}</div>
        <div class="bot-actions">
          <button class="bot-action-btn" onclick="refreshBot('${bot.id}')" title="Refresh">↻</button>
          <button class="bot-action-btn" onclick="minimizeBot('${bot.id}')" title="Minimize">_</button>
          <button class="bot-action-btn" onclick="fullscreenBot('${bot.id}')" title="Fullscreen">⛶</button>
          <button class="bot-action-btn" onclick="closeBot('${bot.id}')" title="Close">✕</button>
        </div>
      </div>
    `

    botOverlays.appendChild(overlay)
  })
}

// Bot control functions
window.refreshBot = async (botId) => {
  await window.electronAPI.refreshBot(botId)
}

window.minimizeBot = async (botId) => {
  await window.electronAPI.minimizeBot(botId)
}

window.fullscreenBot = async (botId) => {
  await window.electronAPI.fullscreenBot(botId)
}

window.closeBot = async (botId) => {
  const botIndex = bots.findIndex((b) => b.id === botId)
  if (botIndex !== -1) {
    const bot = bots[botIndex]
    closedBots.push({ ...bot, index: botIndex })
    bots.splice(botIndex, 1)

    await window.electronAPI.closeBot(botId)
    renderBotOverlays()
  }
}

// Auto Movement Toggle
autoMovementBtn.addEventListener("click", async () => {
  const isActive = autoMovementBtn.dataset.active === "true"
  const newState = !isActive

  const result = await window.electronAPI.toggleAutoMovement(newState)

  if (result.success) {
    autoMovementBtn.dataset.active = newState.toString()
    autoMovementBtn.innerHTML = `
      <span class="status-dot"></span>
      Auto Movement: ${newState ? "ON" : "OFF"}
    `
  }
})

// Add Bot
addBotBtn.addEventListener("click", async () => {
  if (closedBots.length === 0) {
    alert("No closed bots to reopen")
    return
  }

  const lastClosedBot = closedBots[closedBots.length - 1]
  const result = await window.electronAPI.reopenBot(lastClosedBot.id)

  if (result.success) {
    closedBots.pop()
    bots.splice(lastClosedBot.index, 0, result.bot)
    renderBotOverlays()
  }
})

// Auto Shoot Toggle
autoShootBtn.addEventListener("click", async () => {
  const isActive = autoShootBtn.dataset.active === "true"
  const newState = !isActive

  const result = await window.electronAPI.toggleAutoShoot(newState)

  if (result.success) {
    autoShootBtn.dataset.active = newState.toString()
    autoShootBtn.innerHTML = `
      <span class="status-dot"></span>
      Auto Shoot: ${newState ? "ON" : "OFF"}
    `
  }
})

// Handle window resize to update overlay positions
window.addEventListener("resize", () => {
  if (bots.length > 0) {
    renderBotOverlays()
  }
})

// Simulate stats
setInterval(() => {
  document.getElementById("fps").textContent = Math.floor(Math.random() * 10 + 55)
  document.getElementById("gpu").textContent = Math.floor(Math.random() * 20 + 10) + "%"
  document.getElementById("cpu").textContent = Math.floor(Math.random() * 30 + 40) + "%"
}, 2000)
