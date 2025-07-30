"use server";
import { client } from "@/db/redis";
import { HighlightType } from "@/components/context/globalcontext";
import { getGemini } from "./summary_llm";
import { db } from "@/db/prisma";
import { getAllHashDataFromRedis } from "./pdf";
import { createNotionHighlightsBulk, NotionHighlightInput } from "./message";

// Retrieving data stored as JSON string within a hash field
export async function getNotionIntegrationJson(userId: string) {
  const userNotionKey = `notion:users`;
  const fieldKey = userId;

  const jsonString = await client.hget(userNotionKey, fieldKey);

  if (jsonString) {
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse Notion data from Redis:", e);
      return null;
    }
  } else {
    return null;
  }
}

export async function getWorkspaces(userId: string) {
  const userNotionKey = `notion:users`;
  const fieldKey = userId;

  try {
    const notionData = await client.hget(userNotionKey, fieldKey);
    if (notionData) {
      const { access_token } = JSON.parse(notionData);

      // Get user's pages to find a suitable parent
      const searchResponse = await fetch("https://api.notion.com/v1/search", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
          "Notion-Version": "2022-06-28",
        },
        body: JSON.stringify({
          filter: {
            value: "page",
            property: "object",
          },
          page_size: 10,
        }),
      });

      if (!searchResponse.ok) {
        return { error: "Failed to fetch pages", status: false };
      }

      const searchData = await searchResponse.json();

      return {
        success: true,
        pages: searchData.results.map((page: any) => ({
          id: page.id,
          title:
            page.properties?.title?.title?.[0]?.text?.content || "Untitled",
          url: page.url,
        })),
      };
    }
  } catch (error) {
    return { error: "Internal server error", status: false };
  }
}

