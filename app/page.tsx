"use client"

import { BotInstance } from "@/components/bot-instance"
import { useState } from "react"

export default function Home() {
  const [bots, setBots] = useState([
    {
      id: "bot-0",
      status: "active" as const,
      screenshot: "/bot-instance.jpg",
      ping: 45,
    },
    {
      id: "bot-1",
      status: "active" as const,
      screenshot: "/bot-instance.jpg",
      ping: 52,
    },
  ])

  const handleClose = (botId: string) => {
    setBots((prev) => prev.filter((b) => b.id !== botId))
  }

  const handleRefresh = (botId: string) => {
    console.log(`Refreshing bot ${botId}`)
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Bot Tool</h1>
        <p className="text-gray-400">Tab bar positioning test</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {bots.map((bot) => (
          <div key={bot.id} className="h-96">
            <BotInstance bot={bot} onClose={() => handleClose(bot.id)} onRefresh={() => handleRefresh(bot.id)} />
          </div>
        ))}
      </div>
    </div>
  )
}
