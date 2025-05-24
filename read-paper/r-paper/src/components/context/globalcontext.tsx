"use client";

import { PDFDocumentProxy } from "pdfjs-dist";
import type React from "react";
import { createContext, useContext, useState, type ReactNode } from "react";
import type {
  Content,
  IHighlight,
  ScaledPosition,
} from "react-pdf-highlighter";

export interface HighlightType extends IHighlight {
  color?: string;
  url?: string;
}

interface ContextProps {
  isSelecting: boolean;
  setIsSelecting: (isSelecting: boolean) => void;
  pagehighlights: HighlightType[];
  setHighlights: React.Dispatch<React.SetStateAction<HighlightType[]>>;
  citeHighlights: HighlightType[];
  setCiteHiglights: React.Dispatch<React.SetStateAction<HighlightType[]>>;
  handleDeleteHighlight: (id: string) => void;
  updateHighlightColor: (id: string, color: string) => void;
  updateHighlight: (
    highlightId: string,
    position: Partial<ScaledPosition>,
    content: Partial<Content>,
    color?: string
  ) => void;
  tab: string;
  setTab: (tab: string) => void;
  showSelectionPopup: boolean;
  setShowSelectionPopup: (tab: boolean) => void;
  aiQuery: string;
  selectedText: string;
  setSelectedText: (tab: string) => void;
  handleAskAI: (query: string) => void;
  setAiQuery: (q: string) => void;
  summary: string;
  setSummary: (summary: string) => void;

  loadedPdfDocument: PDFDocumentProxy | null;
  setPdfDocument: (pdfdocument: PDFDocumentProxy) => void;
  activeCiteHighlights: HighlightType | undefined;
  setActiveCiteHighlights: (highlight: HighlightType | undefined) => void;
}

const GContext = createContext<ContextProps | null>(null);
/**
 * Global context provider component to manage highlights, AI queries,
 * selection state, and document metadata for a PDF annotation tool.
 */
export const GlobalContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  /** Controls whether text selection mode is active */
  const [isSelecting, setIsSelecting] = useState<boolean>(true);

  /** Stores all page highlights */
  const [pagehighlights, setHighlights] = useState<Array<HighlightType>>([]);

  /** Currently selected tab (e.g., "tool", "ai") */
  const [tab, setTab] = useState("tool");

  /** Currently selected text from the document */
  const [selectedText, setSelectedText] = useState("");

  /** Whether to display the text selection popup */
  const [showSelectionPopup, setShowSelectionPopup] = useState(false);

  /** Query sent to AI for summarization or answering */
  const [aiQuery, setAiQuery] = useState("");

  /** AI-generated summary text */
  const [summary, setSummary] = useState<string>("");

  /** Highlights used for citation purposes */
  const [citeHighlights, setCiteHiglights] = useState<Array<HighlightType>>([]);

  /** Loaded PDF document object (from PDF.js) */
  const [loadedPdfDocument, setPdfDocument] =
    useState<PDFDocumentProxy | null>(null);

  /** Currently active citation highlight (e.g., for editing) */
  const [activeCiteHighlights, setActiveCiteHighlights] = useState<
    HighlightType | undefined
  >();

  /**
   * Deletes a highlight based on its unique ID.
   * @param {string} id - Highlight ID to delete
   */
  const handleDeleteHighlight = (id: string) => {
    setHighlights(pagehighlights.filter((h) => h.id !== id));
  };

  /**
   * Updates the color of an existing highlight.
   * @param {string} id - Highlight ID to update
   * @param {string} color - New color value
   */
  const updateHighlightColor = (id: string, color: string) => {
    setHighlights((prevHighlights) =>
      prevHighlights.map((h) => {
        return h.id === id ? { ...h, color } : h;
      })
    );
  };

  /**
   * Updates an existing highlight's position and content,
   * optionally preserving or overriding its color.
   *
   * @param {string} highlightId - ID of the highlight to update
   * @param {Partial<ScaledPosition>} position - New position data
   * @param {Partial<Content>} content - New content data
   * @param {string} [color] - Optional new color
   */
  const updateHighlight = (
    highlightId: string,
    position: Partial<ScaledPosition>,
    content: Partial<Content>,
    color?: string
  ) => {
    setHighlights((prevHighlights) =>
      prevHighlights.map((h) => {
        const {
          id,
          position: originalPosition,
          content: originalContent,
          color: originalColor,
          ...rest
        } = h;

        return id === highlightId
          ? {
              id,
              position: { ...originalPosition, ...position },
              content: { ...originalContent, ...content },
              color: color ?? originalColor, // Preserve existing color if none is provided
              ...rest,
            }
          : h;
      })
    );
  };

  /**
   * Sets an AI query (either custom or from the selected text),
   * switches to the AI tab, and closes the popup.
   *
   * @param {string} query - User's question or text for AI
   */
  const handleAskAI = (query: string) => {
    setAiQuery(query || selectedText);
    setTab("ai");
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
        setActiveCiteHighlights,
      }}
    >
      {children}
    </GContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GContext);
  if (!context) {
    throw new Error(
      "useGlobalContext must be used within a GlobalContextProvider"
    );
  }
  return context;
};
