
import type { PDFDocumentProxy } from "pdfjs-dist";
import {
  findNumbers,
  LabeledChunks,
  retrieveAllPassageByCiteId,
} from "./utils";
import stringSimilarity from "string-similarity";
import { HighlightType } from "@/components/context/globalcontext";

import { LTWHP, Scaled } from "react-pdf-highlighter";
import { client } from "@/db/redis";
import { NewHighlightVarient } from "@/components/pdf/pdf-viewer";

// Generate a unique ID for highlights
export const getNextId = () => String(Math.random()).slice(2);

type PageTextInfo = {
  pageNumber: number;
  startIndex: number;
  endIndex: number;
  text: string;
};

/**
 * Extracts the full text content from a PDF document and maps each page's
 * text to its character range within the complete text.
 *
 * @param {PDFDocumentProxy} pdfDocument - The PDF document to extract text from.
 * @returns {Promise<{ fullText: string; pageRanges: PageTextInfo[] }>}
 * An object containing the concatenated full text of the PDF and an array of page ranges,
 * where each range includes the page number and the start/end indices of that page’s text in the full text.
 *
 * @example
 * import { getDocument } from "pdfjs-dist"
 *
 * const loadingTask = getDocument("example.pdf")
 * const pdf = await loadingTask.promise
 * const { fullText, pageRanges } = await extractFullTextWithPageRanges(pdf)
 * console.log(fullText) // Full text content of the PDF
 * console.log(pageRanges[0]) // Info about text range on the first page
 */
export async function extractFullTextWithPageRanges(
  pdfDocument: PDFDocumentProxy
): Promise<{ fullText: string; pageRanges: PageTextInfo[] }> {
  const pageRanges: PageTextInfo[] = [];
  let fullText = "";
  const numPages = pdfDocument.numPages;

  for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
    const page = await pdfDocument.getPage(pageNumber);
    const textContent = await page.getTextContent();

    let pageText = "";
    textContent.items.forEach((item: any) => {
      pageText += item.str;
    });

    const startIndex = fullText.length;
    fullText += pageText;
    const endIndex = fullText.length;

    pageRanges.push({
      pageNumber,
      startIndex,
      endIndex,
      text: pageText,
    });
  }

  return { fullText, pageRanges };
}

function normalizeMath(text: string): string {
  return text
    .replace(/\s+/g, " ") // collapse whitespace
    .replace(/[∑Σ]/g, "sum") // unify summation symbols
    .replace(/[⟨⟩]/g, "") // remove inner product symbols
    .replace(/[−–—]/g, "-") // normalize dashes
    .replace(/[∂]/g, "d") // replace partial derivative
    .replace(/[√]/g, "sqrt") // normalize square root
    .replace(/θ/g, "theta") // unify Greek symbols
    .replace(/[^\w\s]/g, "") // strip other symbols
    .trim()
    .toLowerCase();
}
function normalize(text: string): string {
  return normalizeMath(
    text
      .replace(/\s+/g, " ")
      .replace(/\[(\d+(?:,\s*\d+)*)\]/g, " ")
      .trim()
      .toLowerCase()
  );
}

function splitIntoSentences(text: string): string[] {
  return text.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()) ?? [];
}

/**
 * Performs a similarity search for a given text across all pages of a PDF's extracted text.
 * Returns the best matching sentence along with its metadata, including the match score,
 * page number, and character indices.
 *
 * @param {string} searchText - The text to search for within the PDF.
 * @param {PageTextInfo[]} pageRanges - An array of page text data, including page number and text content.
 * @returns {Promise<{
 *   pageNumber: number,
 *   sentence: string,
 *   sentenceIndex: number,
 *   score: number,
 *   startIndex: number,
 *   endIndex: number
 * } | null>} The best matching sentence information or null if no match is found.
 *
 */
