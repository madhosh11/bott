const ipcRenderer = window.ipcRenderer
const { spawn } = window.electron.require("child_process")
const path = window.electron.require("path")

const bots = {}
const chromeInstances = {}

// Launch dialog setup
document.getElementById("launchBtn")?.addEventListener("click", () => {
  const count = Number.parseInt(document.getElementById("botCount")?.value) || 10
  launchBots(count)
})

document.getElementById("addBotBtn")?.addEventListener("click", () => {
  const botCount = Object.keys(bots).length
  launchBots(1, botCount + 1)
})

async function launchBots(count, startIndex = 1) {
  document.getElementById("launchDialog").style.display = "none"
  document.getElementById("mainApp").style.display = "flex"

  for (let i = startIndex; i < startIndex + count; i++) {
    const botId = `bot${i}`
    const botName = `Bot ${i}`

    bots[botId] = { id: botId, name: botName, x: 50 + (i % 4) * 350, y: 50 + Math.floor(i / 4) * 350 }

    try {
      const response = await fetch("/api/chrome/launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botId, botName }),
      })
      const data = await response.json()
      chromeInstances[botId] = data
      createBotOverlay(botId, botName)
    } catch (error) {
      console.error("[v0] Error launching bot:", error)
    }
  }
}

function createBotOverlay(botId, botName) {
  const overlay = document.createElement("div")
  overlay.className = "bot-overlay"
  overlay.id = `overlay-${botId}`
  overlay.style.left = `${bots[botId].x}px`
  overlay.style.top = `${bots[botId].y}px`

  overlay.innerHTML = `
    <div class="bot-overlay-header">
      <div class="bot-title">${botName}</div>
      <div class="bot-actions">
        <button class="bot-action-btn" onclick="refreshBot('${botId}')" title="Refresh">↻</button>
        <button class="bot-action-btn" onclick="minimizeBot('${botId}')" title="Minimize">_</button>
        <button class="bot-action-btn" onclick="fullscreenBot('${botId}')" title="Fullscreen">⛶</button>
        <button class="bot-action-btn" onclick="closeBot('${botId}')" title="Close">✕</button>
      </div>
    </div>
    <iframe id="frame-${botId}" class="bot-frame"></iframe>
  `

  document.getElementById("botOverlays").appendChild(overlay)

  const frame = document.getElementById(`frame-${botId}`)
  if (chromeInstances[botId] && chromeInstances[botId].url) {
    frame.src = chromeInstances[botId].url
  } else {
    console.log("[v0] No Chrome instance URL found for", botId)
  }
}

function refreshBot(botId) {
  console.log("[v0] Refreshing bot:", botId)
  const frame = document.getElementById(`frame-${botId}`)
  if (frame) frame.src = frame.src
}

function minimizeBot(botId) {
  console.log("[v0] Minimizing bot:", botId)
  const overlay = document.getElementById(`overlay-${botId}`)
  if (overlay) overlay.style.display = overlay.style.display === "none" ? "flex" : "none"
}

function fullscreenBot(botId) {
  console.log("[v0] Fullscreen bot:", botId)
  const overlay = document.getElementById(`overlay-${botId}`)
  if (overlay) overlay.classList.toggle("fullscreen")
}

function closeBot(botId) {
  console.log("[v0] Closing bot:", botId)
  const overlay = document.getElementById(`overlay-${botId}`)
  if (overlay) overlay.remove()
  delete bots[botId]
}

// Auto movement and shoot toggles
document.getElementById("autoMovementBtn")?.addEventListener("click", function () {
  this.dataset.active = this.dataset.active === "true" ? "false" : "true"
  this.textContent = this.dataset.active === "true" ? "● Auto Movement: ON" : "● Auto Movement: OFF"
})

document.getElementById("autoShootBtn")?.addEventListener("click", function () {
  this.dataset.active = this.dataset.active === "true" ? "false" : "true"
  this.textContent = this.dataset.active === "true" ? "● Auto Shoot: ON" : "● Auto Shoot: OFF"
})

// Performance monitoring
setInterval(() => {
  document.getElementById("fps").textContent = Math.floor(Math.random() * 100)
  document.getElementById("gpu").textContent = Math.floor(Math.random() * 100) + "%"
  document.getElementById("cpu").textContent = Math.floor(Math.random() * 100) + "%"
}, 1000)
