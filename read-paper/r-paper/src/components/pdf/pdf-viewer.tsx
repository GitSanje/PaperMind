"use client";

import React from "react";
// import "react-pdf-highlighter/dist/style.css";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  AreaHighlight,
  PdfHighlighter,
  PdfLoader,
  Highlight,
  Popup,
  Tip,
} from "react-pdf-highlighter";

import type {
  Content,
  IHighlight,
  NewHighlight,
  ScaledPosition,
  Position,
} from "react-pdf-highlighter";
export type T_ViewportHighlight<T_HT> = { position: Position } & T_HT;

import { Spinner } from "../ui/spinner";
import { useGlobalContext, HighlightType } from "../context/globalcontext";
import { PDFDocumentProxy } from "pdfjs-dist";

interface PDFViewerProps {
  url?: string;
  file?: File;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  setTotalPages: (pages: number) => void;
  scale: number;
  activeHighlightColor: string;

  onTextSelection?: (text: string, position: { x: number; y: number }) => void;
}

export interface NewHighlightVarient extends NewHighlight {
  color?: string;
}

/**
 * Generates a random string id used for highlights
 * @returns {string} random id string
 */
const getNextId = () => String(Math.random()).slice(2);

/**
 * Parses the current window.location.hash to extract
 * the highlight type and id from the URL fragment
 * @returns {hashtype: string, highlightid: string} parsed info
 */
const parseIdFromHash = () => {
  const hash = window.location.hash;
  const hashtype = hash.startsWith("#highlightcite")
    ? "#highlightcite"
    : "#highlight";

  const highlightid = hash.slice(`${hashtype}-`.length);
  return { hashtype, highlightid };
};

import { pdfjs } from "react-pdf";

import { CustomHighlight } from "./custom-highlight";
import { hexToRgba } from "@/lib/utils";
import {
  addHighlight,
  concatHighlights,
  updateHighlight,
} from "../../../redux/highlightSlice";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import HighlightPopup from "./HighlightPopup";

// Configure pdfjs worker to load from CDN
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PRIMARY_PDF_URL = "https://arxiv.org/pdf/1708.08021";

/**
 * PDFViewer component renders a PDF document with
 * text and area highlight functionality.
 * It manages highlights, selection, scrolling, and popup notes.
 *
 * @param {string} url - PDF document URL to load.
 * @param {number} currentPage - Current page number displayed.
 * @param {(page: number) => void} setCurrentPage - Setter to update current page.
 * @param {(pages: number) => void} setTotalPages - Setter to update total pages.
 * @param {number} scale - Zoom scale for rendering PDF.
 * @param {string} activeHighlightColor - Hex color string for new highlights.
 * @param {(text: string, position: {x:number,y:number}) => void} [onTextSelection] - Optional callback on text selection.
 */