export async function similaritySearchInPDF(
  searchText: string,
  pageRanges: PageTextInfo[]
): Promise<{
  pageNumber: number;
  sentence: string;
  sentenceIndex: number;
  score: number;
  startIndex: number;
  endIndex: number;
} | null> {
  const normalizedQuery = normalize(searchText);

  let bestMatch: {
    pageNumber: number;
    sentence: string;
    sentenceIndex: number;
    score: number;
    startIndex: number;
    endIndex: number;
  } | null = null;

  for (const { pageNumber, text } of pageRanges) {
    const sentences = splitIntoSentences(text);

    sentences.forEach((sentence, index) => {
      const normalizedSentence = normalize(sentence);
      const score = stringSimilarity.compareTwoStrings(
        normalizedQuery,
        normalizedSentence
      );

      const startIndex = sentences
        .slice(0, index)
        .reduce((acc, s) => acc + s.length, 0);
      const endIndex = startIndex + sentence.length;

      if (!bestMatch || score > bestMatch.score) {
        bestMatch = {
          pageNumber,
          sentence,
          sentenceIndex: index,
          score,
          startIndex,
          endIndex,
        };
      }
    });
  }

  return bestMatch;
}

interface WIDTH_HEIGHT {
  width: number;
  height: number;
}
/**
 * Converts a rectangle in viewport coordinates to scaled (normalized) coordinates
 *
 * @param rect - The LTWHP rectangle with left, top, width, height, pageNumber
 * @param param1 - The viewport width and height
 * @returns Scaled coordinates (x1, y1, x2, y2) and page info
 */
export const viewportToScaled = (
  rect: LTWHP,
  { width, height }: WIDTH_HEIGHT
): Scaled => {
  return {
    x1: rect.left,
    y1: rect.top,
    x2: rect.left + rect.width,
    y2: rect.top + rect.height,
    width,
    height,
    pageNumber: rect.pageNumber,
  };
};
/**
 * Creates a highlight annotation on a specified page of a PDF document based on text indices.
 * The function finds the position of the text between `startIndex` and `endIndex`, calculates
 * its bounding rectangle and associated metadata, and returns a highlight object.
 *
 * @param {PDFDocumentProxy} pdfDocument - The PDF.js document proxy object.
 * @param {number} pageNumber - The page number (1-based) where the highlight should be created.
 * @param {number} startIndex - The start index of the text to highlight within the page's full text.
 * @param {number} endIndex - The end index (exclusive) of the text to highlight.
 * @param {string} idvalue - A unique identifier for the highlight.
 * @param {string} [text] - Optional original text to associate with the highlight.
 * @param {string} [color="#FFEB3B"] - Optional highlight color (defaults to yellow).
 *
 * @returns {Promise<HighlightType | null>} A Promise resolving to the constructed highlight object, or null if creation fails.
 */
