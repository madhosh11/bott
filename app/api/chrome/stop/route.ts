import { type NextRequest, NextResponse } from "next/server"

// Import the instances map (in production, use a proper store like Redis)
const instances = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    const { instanceId } = await request.json()

    const instance = instances.get(instanceId)
    if (!instance) {
      return NextResponse.json({ error: "Instance not found" }, { status: 404 })
    }

    // Close the browser
    await instance.browser.close()
    instances.delete(instanceId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Stop error:", error)
    return NextResponse.json({ error: "Failed to stop Chrome instance" }, { status: 500 })
  }
}