export type Status = "idle" | "syncing" | "completed" | "error";
export async function uploadHighlights({
  userId,
  highlights,
  pdfId,
  databaseId,
  pdfTitle,
}: {
  userId: string;
  highlights: HighlightType[];
  pdfId: string;
  databaseId: string;
  pdfTitle: string;
}) {
  if (!userId || !highlights || !databaseId) {
    return { error: "Missing required fields", status: false };
  }
  try {
    const notionData = await client.hget("notion:users", userId);
    if (!notionData) {
      return { error: "Notion not connected", status: false };
    }
    const { access_token } = JSON.parse(notionData);

    // Process highlights with AI categorization
    const processedHighlights = await Promise.all(
      highlights.map(async (highlight: any) => {
        // AI categorization
        const aiAnalysis = await categorizeHighlight(
          highlight.content?.text || ""
        );

        return {
          ...highlight,
          aiCategory: aiAnalysis.category,
          aiSummary: aiAnalysis.summary,
          aiInsights: aiAnalysis.insight,
          tags: aiAnalysis.tags,
        };
      })
    );
    let highlightStatus: { id: string; status: Status; pid?: string }[] = [];
    // Create pages in Notion database for each highlight
    const results = await Promise.all(
      processedHighlights.map(async (highlight) => {
        const pageResponse = await fetch("https://api.notion.com/v1/pages", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28",
          },
          body: JSON.stringify({
            parent: {
              database_id: databaseId,
            },
            properties: {
              Highlight: {
                title: [
                  {
                    type: "text",
                    text: {
                      content: highlight.content?.text
                        ? highlight.content.text.substring(0, 100) + "..."
                        : "Highlight",
                    },
                  },
                ],
              },
              Page: {
                number: highlight.position?.pageNumber || 1,
              },
              Color: {
                select: {
                  name: getColorName(highlight.color),
                },
              },
              Category: {
                select: {
                  name: highlight.aiCategory,
                },
              },
              Tags: {
                multi_select: (highlight.tags || []).map((tag: string) => ({
                  name: tag,
                })),
              },
              "AI Analysis": {
                rich_text: [
                  {
                    type: "text",
                    text: {
                      content: highlight.aiSummary,
                    },
                  },
                ],
              },
              Notes: {
                rich_text: [
                  {
                    type: "text",
                    text: {
                      content: highlight.comment?.text || "",
                    },
                  },
                ],
              },
            },
            children: [
              {
                object: "block",
                type: "quote",
                quote: {
                  rich_text: [
                    {
                      type: "text",
                      text: {
                        content: highlight.content?.text || "",
                      },
                    },
                  ],
                },
              },
              {
                object: "block",
                type: "heading_3",
                heading_3: {
                  rich_text: [
                    {
                      type: "text",
                      text: {
                        content: "🤖 AI Insights",
                      },
                    },
                  ],
                },
              },
              {
                object: "block",
                type: "paragraph",
                paragraph: {
                  rich_text: [
                    {
                      type: "text",
                      text: {
                        content: highlight.aiInsights,
                      },
                    },
                  ],
                },
              },
            ],
          }),
        });
        
        if (!pageResponse.ok) {
           console.error(`❌ Notion API failed for highlight ${highlight.id}:`, await pageResponse.text());
          await setHstatusToRedis(userId,pdfId,highlight.id,'error')
          
          highlightStatus.push({
            id: highlight.id,
            status: "error",
            pid:undefined
          });
          return null;
        }

        await setHstatusToRedis(userId,pdfId,highlight.id,'completed')
        const page = await pageResponse.json();
        highlightStatus.push({
          id: highlight.id,
          status: "completed",
          pid: page.id,
        });

        return page;
      })
    );
    const completedIds = new Set(
      highlightStatus.filter((h) => h.status === "completed").map((h) => h.id)
    );

    const successfulPages = results.filter(Boolean);
    const successfulHighlights = processedHighlights.filter((h) =>
      completedIds.has(h.id)
    );
    const data: NotionHighlightInput[] = successfulHighlights.map((h) => {
      const pageId = highlightStatus.find((s) => s.id === h.id)?.pid;

      return {
        highlightData: h,
        pdfId,
        userId,
        hid: h.id,
        notionPageId: pageId, 
        pid: databaseId,
        pdfTitle,
        databaseId,
      };
    });

    await createNotionHighlightsBulk(data);
    return {
      success: true,
      syncedCount: successfulPages.length,
      totalCount: highlights.length,
      pages: successfulPages,
      highlightStatus: highlightStatus.map(({ id, status }) => ({ id, status })),
    };
  } catch (error) {
    return { error: "Internal server error", status: false };
  }
}

const prompt = `
You are an assistant that classifies text highlights from books, articles, and notes.

Analyze the following highlight and return:
1. A short summary (1 sentence)
2. A category from this list: Important Quote, Question, Summary, Citation, Key Concept
3. 2-3 relevant tags
4. A useful AI insight (optional but helpful)

Highlight:
{text}

Return in this JSON format:
{{
  "summary": "...",
  "category": "...",
  "tags": ["...", "..."],
  "insight": "..."
}}
`;

function extractJSON(text: string) {
  const regex = /{[\s\S]*}/;
  const match = text.match(regex);
  return match ? JSON.parse(match[0]) : null;
}
// Helper function to categorize highlights using AI
async function categorizeHighlight(text: string) {
  try {
    const response = await getGemini(prompt, text);

    const json = extractJSON(response as string);

    return json;
  } catch (error) {
    return null;
  }
}

// Helper function to map colors
function getColorName(color: string): string {
  const colorMap: { [key: string]: string } = {
    "#FFEB3B": "Yellow",
    "#4CAF50": "Green",
    "#2196F3": "Blue",
    "#F44336": "Red",
    "#9C27B0": "Purple",
  };
  return colorMap[color] || "Yellow";
}

