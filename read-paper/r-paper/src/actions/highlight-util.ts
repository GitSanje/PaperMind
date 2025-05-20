import type { PDFDocumentProxy } from "pdfjs-dist"
import { findNumbers, LabeledChunks, passacesCites, retrieveAllPassageByCiteId } from "./utils"


// Generate a unique ID for highlights
export const getNextId = () => String(Math.random()).slice(2)

type PageTextInfo = {
  pageNumber: number
  startIndex: number
  endIndex: number
  text: string
}
type Scaled = {
  x1: number
  y1: number
  x2: number
  y2: number
}

type ScaledPosition = {
  boundingRect: Scaled
  rects: Scaled[]
  pageNumber: number
}

type HighlightType = {
  id: string
  content: {
    text: string
  }
  position: ScaledPosition
  color: string
  comment: {
    text: string
  }
  url?: string
}


export async function extractFullTextWithPageRanges(
  pdfDocument: PDFDocumentProxy
): Promise<{ fullText: string; pageRanges: PageTextInfo[] }> {
  const pageRanges: PageTextInfo[] = []
  let fullText = ""
  const numPages = pdfDocument.numPages

  for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
    const page = await pdfDocument.getPage(pageNumber)
    const textContent = await page.getTextContent()

    let pageText = ""
    textContent.items.forEach((item: any) => {
      pageText += item.str
    })

    const startIndex = fullText.length
    fullText += pageText
    const endIndex = fullText.length

    pageRanges.push({
      pageNumber,
      startIndex,
      endIndex,
      text: pageText,
    })
  }

  return { fullText, pageRanges }
}




// Find text on a specific page and return its position
// export async function findTextOnPage(
//   pdfDocument: PDFDocumentProxy,
//   pageNumber: number,
//   searchText: string,
// ): Promise<{ startIndex: number; endIndex: number } | null> {
//   try {
//     const page = await pdfDocument.getPage(pageNumber)
//     const textContent = await page.getTextContent()

//     // Combine all text items into a single string
//     let fullText = ""
//     textContent.items.forEach((item: any) => {
//       fullText += item.str
//     })

//     // Find the text in the full content
//     const startIndex = fullText.indexOf(searchText)
//     if (startIndex === -1) return null

//     const endIndex = startIndex + searchText.length

//     return {
//       startIndex,
//       endIndex,
//     }
//   } catch (error) {
//     console.error("Error finding text on page:", error)
//     return null
//   }
// }

// Create a highlight from text indices
export async function createHighlightFromIndices(
    pdfDocument:PDFDocumentProxy,
  pageNumber: number,
  startIndex: number,
  endIndex: number,
  color = "#FFEB3B",
): Promise<HighlightType | null> {
  try {
    const page = await pdfDocument.getPage(pageNumber)
    const textContent = await page.getTextContent()

    // Build a map of text items with their positions in the full text
    let fullText = ""
    const textItems = textContent.items.map((item: any) => {
      const itemText = item.str || ""
      const startIndexInFullText = fullText.length
      fullText += itemText
      return {
        ...item,
        startIndex: startIndexInFullText,
        endIndex: startIndexInFullText + itemText.length,
      }
    })

    // Find the items that overlap with our target range
    const relevantItems = textItems.filter((item) => item.startIndex <= endIndex && item.endIndex >= startIndex)

    if (relevantItems.length === 0) {
      console.error("Text not found on specified page")
      return null
    }

    // Create rects for the highlight
    const viewport = page.getViewport({ scale: 1.0 })
     const rects: Scaled[] = relevantItems.map((item) => {
      const [x, y] = item.transform ? [item.transform[4], item.transform[5]] : [0, 0]
      const width = item.width || item.str.length * 5
      const height = item.height || 12

      const x1 = x
      const y1 = viewport.height - y
      const x2 = x + width
      const y2 = viewport.height - y + height

      return { x1, y1, x2, y2 }
    })

    // Create a bounding rect that encompasses all the text items
    const boundingRect = rects.reduce(
      (acc, r) => ({
        x1: Math.min(acc.x1, r.x1),
        y1: Math.min(acc.y1, r.y1),
        x2: Math.max(acc.x2, r.x2),
        y2: Math.max(acc.y2, r.y2),
      }),
      {
        x1: Infinity,
        y1: Infinity,
        x2: -Infinity,
        y2: -Infinity,
      }
    )

    // // Calculate width and height from right/bottom
    // boundingRect.width = boundingRect.right - boundingRect.left
    // boundingRect.height = boundingRect.bottom - boundingRect.top

    // Extract the highlighted text
    const highlightedText = fullText.substring(startIndex, endIndex)
    const id = getNextId()
    const url = `#highlight-${id}`

    // Create the highlight object
    const newHighlight: HighlightType = {
      id: getNextId(),
      content: {
        text: highlightedText,
      },
      position: {
        boundingRect,
        rects,
        pageNumber,
      },
      color,
      comment: {
        text: "",
      },
       url,
    }

    return newHighlight
  } catch (error) {
    console.error("Error creating highlight from indices:", error)
    return null
  }
}