export async function createHighlightFromIndices(
  pdfDocument: PDFDocumentProxy,
  pageNumber: number,
  startIndex: number,
  endIndex: number,
  idvalue: string,
  text?: string,
  color = "#FFEB3B"
): Promise<HighlightType | null> {
  try {
    const page = await pdfDocument.getPage(pageNumber);
    const textContent = await page.getTextContent();

    // Build a map of text items with their positions in the full text
    let fullText = "";
    const textItems = textContent.items.map((item: any) => {
      const itemText = item.str || "";
      const startIndexInFullText = fullText.length;
      fullText += itemText;
      return {
        ...item,
        startIndex: startIndexInFullText,
        endIndex: startIndexInFullText + itemText.length,
      };
    });

    // Find the items that overlap with our target range
    const relevantItems = textItems.filter(
      (item) => item.startIndex <= endIndex && item.endIndex >= startIndex
    );

    // Extract the highlighted text
    // const highlightedText = fullText.substring(startIndex, endIndex)

    if (relevantItems.length === 0) {
      console.error("Text not found on specified page");
      return null;
    }

    // Create rects for the highlight
    // ----- Highlight rect creation -----

    // 1. Get the viewport (browser-friendly coordinates)
    const viewport = page.getViewport({ scale: 1.0 });

    /**
     * Convert relevant PDF text items to normalized viewport rectangles
     */
    const rects = relevantItems.map((item) => {
      const tx = item.transform[4]; // x position in PDF space
      const ty = item.transform[5]; // y position in PDF space
      const width = item.width;
      const height = item.height;

      // Convert bottom-left PDF coordinates to top-left viewport coordinates
      const [left, top] = viewport.convertToViewportPoint(tx, ty);
      const [right, bottom] = viewport.convertToViewportPoint(
        tx + width,
        ty - height
      );

      // Normalize dimensions
      const normLeft = Math.min(left, right);
      const normTop = Math.min(top, bottom);
      const normWidth = Math.abs(right - left);
      const normHeight = Math.abs(bottom - top);

      return {
        left: normLeft,
        top: normTop,
        width: normWidth,
        height: normHeight,
        pageNumber,
      };
    });

    /**
     * Convert to boundary box format with (X0, X1, Y0, Y1)
     */
    const rectsM = rects.map((rect) => {
      const { left, top, width, height } = rect;
      const X0 = left;
      const X1 = left + width;
      const Y0 = top;
      const Y1 = top + height;

      return { X0, X1, Y0, Y1, pageNumber };
    });

    /**
     * Filter out any zero-size rectangles
     */
    const rectsWithSizeOnFirstPage = rectsM.filter(
      (rect) => rect.X0 > 0 || rect.X1 > 0 || rect.Y0 > 0 || rect.Y1 > 0
    );

    /**
     * Merge all bounding rectangles into a single one that contains them all
     */
    const optimal = rectsWithSizeOnFirstPage.reduce((res, rect) => {
      return {
        X0: Math.min(res.X0, rect.X0),
        X1: Math.max(res.X1, rect.X1),
        Y0: Math.min(res.Y0, rect.Y0),
        Y1: Math.max(res.Y1, rect.Y1),
        pageNumber: pageNumber,
      };
    }, rectsWithSizeOnFirstPage[0]);

    // Destructure final bounding box coordinates
    const { X0, X1, Y0, Y1 } = optimal;

    /**
     * Final bounding rectangle in viewport space
     */
    const boundingRectViewport = {
      left: X0,
      top: Y0,
      width: X1 - X0,
      height: Y1 - Y0,
      pageNumber,
    };

    // Get viewport dimensions
    const viewportW = viewport.width;
    const viewportH = viewport.height;

    /**
     * Convert viewport rectangle to scaled coordinates
     */
    const boundingRect = viewportToScaled(boundingRectViewport, {
      width: viewportW,
      height: viewportH,
    });
    // Create the highlight object with ScaledPosition format
    const newHighlight: HighlightType = {
      id: idvalue,
      content: {
        text: text,
      },
      position: {
        boundingRect,
        rects: (rects || []).map((rect) =>
          viewportToScaled(rect, { width: viewportW, height: viewportH })
        ),
        pageNumber,
        usePdfCoordinates: false,
      },
      color,
      comment: {
        text: idvalue || "",
        emoji: "",
      },

      url: `highlightcite-${idvalue}`,
    };

    return newHighlight;
  } catch (error) {
    console.error("Error creating highlight from indices:", error);
    return null;
  }
}
/**
 * Generate highlights in a PDF document for citations referenced in the summary text.
 *
 * @param {PDFDocumentProxy} pdfDocument - The loaded PDF document object.
 * @param {LabeledChunks} labeledChunks - The labeled chunks containing passage data.
 * @param {string} summaries - Summary text containing citation IDs in square brackets.
 * @param {string} [color="#FFEB3B"] - Highlight color in hex format (default is yellow).
 * @returns {Promise<HighlightType[]>} - Array of highlight objects corresponding to cited passages.
 */
export async function getHighlightsForCiteIds(
  pdfDocument: PDFDocumentProxy,
  labeledChunks: LabeledChunks,
  summaries: string,
  color = "#FFEB3B"
): Promise<HighlightType[]> {
  // Extract citation IDs from summaries and sort unique IDs ascending
  const outputids = findNumbers(summaries);
  const ids = [...new Set(outputids)].sort((a, b) => a - b);

  // Retrieve passages text for each citation ID
  const passages = retrieveAllPassageByCiteId(labeledChunks, ids);

  const highlightsMap: HighlightType[] = [];

  // Get page ranges for the full text of the PDF document
  const { pageRanges } = await extractFullTextWithPageRanges(pdfDocument);

  for (const id of ids) {
    const text = passages[id].sen;

    // Perform similarity search in the PDF to find passage location
    const result = await similaritySearchInPDF(text, pageRanges);

    if (!result) {
      console.log(`No result found for text "${text}" with id ${id}`);
      continue;
    }

    // Create highlight object from found indices in PDF
    const highlight = await createHighlightFromIndices(
      pdfDocument,
      result.pageNumber,
      result.startIndex,
      result.endIndex,
      id.toString(),
      text,
      color
    );

    if (!highlight) {
      console.log(`No highlight created for text "${text}" with id ${id}`);
      continue;
    }

    // Add successfully created highlight to output array
    highlightsMap.push(highlight);
  }

  return highlightsMap;
}