export async function createDb({
  userId,
  pdfTitle,
  pdfUrl,
  parentPageId,
  integrationId,
}: {
  userId: string;
  pdfTitle: string;
  pdfUrl: string;
  parentPageId: string;
  integrationId: string;
}) {
  try {
    if (!userId) {
      return { error: "User ID required", status: false };
    }

    // Get user's Notion connection data
    const notionData = await client.hget("notion:users", userId);
    if (!notionData) {
      return { error: "Notion not connected", status: false };
    }

    const { access_token } = JSON.parse(notionData);

    // Create a new database for the PDF
    const databaseResponse = await fetch(
      "https://api.notion.com/v1/databases",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
          "Notion-Version": "2022-06-28",
        },
        body: JSON.stringify({
          parent: {
            type: "page_id",
            page_id: parentPageId,
          },
          title: [
            {
              type: "text",
              text: {
                content: `${pdfTitle || "PDF Analysis"} - ${pdfUrl}`,
              },
            },
          ],
          properties: {
            Highlight: {
              title: {},
            },
            Page: {
              number: {},
            },
            Color: {
              select: {
                options: [
                  { name: "Yellow", color: "yellow" },
                  { name: "Green", color: "green" },
                  { name: "Blue", color: "blue" },
                  { name: "Red", color: "red" },
                  { name: "Purple", color: "purple" },
                ],
              },
            },
            Category: {
              select: {
                options: [
                  { name: "Key Concept", color: "blue" },
                  { name: "Important Quote", color: "yellow" },
                  { name: "Question", color: "red" },
                  { name: "Summary", color: "green" },
                  { name: "Citation", color: "purple" },
                ],
              },
            },
            Tags: {
              multi_select: {},
            },
            "AI Analysis": {
              rich_text: {},
            },
            Notes: {
              rich_text: {},
            },
            Created: {
              created_time: {},
            },
          },
          icon: {
            type: "emoji",
            emoji: "📖",
          },
        }),
      }
    );

    if (!databaseResponse.ok) {
      const error = await databaseResponse.text();
      console.error("Notion API error:", error);
      return { error: "Failed to create database", status: false };
    }

    const database = await databaseResponse.json();

    await storeNotionDatabase({
      userId: userId,
      databaseId: database.id,
      databaseUrl: database.url,
      title: `${pdfTitle || "PDF Analysis"} - ${pdfUrl}`,
      parentPageId: parentPageId ?? "",
      integrationId: integrationId,
    });

    return {
      success: true,
      databaseId: database.id,
      databaseUrl: database.url,
    };
  } catch (error) {
    console.error("Error creating Notion database:", error);
    return { success: false, error: "Internal server error", status: false };
  }
}

export async function createPageWorkspace({
  userId,
  title,
  description,
}: {
  userId: string;
  title: string;
  description?: string;
}) {
  try {
    if (!userId) {
      return { error: "User ID required", status: false };
    }

    // Get user's Notion connection data
    const notionData = await client.hget("notion:users", userId);
    if (!notionData) {
      return { error: "Notion not connected", status: false };
    }

    const { access_token } = JSON.parse(notionData);

    const pageResponse = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        parent: { type: "workspace", workspace: true },
        icon: {
          type: "emoji",
          emoji: "📁",
        },
        properties: {
          title: [
            {
              type: "text",
              text: {
                content: title || "AI Highlights Home",
              },
            },
          ],
          children: description
            ? [
                {
                  object: "block",
                  type: "paragraph",
                  paragraph: {
                    rich_text: [
                      {
                        type: "text",
                        text: {
                          content: description,
                        },
                      },
                    ],
                  },
                },
              ]
            : [],
        },
      }),
    });

    if (!pageResponse.ok) {
      const error = await pageResponse.text();
      console.error("Notion API error:", error);
      return { succes: false, error: "Failed to create page", status: 500 };
    }

    const page = await pageResponse.json();

    return {
      success: true,
      pageId: page.id,
      pageUrl: page.url,
    };
  } catch (error) {
    console.error("Error creating Notion page:", error);
    return { succes: false, error: "Internal server error", status: 500 };
  }
}

