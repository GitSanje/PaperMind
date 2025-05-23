"use client"

import { PDFDocumentProxy } from "pdfjs-dist"
import type React from "react"
import { createContext, useContext, useState, type ReactNode } from "react"
import type { Content, IHighlight, ScaledPosition } from "react-pdf-highlighter"


export interface HighlightType extends IHighlight {
  color?: string
  url?:string
}

interface ContextProps {
  isSelecting: boolean
  setIsSelecting: (isSelecting: boolean) => void
  pagehighlights: HighlightType[]
  setHighlights: React.Dispatch<React.SetStateAction<HighlightType[]>>
   citeHighlights:HighlightType[]
  setCiteHiglights: React.Dispatch<React.SetStateAction<HighlightType[]>>
  handleDeleteHighlight: (id: string) => void
  updateHighlightColor: (id: string, color: string) => void
  updateHighlight: (
    highlightId: string,
    position: Partial<ScaledPosition>,
    content: Partial<Content>,
    color?: string,
  ) => void
  tab:string,
  setTab:(tab:string) => void
  showSelectionPopup:boolean;
  setShowSelectionPopup:(tab:boolean) => void;
  aiQuery:string
  selectedText:string
  setSelectedText:(tab:string) => void
  handleAskAI: (query:string) =>void
  setAiQuery: (q:string) =>void
  summary: string
  setSummary:(summary:string) => void
 
  loadedPdfDocument: PDFDocumentProxy|null
  setPdfDocument : (pdfdocument: PDFDocumentProxy) =>void
  activeCiteHighlights: HighlightType|undefined
  setActiveCiteHighlights: (highlight: HighlightType|undefined) =>void

  

  


}

const GContext = createContext<ContextProps | null>(null)

export const GlobalContextProvider = ({ children }: { children: ReactNode }) => {
  const [isSelecting, setIsSelecting] = useState<boolean>(true)
  const [pagehighlights, setHighlights] = useState<Array<HighlightType>>([])
  const [tab, setTab] = useState("tool")
    const [selectedText, setSelectedText] = useState("");
    const [showSelectionPopup, setShowSelectionPopup] = useState(false);
     const [aiQuery, setAiQuery] = useState("");
       const [summary, setSummary] = useState<string>("")
       const [citeHighlights, setCiteHiglights] = useState<Array<HighlightType>>([])
         const [loadedPdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(
           null
         );

         const [activeCiteHighlights, setActiveCiteHighlights] = useState<HighlightType|undefined>();


  const handleDeleteHighlight = (id: string) => {
    setHighlights(pagehighlights.filter((h) => h.id !== id))
  }

  const updateHighlightColor = (id: string, color: string) => {
    setHighlights((prevHighlights) =>
      prevHighlights.map((h) => {
        return h.id === id ? { ...h, color } : h
      }),
    )
  }

  const updateHighlight = (
    highlightId: string,
    position: Partial<ScaledPosition>,
    content: Partial<Content>,
    color?: string,
  ) => {
    setHighlights((prevHighlights) =>
      prevHighlights.map((h) => {
        const { id, position: originalPosition, content: originalContent, ...rest } = h
        return id === highlightId
          ? {
              id,
              position: { ...originalPosition, ...position },
              content: { ...originalContent, ...content },
              color: color || h.color,
              ...rest,
            }
          : h
      }),
    )
  }
   
    const handleAskAI = (query: string) => {
      setAiQuery(query || selectedText);
      setTab('ai')
      setShowSelectionPopup(false);
    };


    

  return (
    <GContext.Provider
      value={{
        isSelecting,
        setIsSelecting,
        pagehighlights,
        setHighlights,
        handleDeleteHighlight,
        updateHighlightColor,
        updateHighlight,
        tab,
        setTab,
        selectedText,
        setSelectedText,
        setShowSelectionPopup,
        showSelectionPopup,
        aiQuery,
        handleAskAI,
        setAiQuery,
        setSummary,
        summary,
        citeHighlights,
        setCiteHiglights,
        loadedPdfDocument,
        setPdfDocument,
        activeCiteHighlights,
        setActiveCiteHighlights
        
        
      }}
    >
      {children}
    </GContext.Provider>
  )
}

export const useGlobalContext = () => {
  const context = useContext(GContext)
  if (!context) {
    throw new Error("useGlobalContext must be used within a GlobalContextProvider")
  }
  return context
}
