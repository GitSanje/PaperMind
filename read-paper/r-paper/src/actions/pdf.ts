"use server";
import { NewHighlightVarient } from "@/components/pdf/pdf-viewer";
import { db } from "@/db/prisma";
import { client } from "@/db/redis";
import axios from "axios";
import { HighlightType } from "@/components/context/globalcontext";
import { setHstatusToRedis } from "./notion";

type StorePdfInput = {
  pdfid: string;
  title: string;
  userId: string;
  fileName?: string;
  url?: string;
  summary?: string;
};

export async function storePDF({
  pdfid,
  title,
  userId,
  fileName,
  url,
  summary,
}: StorePdfInput) {
  try {
    if (!userId || !title) {
      return { error: "Missing required fields", status: false };
    }

    const pdf = await db.pDF.create({
      data: {
        id: pdfid,
        title,
        userId,
        fileName,
        url,
        summary,
      },
    });

    const key = `pdfs:${userId}`;
    await client.hset(key, {
      [pdfid]: JSON.stringify({
        id: pdf.id,
        title: pdf.title,
        userId: pdf.userId,
        fileName: pdf.fileName ?? "",
        url: pdf.url ?? "",
        summary: pdf.summary ?? "",
        createdAt: pdf.createdAt.toISOString(),
      }),
    });

    return {
      success: true,
      status: true,
      pdf,
    };
  } catch (error) {
    console.error("❌ Error storing PDF:", error);
    return {
      error: "Failed to store PDF",
      status: false,
    };
  }
}

export async function getPDFData(pdfid: string, userId: string) {
  const key = `pdfs:${userId}`;
    const data = await client.hget(key, pdfid);

  if (!data) {
    return { exists: false, data: null };
  }

  return { exists: true, data: JSON.parse(data) };
}

export async function storeHighlightToRedis(
  highlight: HighlightType,
  userId: string,
  hid: string,
  pdfid: string
) {
  const key = `highlights:${userId}:${pdfid}`;
  try {
    const {color} = highlight
    await client.hset(key, {
      [hid]: JSON.stringify({
      highlight,
      color
      }),
    });
  } catch (redisError) {
    console.error("Failed to save Google user data to Redis:", redisError);
  }
}

type CreateHighlightInput = {
  pdfId: string;
  highlightData: any;
  userId:string;
  status?: "idle" | "completed" | "error";
};

export async function createHighlight({
  pdfId,
  highlightData,
  userId,
  status = "idle",
}: CreateHighlightInput) {

  try {
      const {id } = highlightData
    await db.highlight.create({
      data: {
        id:id,
        pdfId,
        highlightData,
        status,
      },
    });
  
   await storeHighlightToRedis(highlightData,userId,id, pdfId)
    await setHstatusToRedis(userId,pdfId,id, status)
    return { success: true };
  } catch (error) {
    console.error("Failed to create highlight:", error);
    return { success: false, error: "Could not store highlight." };
  }
}

export async function deleteHighlightDB({
  userId,
  pdfId,
  highlightId,
}: {
  userId: string;
  pdfId: string;
  highlightId: string;
}) {
  try {
    // Delete from PostgreSQL
    await db.highlight.delete({
      where: {
        id: highlightId,
      },
    });

    // Delete from Redis
    const redisKey = `highlights:${userId}:${pdfId}`;
    await client.hdel(redisKey, highlightId);

    return { success: true };
  } catch (error) {
    console.error("❌ Failed to delete highlight:", error);
    return { success: false, error: "Could not delete highlight." };
  }
}


export async function getAllHashDataFromRedis(key: string) {
  const data = await client.hgetall(key);

  if (!data || Object.keys(data).length === 0) {
    return { exists: false, data: null };
  }

  const parsedData = Object.entries(data).map(([_, v]) => {
    const parsed = JSON.parse(v);
    if (parsed.highlight && parsed.color) {
      parsed.highlight.color = parsed.color;
    }
    return parsed.highlight;
  });

  return { exists: true, data: parsedData };
}


