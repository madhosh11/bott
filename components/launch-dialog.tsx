"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface LaunchDialogProps {
  onLaunch: (count: number) => void
  isElectron: boolean
}

export function LaunchDialog({ onLaunch, isElectron }: LaunchDialogProps) {
  const [botCount, setBotCount] = useState("10")

  const handleLaunch = () => {
    const count = Number.parseInt(botCount)
    if (count > 0 && count <= 50) {
      onLaunch(count)
    }
  }

  if (!isElectron) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <Card className="bg-zinc-900 border-red-900/50 p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-500 mb-6">Electron Required</h2>
          <p className="text-gray-300 mb-4">
            This application must be run as an Electron desktop app to control Chrome instances.
          </p>
          <p className="text-gray-400 text-sm">
            Please build and run the application using:{" "}
            <code className="bg-zinc-950 px-2 py-1 rounded">npm run dev</code>
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <Card className="bg-zinc-900 border-red-900/50 p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-6">Launch Chrome Bots</h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="botCount" className="text-gray-300">
              Number of Bots
            </Label>
            <Input
              id="botCount"
              type="number"
              min="1"
              max="50"
              value={botCount}
              onChange={(e) => setBotCount(e.target.value)}
              className="mt-1.5 bg-zinc-950 border-zinc-700 text-white"
              placeholder="Enter number (1-50)"
            />
            <p className="text-xs text-gray-500 mt-1">Maximum 50 bots. Each bot will open Xbox Cloud Gaming.</p>
          </div>

          <Button
            onClick={handleLaunch}
            className="w-full bg-red-600 hover:bg-red-700 text-white mt-6"
            disabled={!botCount || Number.parseInt(botCount) < 1 || Number.parseInt(botCount) > 50}
          >
            Launch Bots
          </Button>
        </div>
      </Card>
    </div>
  )
}
