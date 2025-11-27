const overlay = document.createElement("div") // Declare overlay variable
const HEADER_HEIGHT = 50 // Declare HEADER_HEIGHT variable
const bot = { name: "Bot Name", id: "bot1" } // Declare bot variable
const startDrag = () => {} // Declare startDrag variable

overlay.style.height = `${HEADER_HEIGHT}px`
overlay.style.pointerEvents = "auto"
overlay.style.transition = "all 0.2s ease-out"

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

overlay.addEventListener("mousedown", startDrag)
