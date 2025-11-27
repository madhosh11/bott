"use client"

import type React from "react"

import { useState, useRef } from "react"

interface BotInstanceProps {
  bot: {
    id: string
    status: "active" | "closed"
    screenshot?: string
    ping?: number
  }
  onDragStart?: (e: React.DragEvent, botId: string) => void
  onDragEnd?: () => void
}

const GRID_SIZE = 20 // Grid snap size in pixels

export function BotInstance({ bot, onDragStart, onDragEnd }: BotInstanceProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const tabRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("img")) return // Don't drag if clicking on image

    setIsDragging(true)
    const rect = tabRef.current?.getBoundingClientRect()
    if (!rect) return

    const startX = e.clientX
    const startY = e.clientY

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX
      const deltaY = moveEvent.clientY - startY

      // Snap to grid
      const snappedX = Math.round(deltaX / GRID_SIZE) * GRID_SIZE
      const snappedY = Math.round(deltaY / GRID_SIZE) * GRID_SIZE

      setOffset({ x: snappedX, y: snappedY })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  if (bot.status === "closed") {
    return (
      <div
        ref={tabRef}
        className="relative bg-zinc-950/50 rounded-lg overflow-hidden cursor-move select-none transition-transform duration-150 hover:bg-zinc-950/70"
        style={{
          aspectRatio: "16 / 9",
          transform: isDragging
            ? `translate(${offset.x}px, ${offset.y}px) scale(0.98)`
            : `translate(${offset.x}px, ${offset.y}px)`,
          opacity: 0.6,
        }}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="absolute inset-0 flex items-center justify-center text-gray-600">
          <div className="text-center">
            <p className="text-sm">Tab Closed</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={tabRef}
      className="relative bg-zinc-950 rounded-lg overflow-hidden cursor-move select-none transition-all duration-150 hover:bg-zinc-950/80"
      style={{
        aspectRatio: "16 / 9",
        transform: isDragging
          ? `translate(${offset.x}px, ${offset.y}px) scale(0.98)`
          : `translate(${offset.x}px, ${offset.y}px)`,
        boxShadow: isDragging
          ? "0 20px 40px rgba(0, 0, 0, 0.8)"
          : isHovering
            ? "0 10px 25px rgba(0, 0, 0, 0.5)"
            : "0 4px 12px rgba(0, 0, 0, 0.3)",
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Screenshot Container */}
      <div className="relative bg-zinc-950 flex items-center justify-center w-full h-full">
        {bot.screenshot ? (
          <img
            src={bot.screenshot || "/placeholder.svg"}
            alt="Tab preview"
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="text-gray-600 text-sm">Loading...</div>
        )}
      </div>

      {/* Drag Indicator - Only show when hovering */}
      {isHovering && (
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-lg" />
      )}
    </div>
  )
}
