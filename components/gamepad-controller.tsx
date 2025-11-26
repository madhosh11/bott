"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Gamepad2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react"

interface GamepadControllerProps {
  selectedInstance: string | null
  onInputSend: (input: any) => void
  disabled: boolean
}

export function GamepadController({ selectedInstance, onInputSend, disabled }: GamepadControllerProps) {
  const sendInput = (button: string) => {
    if (disabled) return
    onInputSend({ type: "button", button })
  }

  const sendAxis = (axis: string, value: number) => {
    if (disabled) return
    onInputSend({ type: "axis", axis, value })
  }

  return (
    <Card className="p-6 border-border sticky top-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-semibold text-foreground">Virtual Gamepad</h2>
        {selectedInstance && !disabled && (
          <Badge variant="default" className="text-xs">
            <span className="size-1.5 rounded-full bg-green-500 mr-1.5" />
            Connected
          </Badge>
        )}
      </div>

      {!selectedInstance ? (
        <div className="py-12 text-center">
          <Gamepad2 className="size-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-xs text-muted-foreground">Select an instance to control</p>
        </div>
      ) : disabled ? (
        <div className="py-12 text-center">
          <Gamepad2 className="size-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-xs text-muted-foreground">Instance must be running</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* D-Pad */}
          <div>
            <p className="text-xs text-muted-foreground mb-3">Directional Pad</p>
            <div className="grid grid-cols-3 gap-2 w-fit mx-auto">
              <div />
              <Button size="lg" variant="outline" onClick={() => sendAxis("leftY", -1)} className="size-14">
                <ArrowUp className="size-5" />
              </Button>
              <div />
              <Button size="lg" variant="outline" onClick={() => sendAxis("leftX", -1)} className="size-14">
                <ArrowLeft className="size-5" />
              </Button>
              <div className="size-14 flex items-center justify-center">
                <div className="size-8 rounded-full bg-secondary" />
              </div>
              <Button size="lg" variant="outline" onClick={() => sendAxis("leftX", 1)} className="size-14">
                <ArrowRight className="size-5" />
              </Button>
              <div />
              <Button size="lg" variant="outline" onClick={() => sendAxis("leftY", 1)} className="size-14">
                <ArrowDown className="size-5" />
              </Button>
              <div />
            </div>
          </div>

          {/* Action Buttons */}
          <div>
            <p className="text-xs text-muted-foreground mb-3">Action Buttons</p>
            <div className="grid grid-cols-4 gap-2">
              {["A", "B", "X", "Y"].map((button) => (
                <Button key={button} variant="outline" onClick={() => sendInput(button)} className="h-12 font-semibold">
                  {button}
                </Button>
              ))}
            </div>
          </div>

          {/* Shoulder Buttons */}
          <div>
            <p className="text-xs text-muted-foreground mb-3">Shoulder Buttons</p>
            <div className="grid grid-cols-2 gap-2">
              {["LB", "RB", "LT", "RT"].map((button) => (
                <Button
                  key={button}
                  variant="outline"
                  onClick={() => sendInput(button)}
                  className="h-10 text-xs font-mono"
                >
                  {button}
                </Button>
              ))}
            </div>
          </div>

          {/* Special Buttons */}
          <div>
            <p className="text-xs text-muted-foreground mb-3">Special</p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => sendInput("START")} className="h-10 text-xs">
                START
              </Button>
              <Button variant="outline" onClick={() => sendInput("SELECT")} className="h-10 text-xs">
                SELECT
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
