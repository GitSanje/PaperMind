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
   Position
} from "react-pdf-highlighter";
export type T_ViewportHighlight<T_HT> = { position: Position } & T_HT;


import { Spinner } from "../ui/spinner";
import { useGlobalContext, HighlightType } from "../context/globalcontext";
import { PDFDocumentProxy } from "pdfjs-dist";

interface PDFViewerProps {
  url: string;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  setTotalPages: (pages: number) => void;
  scale: number;
  activeHighlightColor: string;
   onTextSelection?: (text: string, position: { x: number; y: number }) => void

}

interface NewHighlightVarient extends NewHighlight {
  color?: string;
}
const getNextId = () => String(Math.random()).slice(2);
const parseIdFromHash = () =>
  document.location.hash.slice("#highlight-".length);

import { pdfjs } from "react-pdf";

import { CustomHighlight } from "./custom-highlight";
import { hexToRgba } from "@/lib/utils";
import { mixedText3 } from "./markdown";
import { getHighlightsForCiteIds } from "@/actions/highlight-util";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PRIMARY_PDF_URL = "https://arxiv.org/pdf/1708.08021";

export default function PDFViewer({
  url,
  currentPage,
  setCurrentPage,
  setTotalPages,
  scale,
  activeHighlightColor,
  onTextSelection
}: PDFViewerProps) {
 
  const { isSelecting, highlights, setHighlights,handleDeleteHighlight,updateHighlightColor,handleAskAI,loadedPdfDocument,setPdfDocument } = useGlobalContext();

  const scrollViewerTo = useRef((highlight: IHighlight) => {});
  useEffect(() => {
    if (loadedPdfDocument) {
      setTotalPages(loadedPdfDocument.numPages);
    }
  }, [loadedPdfDocument, setTotalPages]);
 

 

  const HighlightPopup = ({
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

  const resetHash = () => {
    document.location.hash = "";

  };


  const getHighlightById = useCallback(
    (id: string) => {
      return highlights.find((highlight) => highlight.id === id);
    },
    [highlights]
  );

  const scrollToHighlightFromHash = useCallback(() => {
    const highlightId = parseIdFromHash();
    if (!highlightId) return;

    const highlight = getHighlightById(highlightId);

    if (highlight) {
      // First set the page number
      if (highlight.position && highlight.position.pageNumber) {
        setCurrentPage(highlight.position.pageNumber);
      }
      // Then scroll to the highlight with a slight delay

      scrollViewerTo.current(highlight);
     
    }
  }, [getHighlightById, setCurrentPage, scrollViewerTo]);



  useEffect(() => {
    const handleHashChange = () => {
      scrollToHighlightFromHash();
    };

    window.addEventListener("hashchange", handleHashChange, false);

    return () => {
      window.removeEventListener("hashchange", handleHashChange, false);
    };
  }, [scrollToHighlightFromHash]);

  const addHighlight = (highlight: NewHighlightVarient) => {
    setHighlights((prevHighlights) => [
      { ...highlight, id: getNextId(), color:hexToRgba(activeHighlightColor,0.5) },
      ...prevHighlights,
    ]);
  };

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
          color:color,
          ...rest
        } = h;
        return id === highlightId
          ? {
              id,
              position: { ...originalPosition, ...position },
              content: { ...originalContent, ...content },
              color:color,
              ...rest,
            }
          : h;
      })
    );
  };

  const handleDocumentLoadSuccess = (pdfDocumentProxy: PDFDocumentProxy) => {
    setPdfDocument(pdfDocumentProxy);
    setTotalPages(pdfDocumentProxy.numPages);
  };

  const pdfContainerRef = useRef<HTMLDivElement | null>(null);

 // Handle text selection for dictionary/AI lookup
  const handleTextSelection = (position: ScaledPosition, content: Content) => {
    if (!isSelecting && onTextSelection && content.text) {
      // Get the selection position
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()

        onTextSelection(content.text, {
          x: rect.left + rect.width / 2,
          y: rect.top,
        })
      }
    }
  }
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
        <PdfLoader url={url} beforeLoad={<Spinner />}>
          {(pdfDocument) => {
            if (!pdfDocument) return null;

            handleDocumentLoadSuccess(pdfDocument);

            return (
              <div>
                <PdfHighlighter
                  pdfDocument={pdfDocument}
                  enableAreaSelection={(event) => event.altKey}
                  onScrollChange={() => {

                    resetHash();
                  }}
                  scrollRef={(scrollTo) => {
                    scrollViewerTo.current = scrollTo;
                    setTimeout(scrollToHighlightFromHash, 100);
                  }}
                  onSelectionFinished={(
                    position,
                    content,
                    hideTipAndSelection,
                    transformSelection
                  ) => {
                    if (!isSelecting) {
                      hideTipAndSelection();
                       handleTextSelection(position, content)
                      return null;
                    }
                    return (
                      <Tip
                        onOpen={transformSelection}
                        onConfirm={(comment) => {
                          addHighlight({ content, position, comment });
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
                    const isTextHighlight = !highlight.content?.image;

                    const component = isTextHighlight ? (
                  
                  <CustomHighlight
              position={highlight.position}
              comment={highlight.comment}
              isScrolledTo={isScrolledTo}
              highlightColor={highlight.color}
              highlight = {highlight}
              handleDeleteHighlight={handleDeleteHighlight}
              updateHighlightColor={updateHighlightColor}
              onAskAI={handleAskAI}
              />
                    ) : (
                      <AreaHighlight
                        isScrolledTo={isScrolledTo}
                        highlight={highlight}
                        onChange={(boundingRect) => {
                          updateHighlight(
                            highlight.id,
                            { boundingRect: viewportToScaled(boundingRect) },
                            { image: screenshot(boundingRect) }
                          );
                        }}
                      />
                    );

                    return (
                      <Popup
                        popupContent={<HighlightPopup {...highlight} />}
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
                  highlights={highlights as any}
                />
              </div>
            );
          }}
        </PdfLoader>

        {/* Page indicator overlay */}
        <div className="sticky top-0 left-0 z-10 bg-white/80 backdrop-blur-sm text-xs py-1 px-2 rounded-br-md shadow-sm">
          Page {currentPage} of {loadedPdfDocument?.numPages || "?"}
        </div>
      </div>
    </div>
  );
}
