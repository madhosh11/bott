"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Square, Trash2, Chrome } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChromeInstanceProps {
  instance: {
    id: string
    url: string
    status: "running" | "stopped"
    profileId: number
  }
  isSelected: boolean
  onSelect: () => void
  onStop: () => void
  onStart: () => void
  onDelete: () => void
}

export function ChromeInstance({ instance, isSelected, onSelect, onStop, onStart, onDelete }: ChromeInstanceProps) {
  return (
    <Card
      className={cn(
        "p-4 border transition-all cursor-pointer hover:border-primary/50",
        isSelected ? "border-primary bg-accent/50" : "border-border",
      )}
      onClick={onSelect}
    >
      <div className="flex items-start gap-4">
        <div className="size-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
          <Chrome className="size-5 text-foreground" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-medium text-foreground truncate">Profile {instance.profileId}</h3>
            <Badge variant={instance.status === "running" ? "default" : "secondary"} className="text-xs">
              {instance.status === "running" ? (
                <span className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                  Running
                </span>
              ) : (
                "Stopped"
              )}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground truncate font-mono">{instance.url}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {instance.status === "stopped" ? (
            <Button size="sm" variant="ghost" onClick={onStart}>
              <Play className="size-4" />
            </Button>
          ) : (
            <Button size="sm" variant="ghost" onClick={onStop}>
              <Square className="size-4" />
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={onDelete} className="text-destructive">
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