export async function createHighlightsFromGlobalIndices(
  pdfDocument: PDFDocumentProxy,
  globalStart: number,
  globalEnd: number,
  pageRanges: PageTextInfo[],
  color = "#FFEB3B",
  
): Promise<HighlightType|null> {

//   const highlights: HighlightType[] = []

  for (const pageInfo of pageRanges) {
    const { pageNumber, startIndex, endIndex } = pageInfo

    // If there's any overlap with the global highlight range
    const overlapStart = Math.max(globalStart, startIndex)
    const overlapEnd = Math.min(globalEnd, endIndex)

    if (overlapStart < overlapEnd) {
      const localStart = overlapStart - startIndex
      const localEnd = overlapEnd - startIndex

      const highlight = await createHighlightFromIndices(
        pdfDocument,
        pageNumber,
        localStart,
        localEnd,
        color
      )

      if (highlight) return highlight
    }
  }

  return null
}


// // Search for text across all pages and create highlights
// export async function searchAndHighlight(
//   pdfDocument: PDFDocumentProxy,
//   searchText: string,
//   color = "#FFEB3B",
// ): Promise<HighlightType[]> {
//   const highlights: HighlightType[] = []

//   try {
//     const numPages = pdfDocument.numPages

//     for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
//       const position = await findTextOnPage(pdfDocument, pageNumber, searchText)

//       if (position) {
//         const highlight = await createHighlightFromIndices(
//           pdfDocument,
//           pageNumber,
//           position.startIndex,
//           position.endIndex,
//           color,
//         )

//         if (highlight) {
//           highlights.push(highlight)
//         }
//       }
//     }

//     return highlights
//   } catch (error) {
//     console.error("Error searching and highlighting:", error)
//     return highlights
//   }
// }

interface CiteHighlights {
    [key: number] : HighlightType
}
export async function getHighlightsForCiteIds(
  pdfDocument: PDFDocumentProxy,
  labeledChunks: LabeledChunks,
  summaries:string,
  color = "#FFEB3B"
): Promise<Record<number, HighlightType>> {
   const ids = findNumbers(summaries)
  const passages = retrieveAllPassageByCiteId(labeledChunks, ids);
  const highlightsMap: Record<number, HighlightType> = {};
  const { fullText, pageRanges } = await extractFullTextWithPageRanges(pdfDocument)
  for (const id of ids) {
    const range = passages[id]?.range;

    if (range && typeof range[0] === "number" && typeof range[1] === "number") {
      const [globalStart, globalEnd] = range;

      const highlights = await createHighlightsFromGlobalIndices(
        pdfDocument,
        globalStart,
        globalEnd,
        pageRanges,
        color=color
      );

      highlightsMap[id] = highlights!;
    }
  }

  return highlightsMap;
}


// export async function searchAndHighlight(passages_cites: passacesCites,  pdfDocument: PDFDocumentProxy){
//      const highlights:CiteHighlights  = {}
//        const { fullText, pageRanges } = await extractFullTextWithPageRanges(pdfDocument)

//     for (const [key,value] of Object.entries(passages_cites)){
//         const highlight = await createHighlightsFromGlobalIndices(pdfDocument,value.range[0], value.range[1],pageRanges)
//         highlights[Number(key)] = highlight!

//     }

//     return highlights

// }