export async function storeNotionIntegration({
  data,
  userId,
}: {
  data: any;
  userId: string;
}) {
  if (!data.access_token || !data.workspace_id) {
    throw new Error("Missing Notion data fields");
  }

  const integration = await db.notionIntegration.upsert({
    where: { userId },
    update: {
      accessToken: data.access_token,
      workspaceId: data.workspace_id,
      workspaceName: data.workspace_name ?? null,
      botId: data.bot_id ?? null,
      notionUserId: data.owner?.user?.id ?? null,
      notionEmail: data.owner?.user?.person?.email ?? null,
      notionName: data.owner?.user?.name ?? null,
      rawData: data,
    },
    create: {
      userId,
      accessToken: data.access_token,
      workspaceId: data.workspace_id,
      workspaceName: data.workspace_name ?? null,
      botId: data.bot_id ?? null,
      notionUserId: data.owner?.user?.id ?? null,
      notionEmail: data.owner?.user?.person?.email ?? null,
      notionName: data.owner?.user?.name ?? null,
      rawData: data,
    },
  });

  return integration;
}

interface StoreDBParams {
  userId: string;
  integrationId: string;
  databaseId: string;
  databaseUrl: string;
  title?: string;
  parentPageId?: string;
}

export async function storeNotionDatabase({
  userId,
  databaseId,
  databaseUrl,
  title,
  parentPageId,
  integrationId,
}: StoreDBParams) {
  try {
    if (!userId || !databaseId || !databaseUrl) {
      return { status: false, error: "Required fields missing" };
    }

    // Store the database ID for this user and PDF
    await client.hset(`notion:databases:${userId}`, {
      [integrationId]: JSON.stringify({
        databaseId,
        databaseUrl,
        title,
        parentPageId,
      }),
    });

    await db.notionPageDB.create({
      data: {
        id: databaseId,
        userId,
        databaseId,
        databaseUrl,
        title,
        parentPageId,
        integrationId: integrationId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to store Notion DB:", error);
    return { success: false, error: "Database storage error" };
  }
}

export interface FetchedNotionData {
  integration: any | null;
  databases: any | null;
}

export async function getNotionIntegrationAndDB(userId: string): Promise<{
  success: boolean;
  notiondata?: FetchedNotionData;
  error?: string;
}> {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required" };
    }

    // Fetch integration with related Notion DBs from Prisma
    // const integration = await db.notionIntegration.findUnique({
    //   where: { userId },
    //   include: {
    //     NotionPageDB: true, // Assumes relation name is correct
    //   },
    // });
    const notionKey = `notion:users`;
    const rawIntegration = await client.hget(notionKey, userId);
    if (!rawIntegration) {
      return {
        success: false,
        notiondata: {
          integration: null,
          databases: null,
        },
      };
    }
    const parsedIntegration = JSON.parse(rawIntegration);
    // // Fetch Redis-stored databases
    const dbKey = `notion:databases:${userId}`;
    const integrationId = parsedIntegration.integrationId;
    const rawDatabase = await client.hget(dbKey, integrationId);
   console.log(rawDatabase,dbKey,integrationId);
   
    const parsedDatabase = rawDatabase ? JSON.parse(rawDatabase) : null;
    if (!parsedDatabase) {
      return {
        success: true,
        notiondata: {
          integration: parsedIntegration,
          databases: null,
        },
      };
    }

    return {
      success: true,
      notiondata: {
        integration: parsedIntegration,
        databases: parsedDatabase,
      },
    };
  } catch (err) {
    console.error("❌ Error fetching Notion integration and DB:", err);
    return {
      success: false,
      error: "Failed to retrieve Notion data",
    };
  }
}

export async function getAllHightlightsStatus(userId: string, pdfId: string) {
  try {
    const highlightStatus = await client.hgetall(`hstatus:${userId}:${pdfId}`);
    const result = Object.entries(highlightStatus).map(([id, status]) => ({
      id,
      status: status as Status,
    }));
    return result;
  } catch (error) {
    return null;
  }
}

export async function setHstatusToRedis(userId: string, pdfId: string, hid:string,status:Status) {
      const hkey = `hstatus:${userId}:${pdfId}`;
      await client.hset(hkey, hid, status);
}