export default function PDFViewer({
  url,
  file,
  currentPage,
  setCurrentPage,
  setTotalPages,
  scale,
  activeHighlightColor,
  onTextSelection,
}: PDFViewerProps) {


  // Extract global context state and methods related to highlights and PDF document
  const { handleAskAI, loadedPdfDocument, setPdfDocument } = useGlobalContext();

  const highlights = useAppSelector((state) => state.highlight.highlights);
  const citeHighlights = useAppSelector(
    (state) => state.pdfsetting.citeHighlights
  );
  const isSelecting = useAppSelector((state) => state.pdfsetting.isSelecting);
  const pagehighlights = useAppSelector((state) => state.highlight.highlights);

  const [pdfError, setPdfError] = useState<string | null>(null);

  // Ref to function that scrolls PDF viewer to a specific highlight
  const scrollViewerTo = useRef<(highlight: IHighlight) => void>(() => {});
  const dispatch = useAppDispatch();
  // When the PDF document is loaded, update the total number of pages
  useEffect(() => {
    if (loadedPdfDocument) {
      setTotalPages(loadedPdfDocument.numPages);
    }
  }, [loadedPdfDocument, setTotalPages]);

  const [fileurl, setfileUrl] = useState<string | null>(null);

  // When citeHighlights changes, merge them into main highlights
  useEffect(() => {
    if (citeHighlights && citeHighlights.length > 0) {
      dispatch(concatHighlights(citeHighlights));
    }
  }, [citeHighlights]);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setfileUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [file]);

  
  /**
   * Popup content component shown when hovering on a highlight.
   *
   * @param {{comment?: {text?: string}, content?: {text?: string}}} props
   */
  const HighlightPopupCite = ({
    comment,
    content,
  }: {
    comment?: { text?: string };
    content?: { text?: string };
  }) => {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg max-w-sm border">
        {content && content.text && (
          <div className="text-sm italic mb-2 text-gray-700 border-l-2 border-yellow-400 pl-2">
            "{content.text}"
          </div>
        )}
        {comment && comment.text && (
          <div className="text-sm">
            <span className="font-medium">Note:</span> {comment.text}
          </div>
        )}
      </div>
    );
  };

  /**
   * Clears the URL hash fragment to remove highlight focus
   */
  const resetHash = () => {
    document.location.hash = "";
  };

  /**
   * Retrieves a highlight by its id and type
   * @param {string} id - Highlight ID
   * @param {string} hashtype - Either "#highlight" or "#highlightcite"
   * @returns {IHighlight | undefined} found highlight or undefined
   */
  const getHighlightById = useCallback(
    (id: string, hashtype: string) => {
      if (hashtype === "#highlight") {
        return pagehighlights.find((highlight) => highlight.id === id);
      } else {
        return citeHighlights?.find((highlight) => highlight.id === id);
      }
    },
    [pagehighlights, citeHighlights]
  );

  /**
   * Scrolls the viewer to the highlight referenced in the URL hash
   */
  const scrollToHighlightFromHash = useCallback(() => {
    const highlightInfo = parseIdFromHash();
    if (!highlightInfo.highlightid) return;

    const { highlightid, hashtype } = highlightInfo;
    const highlight = getHighlightById(highlightid, hashtype);

    if (highlight && scrollViewerTo.current) {
      setTimeout(() => {
        if (scrollViewerTo.current) {
          scrollViewerTo.current(highlight);
        }
      }, 200); // delay to allow viewer rendering before scrolling
    }
  }, [getHighlightById, citeHighlights]);

  // Attach event listener to react to changes in URL hash to scroll to highlight
  useEffect(() => {
    const handleHashChange = () => {
      scrollToHighlightFromHash();
    };

    window.addEventListener("hashchange", handleHashChange, false);

    return () => {
      window.removeEventListener("hashchange", handleHashChange, false);
    };
  }, [scrollToHighlightFromHash]);

  /**
   * Adds a new highlight with generated ID and semi-transparent color
   * @param {NewHighlightVarient} highlight - new highlight data
   */
  // const addHighlight = (highlight: NewHighlightVarient) => {
  //   setHighlights((prevHighlights) => [
  //     {
  //       ...highlight,
  //       id: getNextId(),
  //       color: hexToRgba(activeHighlightColor, 0.5),
  //     },
  //     ...prevHighlights,
  //   ]);
  // };

  /**
   * Handler called when the PDF document finishes loading
   * Sets the PDF document proxy and total pages in context
   *
   * @param {PDFDocumentProxy} pdfDocumentProxy - Loaded PDF document proxy
   */
  const handleDocumentLoadSuccess = (pdfDocumentProxy: PDFDocumentProxy) => {
    setPdfDocument(pdfDocumentProxy);
    setTotalPages(pdfDocumentProxy.numPages);
  };

  // Reference to the container wrapping the PDF viewer
  const pdfContainerRef = useRef<HTMLDivElement | null>(null);

  /**
   * Handles text selection within the PDF to trigger
   * the onTextSelection callback with selected text and position
   *
   * @param {ScaledPosition} position - Position of selection in scaled coordinates
   * @param {Content} content - Selected content including text
   */
  const handleTextSelection = (position: ScaledPosition, content: Content) => {
    if (!isSelecting && onTextSelection && content.text) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        onTextSelection(content.text, {
          x: rect.left + rect.width / 2,
          y: rect.top,
        });
      }
    }
  };

  return (
    <div
      className=""
      style={{ display: "flex", height: "100vh" }}
      ref={pdfContainerRef}
    >
      <div
        style={{
          height: "100vh",
          width: "75vw",
          position: "relative",
        }}
      >
        {pdfError && (
          <div className="text-red-500 text-center p-4">{pdfError}</div>
        )}
        <PdfLoader
          url={url ? url : fileurl!}
          beforeLoad={<Spinner />}
          onError={(err) => {
            setPdfError(err.message);
          }}
        >
          {(pdfDocument) => {
            if (!pdfDocument) return null;

            handleDocumentLoadSuccess(pdfDocument);

            return (
              <div>
                <PdfHighlighter
                  pdfDocument={pdfDocument}
                  enableAreaSelection={(event) => event.altKey} // Area selection enabled only when Alt key pressed
                  onScrollChange={() => {
                    resetHash(); // Reset URL hash on scroll to avoid stale highlight
                  }}
                  scrollRef={(scrollTo) => {
                    scrollViewerTo.current = scrollTo;
                    setTimeout(scrollToHighlightFromHash, 100); // Scroll to highlight from hash after mounting
                  }}
                  onSelectionFinished={(
                    position,
                    content,
                    hideTipAndSelection,
                    transformSelection
                  ) => {
                    if (!isSelecting) {
                      hideTipAndSelection(); // Close tip if not in selecting mode
                      handleTextSelection(position, content);
                      return null;
                    }
                    // Show tip to add a new highlight
                    return (
                      <Tip
                        onOpen={transformSelection}
                        onConfirm={(comment) => {
                          dispatch(
                            addHighlight({
                              highlight: { content, position, comment },
                              color: activeHighlightColor,
                            })
                          );
                          hideTipAndSelection();
                        }}
                      />
                    );
                  }}
                  highlightTransform={(
                    highlight: T_ViewportHighlight<HighlightType>,
                    index,
                    setTip,
                    hideTip,
                    viewportToScaled,
                    screenshot,
                    isScrolledTo
                  ) => {
                    // Distinguish between text highlights and area/image highlights
                    const isTextHighlight = !highlight.content?.image;

                    // Render appropriate highlight component
                    const component = isTextHighlight ? (
                      <CustomHighlight
                        position={highlight.position}
                        comment={highlight.comment}
                        isScrolledTo={isScrolledTo}
                        highlightColor={highlight.color}
                        highlight={highlight}
                      />
                    ) : (
                      <AreaHighlight
                        isScrolledTo={isScrolledTo}
                        highlight={highlight}
                        onChange={(boundingRect) => {
                          updateHighlight({
                          id: highlight.id,
                          position: { boundingRect: viewportToScaled(boundingRect) },
                          content: { image: screenshot(boundingRect) },
                        });

                        }}
                      />
                    );

                    return (
                      <Popup
                        popupContent={
                          
                            !highlight.url ?  
                            <HighlightPopup
                            highlight={highlight}
                            dispatch={dispatch}
                            onAskAI={handleAskAI}
                          /> :
                            <HighlightPopupCite {...highlight}/>
                          
                          
                        }
                        onMouseOver={(popupContent) =>
                          setTip(highlight, (h) => popupContent)
                        }
                        onMouseOut={hideTip}
                        key={index}
                      >
                        {component}
                      </Popup>
                    );
                  }}
                  highlights={highlights as any} // Cast due to type restrictions
                />
              </div>
            );
          }}
        </PdfLoader>

        {/* Page indicator overlay */}
        {/* <div className="sticky top-0 left-0 z-10 bg-white/80 backdrop-blur-sm text-xs py-1 px-2 rounded-br-md shadow-sm">
          Page {currentPage} of {loadedPdfDocument?.numPages || "?"}
        </div> */}
      </div>
    </div>
  );
}
