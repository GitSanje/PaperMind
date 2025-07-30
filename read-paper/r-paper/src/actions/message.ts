"use server"
import { db } from "@/db/prisma";
import { Role, Status } from "@prisma/client";



type NewMessage = {
  role: Role;
  content: string;
  toolCalls?: any;
};

export async function upsertThreadAndMessages({
  threadId,
  pdfId,
  title,
  messages,
}: {
  threadId: string;
  pdfId: string;
  title?: string;
  messages: NewMessage[];
}) {
  try {
    // Step 1: Check if thread exists
    let thread = await db.thread.findUnique({
      where: { threadId },
    });

    // Step 2: Create thread if not found
    if (!thread) {
      thread = await db.thread.create({
        data: {
          threadId,
          pdfId,
          title,
        },
      });
    }

    // Step 3: Insert messages
    if (messages.length > 0) {
      const messageData = messages.map((msg) => ({
        threadId: thread.id,
        role: msg.role,
        content: msg.content,
        toolCalls: msg.toolCalls ?? null,
        createdAt: new Date(),
      }));

      await db.message.createMany({
        data: messageData,
      });
    }

    console.log(`Thread ${threadId} handled successfully.`);
    return thread;
  } catch (error) {
    console.error('❌ Failed to upsert thread and messages (non-transactional):', error);
    throw new Error('Failed to create thread or insert messages.');
  }
}

export async function deleteMessagesByThreadAndPdf(threadId: string, pdfId: string) {
  try {
    const deleted = await db.message.deleteMany({
      where: {
        thread: {
          threadId,
          pdfId,
        },
      },
    });

    console.log(`🗑️ Deleted ${deleted.count} messages for thread ${threadId} and pdf ${pdfId}`);
    return {
      success: true,
      count: deleted.count,
      message: `Deleted ${deleted.count} messages.`,
    };
  } catch (error) {
    console.error("❌ Failed to delete messages:", error);
    return {
      success: false,
      message: "Failed to delete messages.",
      error,
    };
  }
}


export type NotionHighlightInput = {
  pdfTitle: string;
  databaseId: string;
  notionPageId?: string;
  status?: Status; // defaults to "idle"
  highlightData: any;
  userId: string;
  pdfId: string;
  hid: string;
  pid: string;
};

export async function createNotionHighlightsBulk(data: NotionHighlightInput[]) {
  try {
    if (data.length === 0) return { success: true, message: "No data to insert." };

    const records = data.map((item) => ({
      ...item,
      status: item.status ?? "idle", // fallback to default
     
    }));

    const result = await db.notionHighlight.createMany({
      data: records,
      skipDuplicates: true, // avoids crashing on unique constraint (e.g. hid or pid)
    });

    return {
      success: true,
      count: result.count,
      message: `Inserted ${result.count} highlights successfully.`,
    };
  } catch (error) {
    console.error("❌ Failed to insert notion highlights in bulk:", error);
    return {
      success: false,
      message: "Bulk insertion failed.",
      error,
    };
  }
}