/**
 * Updates the color of a highlight in both Prisma (database) and Redis cache.
 *
 * @param userId - The ID of the user.
 * @param pdfId - The ID of the PDF.
 * @param highlightId - The ID of the highlight.
 * @param newColor - The new color value (e.g., "#FFCC00").
 * @returns { success: boolean, error?: string }
 */
export async function updateHColor({
  userId,
  pdfId,
  highlightId,
  newColor,
}: {
  userId: string;
  pdfId: string;
  highlightId: string;
  newColor: string;
}): Promise<{ success: boolean; error?: string }> {
  const redisKey = `highlights:${userId}:${pdfId}`;

  try {
    // ✅ 1. Update in PostgreSQL (Prisma)
    await db.highlight.update({
      where: { id: highlightId },
      data: { color: newColor },
    });

    // ✅ 2. Update in Redis
    await updateHashFieldInRedis({key:redisKey, hashField:highlightId,fieldToUpdate:'color', newValue:newColor })
    

    return { success: true };
  } catch (error) {
    console.error("❌ Failed to update highlight color:", error);
    return { success: false, error: "Failed to update highlight color" };
  }
}



/**
 * Updates a specific field in a Redis-stored  object.
 * Works for both root-level fields and nested fields inside the object.
 *
 * @param {Object} params - Parameters object
 * @param {string} params.key - Redis key (e.g., "highlights:userId:pdfId")
 * @param {string} params.hashField - Field inside the Redis hash (i.e., the highlight ID)
 * @param {string} params.fieldToUpdate - The field name to update (e.g., "color")
 * @param {any} params.newValue - The new value to set
 * @param {boolean} [params.updateNested=true] - Whether to also update the nested field in  object
 * @returns {Promise<{ success: boolean; error?: string }>}
 */
export async function updateHashFieldInRedis({
  key,
  hashField,
  fieldToUpdate,
  newValue,
  updateNested = true,
}: {
  key: string;
  hashField: string;
  fieldToUpdate: string;
  newValue: any;
  updateNested?: boolean;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const raw = await client.hget(key, hashField);

    if (!raw) {
      throw new Error("Highlight not found in Redis");
    }

    const parsed = JSON.parse(raw);

    // Update the main field
    if(  parsed[fieldToUpdate] ){
     parsed[fieldToUpdate] = newValue;
    }
    

    // Optionally update the nested highlight field
    if (updateNested && parsed.highlight) {
      parsed.highlight[fieldToUpdate] = newValue;
    }

    // Save back to Redis
    await client.hset(key, {
      [hashField]: JSON.stringify(parsed),
    });

    return { success: true };
  } catch (err) {
    console.error("❌ Failed to update highlight in Redis:", err);
    return { success: false, error: "Failed to update highlight in Redis" };
  }
}



export async function getHighlightsByUserAndPdfId(userId: string, pdfId: string) {
  try {
    // First, verify the PDF belongs to the user
    const pdf = await db.pDF.findFirst({
      where: {
        id: pdfId,
        userId: userId,
      },
    });

    if (!pdf) {
      return { success: false, error: "PDF not found for this user." };
    }

    // Fetch all highlights associated with this PDF
    const rawHighlights = await db.highlight.findMany({
      where: {
        pdfId: pdfId,
      },
      select: {
        highlightData: true,
        color:true
      },
    });

    const highlights = rawHighlights.map((h) => {
      const data = JSON.parse(h.highlightData as string) as HighlightType
      return {
        ...data,
        color: h.color,
      };
    });

    return { success: true, highlights };
  } catch (error) {
    console.error("❌ Failed to fetch highlights:", error);
    return { success: false, error: "Error fetching highlights" };
  }
}




export async function hashPDF(formData: FormData): Promise<string> {
  const file = formData.get("file") as File;
  const url = formData.get("url") as string;

  let arrayBuffer: ArrayBuffer;

  if (file instanceof File) {
    arrayBuffer = await file.arrayBuffer();
  } else if (url) {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    arrayBuffer = response.data;
  } else {
    throw new Error("No file or URL provided");
  }

  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  return [...new Uint8Array(hashBuffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}


