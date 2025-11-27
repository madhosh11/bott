"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BotInstance } from "@/components/bot-instance"
import { LaunchDialog } from "@/components/launch-dialog"

interface BotTab {
  id: string
  status: "active" | "closed"
  screenshot?: string
  ping?: number
}

declare global {
  interface Window {
    electronAPI?: {
      launchBots: (count: number) => Promise<{ success: boolean; bots?: any[]; error?: string }>
      closeBot: (botId: string) => Promise<{ success: boolean; error?: string }>
      reopenBot: (botId: string) => Promise<{ success: boolean; bot?: any; error?: string }>
      refreshBot: (botId: string) => Promise<{ success: boolean; error?: string }>
      toggleAutoMovement: (enabled: boolean) => Promise<{ success: boolean; error?: string }>
      onScreenshotsUpdate: (callback: (updates: any[]) => void) => void
    }
  }
}

export default function ChromeControlPanel() {
  const [showLaunchDialog, setShowLaunchDialog] = useState(true)
  const [autoMovement, setAutoMovement] = useState(false)
  const [bots, setBots] = useState<BotTab[]>([])
  const [closedBots, setClosedBots] = useState<string[]>([])
  const [isElectron, setIsElectron] = useState(false)

  useEffect(() => {
    setIsElectron(typeof window !== "undefined" && !!window.electronAPI)
  }, [])

  useEffect(() => {
    if (!isElectron || !window.electronAPI) return

    window.electronAPI.onScreenshotsUpdate((updates) => {
      setBots((prev) =>
        prev.map((bot) => {
          const update = updates.find((u: any) => u.id === bot.id)
          if (update) {
            return { ...bot, screenshot: update.screenshot, ping: update.ping }
          }
          return bot
        }),
      )
    })
  }, [isElectron])

  const initializeBots = async (count: number) => {
    if (!isElectron || !window.electronAPI) {
      console.error("[v0] Electron API not available")
      return
    }

    const result = await window.electronAPI.launchBots(count)
    if (result.success && result.bots) {
      setBots(result.bots.map((bot: any) => ({ ...bot, screenshot: "" })))
      setShowLaunchDialog(false)
    } else {
      console.error("[v0] Failed to launch bots:", result.error)
    }
  }

  const closeBot = async (botId: string) => {
    if (!isElectron || !window.electronAPI) return

    const result = await window.electronAPI.closeBot(botId)
    if (result.success) {
      setBots((prev) => prev.filter((b) => b.id !== botId))
      setClosedBots((prev) => [...prev, botId])
    }
  }

  const reopenBot = async () => {
    if (closedBots.length === 0 || !isElectron || !window.electronAPI) return

    const lastClosedId = closedBots[closedBots.length - 1]
    const result = await window.electronAPI.reopenBot(lastClosedId)

    if (result.success && result.bot) {
      setBots((prev) => [...prev, { ...result.bot, screenshot: "" }])
      setClosedBots((prev) => prev.slice(0, -1))
    }
  }

  const refreshBot = async (botId: string) => {
    if (!isElectron || !window.electronAPI) return

    await window.electronAPI.refreshBot(botId)
  }

  const toggleAutoMovement = async () => {
    if (!isElectron || !window.electronAPI) return

    const newState = !autoMovement
    const result = await window.electronAPI.toggleAutoMovement(newState)

    if (result.success) {
      setAutoMovement(newState)
    }
  }

  if (showLaunchDialog) {
    return <LaunchDialog onLaunch={initializeBots} isElectron={isElectron} />
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="border-b border-red-900/50 bg-black/95 backdrop-blur">
        <div className="px-6 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-white">Hellcat Lobby Tool</h1>
          <div className="flex items-center gap-6 text-xs font-mono">
            <span className="text-gray-400">
              FPS <span className="text-white">N/A</span>
            </span>
            <span className="text-gray-400">
              GPU <span className="text-white">0%</span>
            </span>
            <span className="text-gray-400">
              CPU <span className="text-white">0%</span>
            </span>
            <span className="text-gray-400">
              LAT <span className="text-white">N/A</span>
            </span>
          </div>
        </div>
      </header>

      <div className="border-b border-red-900/50 bg-black/95 backdrop-blur">
        <div className="px-6 py-4 flex items-center gap-4 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAutoMovement}
            className={`border-red-600/50 ${autoMovement ? "bg-red-600/20 text-red-400" : "text-gray-300"} hover:bg-red-600/30`}
          >
            Auto Movement: {autoMovement ? "ON" : "OFF"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled
            className="border-red-600/50 text-gray-500 hover:bg-red-600/30 bg-transparent"
          >
            Field Upgrades: OFF
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled
            className="border-red-600/50 text-gray-500 hover:bg-red-600/30 bg-transparent"
          >
            Select Class
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled
            className="border-red-600/50 text-gray-500 hover:bg-red-600/30 bg-transparent"
          >
            Select Region
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled
            className="border-red-600/50 text-gray-500 hover:bg-red-600/30 bg-transparent"
          >
            Mute Tabs
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={reopenBot}
            disabled={closedBots.length === 0}
            className="border-red-600/50 text-gray-300 hover:bg-red-600/30 disabled:opacity-30 bg-transparent"
          >
            +1 Bot
          </Button>

          <Badge variant="outline" className="ml-auto border-red-600/50 text-gray-300">
            {bots.length} Active
          </Badge>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {bots.map((bot) => (
            <div key={bot.id} className="relative">
              <BotInstance bot={bot} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
