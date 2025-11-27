"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, X, Maximize2 } from "lucide-react"
import { useState } from "react"

interface BotInstanceProps {
  bot: {
    id: string
    status: "active" | "closed"
    screenshot?: string
    ping?: number
  }
  onClose: () => void
  onRefresh: () => void
}

export function BotInstance({ bot, onClose, onRefresh }: BotInstanceProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const getBotName = () => {
    const parts = bot.id.split("-")
    const index = parts[parts.length - 1]
    return index === "0" ? "Host 1" : `Bot ${Number.parseInt(index) + 1}`
  }

  if (bot.status === "closed") {
    return (
      <Card className="bg-zinc-900 border-red-900/50 aspect-video relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-gray-600">
          <div className="text-center">
            <X className="size-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Tab Closed</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card
      className={`bg-zinc-900 border-red-900/50 transition-all flex flex-col ${
        isFullscreen ? "fixed inset-4 z-50" : "min-h-80"
      }`}
    >
      {/* Title bar */}
      <div className="bg-black/80 border-b border-red-900/50 px-3 py-2 flex items-center justify-between flex-shrink-0 relative z-10">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-white">{getBotName()}</span>
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="outline" className="border-zinc-700 text-gray-400 h-5 px-2">
              99
            </Badge>
            <span className="text-gray-500">PING</span>
            <span className="text-gray-300 font-mono">{bot.ping || "---"}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={onRefresh}
            className="size-7 p-0 hover:bg-zinc-800 text-gray-400 hover:text-white"
          >
            <RefreshCw className="size-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="size-7 p-0 hover:bg-zinc-800 text-gray-400 hover:text-white"
          >
            <X className="size-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="size-7 p-0 hover:bg-zinc-800 text-gray-400 hover:text-white"
          >
            <Maximize2 className="size-3.5" />
          </Button>
        </div>
      </div>

      <div
        className="relative bg-zinc-950 flex items-center justify-center flex-1"
        style={{ minHeight: isFullscreen ? "calc(100vh - 8rem - 48px)" : "300px" }}
      >
        {bot.screenshot ? (
          <img
            src={bot.screenshot || "/placeholder.svg"}
            alt={`${getBotName()} screenshot`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-gray-600 text-sm">Loading...</div>
        )}
      </div>
    </Card>
  )
}
