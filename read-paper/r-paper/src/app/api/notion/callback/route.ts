import { NextRequest, NextResponse } from "next/server";

const clientid = process.env.NEXT_PUBLIC_NOTION_CLIENT_ID;
const client_secret = process.env.NOTION_CLIENT_SECRET;

import { client } from "@/db/redis";
import { auth } from "@/auth";
import { storeNotionIntegration } from "@/actions/notion";
export async function GET(req: NextRequest) {
  const session = await auth();
  const code = req.nextUrl.searchParams.get("code");

  const res = await fetch("https://api.notion.com/v1/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Basic " +
        Buffer.from(`${clientid}:${client_secret}`).toString("base64"),
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.NOTION_REDIRECT_URI,
    }),
  });

  const data = await res.json();

  console.log("Token data:", data);

  //  const notionUserId = data.owner?.user?.id
  //  await client.set(`notion:user:${notionUserId}`, JSON.stringify(data));
  // ✅ Add to hash list or use a Redis set
  if (session?.user.id) {
    const integration = await storeNotionIntegration({
      data,
      userId: session.user.id,
    });
    const enrichedData = {
      ...data,
      integrationId: integration.id,
    };

    await client.hset("notion:users", {
      [session.user.id]: JSON.stringify(enrichedData),
    });
  }
  const html = `
    <html>
      <body>
        <script>
          window.opener?.postMessage({ type: 'notion-auth-success' }, "*");
          window.close();
        </script>
        <p>Authentication complete. You can close this window.</p>
      </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}
