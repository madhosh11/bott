import { type NextRequest, NextResponse } from "next/server"

// Import the instances map
const instances = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    const { instanceId, input } = await request.json()

    const instance = instances.get(instanceId)
    if (!instance) {
      return NextResponse.json({ error: "Instance not found" }, { status: 404 })
    }

    // Send gamepad input to the page
    await instance.page.evaluate((inputData: any) => {
      const gamepad = (window as any).__virtualGamepad
      if (!gamepad) return

      if (inputData.type === "button") {
        const buttonMap: Record<string, number> = {
          A: 0,
          B: 1,
          X: 2,
          Y: 3,
          LB: 4,
          RB: 5,
          LT: 6,
          RT: 7,
          SELECT: 8,
          START: 9,
        }

        const buttonIndex = buttonMap[inputData.button]
        if (buttonIndex !== undefined) {
          gamepad.buttons[buttonIndex] = { pressed: true, touched: true, value: 1 }

          // Reset button after 100ms
          setTimeout(() => {
            gamepad.buttons[buttonIndex] = { pressed: false, touched: false, value: 0 }
          }, 100)

          // Dispatch gamepad events
          window.dispatchEvent(new Event("gamepadconnected"))
        }
      } else if (inputData.type === "axis") {
        const axisMap: Record<string, number> = {
          leftX: 0,
          leftY: 1,
          rightX: 2,
          rightY: 3,
        }

        const axisIndex = axisMap[inputData.axis]
        if (axisIndex !== undefined) {
          gamepad.axes[axisIndex] = inputData.value

          // Reset axis after 200ms
          setTimeout(() => {
            gamepad.axes[axisIndex] = 0
          }, 200)
        }
      }

      gamepad.timestamp = Date.now()
    }, input)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Gamepad error:", error)
    return NextResponse.json({ error: "Failed to send gamepad input" }, { status: 500 })
  }
}
