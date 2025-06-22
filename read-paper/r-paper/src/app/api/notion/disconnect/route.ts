import { type NextRequest, NextResponse } from "next/server"
import { client } from "@/db/redis"

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    // Remove user's Notion connection data
    await client.hdel("notion:users", userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error disconnecting from Notion:", error)
    return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 })
  }
}
