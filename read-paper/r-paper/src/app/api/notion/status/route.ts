import { type NextRequest, NextResponse } from "next/server"
import { client } from "@/db/redis"

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ connected: false, error: "User ID required" })
  }

  try {
    // Check if user has Notion connection data
    const notionData = await client.hget("notion:users", userId)
   
    if (notionData) {
      const parsedData = JSON.parse(notionData)
      return NextResponse.json({
        connected: true,
        notionData: {
          integrationId:parsedData.integrationId,
          workspace_name: parsedData.workspace_name,
          owner: parsedData.owner,
          access_token: parsedData.access_token ? "***" : null, // Don't expose the actual token
        },
      })
    }

    return NextResponse.json({ connected: false })
  } catch (error) {
    console.error("Error checking Notion status:", error)
    return NextResponse.json({ connected: false, error: "Failed to check status" })
  }
}
