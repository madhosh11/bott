import { type NextRequest, NextResponse } from "next/server"
import puppeteer, { type Browser, type Page } from "puppeteer"

// Store browser instances in memory
const instances = new Map<string, { browser: Browser; page: Page }>()

export async function POST(request: NextRequest) {
  try {
    const { instanceId, url, profileId } = await request.json()

    // Launch Chrome with isolated profile
    const browser = await puppeteer.launch({
      headless: false, // Run with visible browser
      args: [
        `--user-data-dir=/tmp/chrome-profile-${profileId}`, // Separate profile directory
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-web-security", // For testing purposes
        "--disable-features=IsolateOrigins,site-per-process",
        "--disable-component-extensions-with-background-pages",
        "--disable-default-apps",
        "--disable-extensions",
        "--disable-preconnect",
        "--disable-sync",
      ],
    })

    const page = await browser.newPage()

    // Enable virtual gamepad
    await page.evaluateOnNewDocument(() => {
      // Inject virtual gamepad API
      const gamepadState = {
        connected: true,
        id: "Virtual Gamepad",
        index: 0,
        mapping: "standard",
        timestamp: Date.now(),
        axes: [0, 0, 0, 0],
        buttons: Array(17).fill({ pressed: false, touched: false, value: 0 }),
      }

      // Override navigator.getGamepads
      const originalGetGamepads = navigator.getGamepads.bind(navigator)
      navigator.getGamepads = () => [gamepadState, null, null, null]

      // Store gamepad state globally for external control
      ;(window as any).__virtualGamepad = gamepadState
    })

    // Navigate to URL
    await page.goto(url, { waitUntil: "networkidle2" })

    // Store instance
    instances.set(instanceId, { browser, page })

    return NextResponse.json({ success: true, instanceId })
  } catch (error) {
    console.error("[v0] Launch error:", error)
    return NextResponse.json({ error: "Failed to launch Chrome instance" }, { status: 500 })
  }
}
