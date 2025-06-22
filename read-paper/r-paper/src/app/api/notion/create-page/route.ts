
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  try {
    const { token, parent_page_id, title, content } = await req.json();

    if (!token || !parent_page_id || !title) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const res = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        parent: { type: "page_id", page_id: parent_page_id },
        properties: {
          // Corrected: Directly use the 'title' property type for the page's title
          title: [
            {
              text: {
                content: title,
              },
            },
          ],
        },
        children: [
          {
            object: "block",
            type: "paragraph",
            paragraph: {
              rich_text: [
                {
                  type: "text",
                  text: {
                    content: content || "", // fallback to empty string if content is undefined
                  },
                },
              ],
            },
          },
        ],
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Notion API error:", data);
      return NextResponse.json({ error: "Failed to create page", details: data }, { status: res.status });
    }

    return NextResponse.json({ message: "Page created", page: data });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}