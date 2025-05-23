import type { PDFDocumentProxy } from "pdfjs-dist"
import {  findNumbers, LabeledChunks, retrieveAllPassageByCiteId } from "./utils"
import stringSimilarity from 'string-similarity';
import { HighlightType } from "@/components/context/globalcontext"

import { LTWHP, Scaled} from 'react-pdf-highlighter'

// Generate a unique ID for highlights
export const getNextId = () => String(Math.random()).slice(2)

type PageTextInfo = {
  pageNumber: number
  startIndex: number
  endIndex: number
  text: string
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


function normalizeMath(text:string):string {
  return text
    .replace(/\s+/g, ' ')                       // collapse whitespace
    .replace(/[∑Σ]/g, 'sum')                   // unify summation symbols
    .replace(/[⟨⟩]/g, '')                      // remove inner product symbols
    .replace(/[−–—]/g, '-')                    // normalize dashes
    .replace(/[∂]/g, 'd')                      // replace partial derivative
    .replace(/[√]/g, 'sqrt')                   // normalize square root
    .replace(/θ/g, 'theta')                    // unify Greek symbols
    .replace(/[^\w\s]/g, '')                   // strip other symbols
    .trim()
    .toLowerCase()
}
function normalize(text: string): string {
  return normalizeMath(text.replace(/\s+/g, ' ').replace( /\[(\d+(?:,\s*\d+)*)\]/g,' ').trim().toLowerCase())
}

function splitIntoSentences(text: string): string[] {
  return text
    .match(/[^.!?]+[.!?]+/g)
    ?.map((s) => s.trim()) ?? []
}



export async function fuzzySearchInPDF(
  searchText: string,
  pageRanges: PageTextInfo[]
): Promise<{
  pageNumber: number
  sentence: string
  sentenceIndex: number
  score: number
  startIndex: number
  endIndex: number
} | null> {
  const normalizedQuery = normalize(searchText)

  let bestMatch: {
    pageNumber: number
    sentence: string
    sentenceIndex: number
    score: number
    startIndex: number
    endIndex: number
  } | null = null

  for (const { pageNumber, text } of pageRanges) {
    const sentences = splitIntoSentences(text)

    sentences.forEach((sentence, index) => {
      const normalizedSentence = normalize(sentence)
      const score = stringSimilarity.compareTwoStrings(normalizedQuery, normalizedSentence)

      const startIndex = sentences.slice(0, index).reduce((acc, s) => acc + s.length, 0)
      const endIndex = startIndex + sentence.length

      if (!bestMatch || score > bestMatch.score) {
        bestMatch = {
          pageNumber,
          sentence,
          sentenceIndex: index,
          score,
          startIndex,
          endIndex,
        }
      }
    })
  }

  return bestMatch
}


interface WIDTH_HEIGHT {
  width: number;
  height: number;
}
export const viewportToScaled = (
  rect: LTWHP,
  { width, height }: WIDTH_HEIGHT,
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

// Create a highlight from text indices
// // Update the createHighlightFromIndices function to use the correct position format
export async function createHighlightFromIndices(
  pdfDocument: PDFDocumentProxy,
  pageNumber: number,
  startIndex: number,
  endIndex: number,
  idvalue: string ,
  text?:string,
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

    // Extract the highlighted text
    const highlightedText = fullText.substring(startIndex, endIndex)
 
    
    if (relevantItems.length === 0) {
      console.error("Text not found on specified page")
      return null
    }

    // Create rects for the highlight
    const viewport = page.getViewport({ scale: 1.0 })

const rects = relevantItems.map((item) => {
  const tx = item.transform[4];
  const ty = item.transform[5];
  const width = item.width;
  const height = item.height;

  const [left, top] = viewport.convertToViewportPoint(tx, ty);
const [right, bottom] = viewport.convertToViewportPoint(tx + width, ty - height);
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


  const rectsM= Array.from(rects).map((rect) => {
    const { left, top, width, height } = rect;

    const X0 = left;
    const X1 = left + width;

    const Y0 = top;
    const Y1 = top + height;

    return { X0, X1, Y0, Y1, pageNumber};
  });

   const rectsWithSizeOnFirstPage = rectsM.filter(
    (rect) =>
      (rect.X0 > 0 || rect.X1 > 0 || rect.Y0 > 0 || rect.Y1 > 0) 
     
  );

 const optimal = rectsWithSizeOnFirstPage.reduce((res, rect) => {
    return {
      X0: Math.min(res.X0, rect.X0),
      X1: Math.max(res.X1, rect.X1),

      Y0: Math.min(res.Y0, rect.Y0),
      Y1: Math.max(res.Y1, rect.Y1),

      pageNumber: pageNumber,
    };
  }, rectsWithSizeOnFirstPage[0]);
   const { X0, X1, Y0, Y1 } = optimal;


  const boundingRectViewport = {
    left: X0,
    top: Y0,
    width: X1 - X0,
    height: Y1 - Y0,
    pageNumber,
  };
  const viewportW = viewport.width
  const viewportH = viewport.height
   
     
   const boundingRect = viewportToScaled(boundingRectViewport,{width:viewportW,height:viewportH})
  
    // Create the highlight object with ScaledPosition format
    const newHighlight: HighlightType = {
      id: idvalue,
      content: {
        text: text,
      },
      position: {
        boundingRect,
        rects: (rects || []).map((rect) => viewportToScaled(rect, {width:viewportW,height:viewportH})),
        pageNumber,
        usePdfCoordinates: false,
      },
      color,
      comment: {
        text: idvalue || "",
        emoji: "",
      },
      
      url:`highlightcite-${idvalue}`
    }

    return newHighlight
  } catch (error) {
    console.error("Error creating highlight from indices:", error)
    return null
  }
}









export async function getHighlightsForCiteIds(
  pdfDocument: PDFDocumentProxy,
  labeledChunks: LabeledChunks,
  summaries:string,
  color = "#FFEB3B"
): Promise<HighlightType[]> {
  const outputids = findNumbers(summaries)
    const ids = [...new Set(outputids)].sort((a, b) => a - b);
    console.log('====================================');
    console.log("ids", ids,outputids);
    console.log('====================================');

  const passages = retrieveAllPassageByCiteId(labeledChunks, ids);

  
  const highlightsMap: HighlightType[] = [];
  const { fullText, pageRanges } = await extractFullTextWithPageRanges(pdfDocument)

    
  for (const id of ids) {
    const text = passages[id].sen
   
    const result =  await fuzzySearchInPDF(text,pageRanges)
    if(!result){
      console.log(`no result in text ${text} id ${id}`);
      
    }
    if(result){
      
      const highlight = await createHighlightFromIndices(
          pdfDocument,
          result.pageNumber,
          result.startIndex,
          result.endIndex,
          id.toString(),
          text,
          color,
        )
        if(!highlight){
          console.log(`no highlight result in text ${text} id ${id}`);
        }
          if(highlight){
             highlightsMap.push(highlight);
     }

    }
     
      
  }

  return highlightsMap;
}


