"use client"

import { Card } from "@/components/ui/card"
import { X } from "lucide-react"
import { useState } from "react"

interface BotInstanceProps {
  bot: {
    id: string
    status: "active" | "closed"
    screenshot?: string
    ping?: number
  }
}

export function BotInstance({ bot }: BotInstanceProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

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
    <Card className="bg-zinc-900 border-red-900/50 aspect-video relative overflow-hidden">
      <div className="relative bg-zinc-950 flex items-center justify-center w-full h-full">
        {bot.screenshot ? (
          <img src={bot.screenshot || "/placeholder.svg"} alt="screenshot" className="w-full h-full object-cover" />
        ) : (
          <div className="text-gray-600 text-sm">Loading...</div>
        )}
      </div>
    </Card>
  )
}
