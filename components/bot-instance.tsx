"use client"
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
      <div className="flex flex-col items-center justify-center h-full rounded-lg border border-zinc-700 bg-zinc-900">
        <div className="text-gray-400">Tab Closed</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950 rounded-lg border border-zinc-700 overflow-hidden">
      {/* Title bar */}
      <div className="flex items-center justify-between bg-zinc-900 px-3 py-2 border-b border-zinc-700 flex-shrink-0">
        <span className="text-sm font-medium text-white">{getBotName()}</span>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            99 PING
          </Badge>
          <Badge variant="outline" className="text-xs">
            {bot.ping || "---"}
          </Badge>
        </div>

        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={onRefresh}
            className="size-7 p-0 hover:bg-zinc-800 text-gray-400 hover:text-white"
          >
            <RefreshCw className="size-4" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="size-7 p-0 hover:bg-zinc-800 text-gray-400 hover:text-white"
          >
            <Maximize2 className="size-4" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="size-7 p-0 hover:bg-zinc-800 text-gray-400 hover:text-white"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden pt-20">
        {bot.screenshot ? (
          <img src={bot.screenshot || "/placeholder.svg"} alt={getBotName()} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">Loading...</div>
        )}
      </div>
    </div>
  )
}
