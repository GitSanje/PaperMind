"use client"
import "react-pdf-highlighter/dist/style/Highlight.css"
import type React from "react"

import type { LTWHP } from "react-pdf-highlighter"
import { hexToRgba } from "@/lib/utils"
import { useState, useRef, useEffect } from "react"
import { Trash2, MessageCircle, Palette, X } from "lucide-react"
import { HighlightType } from "../context/globalcontext"

interface Props {
  position: {
    boundingRect: LTWHP
    rects: Array<LTWHP>
  }
  onClick?: () => void
  onMouseOver?: () => void
  onMouseOut?: () => void
  comment: {
    emoji?: string
    text?: string
  }
  isScrolledTo: boolean
  highlightColor?: string
  highlight: HighlightType
   handleDeleteHighlight?: (id: string) => void
  updateHighlightColor?: (id: string, color: string) => void
  onAskAI?: (text: string) => void
}

const colorOptions = ["#FFEB3B", "#4CAF50", "#2196F3", "#F44336", "#9C27B0"]

export function CustomHighlight({
  position,
  onClick,
  onMouseOver,
  onMouseOut,
  comment,
  isScrolledTo,
  highlightColor,
  highlight,
  handleDeleteHighlight,
  updateHighlightColor,
  onAskAI,
}: Props) {
  const { rects, boundingRect } = position

  const [showPopup, setShowPopup] = useState(false)
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 })
  const popupRef = useRef<HTMLDivElement>(null)

  //Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowPopup(false)
      }
    }

    if (showPopup) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showPopup])

  const handleHighlightClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation() // prevent bubbling

    // Calculate position for popup
    const { clientX, clientY } = e
 
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Adjust position to keep popup in viewport
    const left = Math.min(clientX, viewportWidth - 200)
    const top = Math.min(clientY, viewportHeight - 150)

    setPopupPosition({ top: top-20, left: left-100  })
    // setPopupPosition({ top: clientY, left: clientX });
    setShowPopup((prev) => !prev)
    onClick?.()
  }

  const handleColorChange = (color: string) => {
    updateHighlightColor&& updateHighlightColor(highlight.id, color)
    setShowPopup(false)
  }

  const handleAskAI = () => {
    if (highlight.content?.text && onAskAI) {
      onAskAI(highlight.content.text)
      setShowPopup(false)
    }
  }

  return (
    <div
      className={` relative Highlight ${isScrolledTo ? "Highlight--scrolledTo" : ""}`}
      style={{
        background: isScrolledTo ? hexToRgba(highlightColor || "#FFEB3B", 0.6) : undefined,
      }}
    >
      {comment?.emoji ? (
        <div
          className="Highlight__emoji"
          style={{
            left: 20,
            top: boundingRect.top,
          }}
        >
          {comment.emoji}
        </div>
      ) : null}

      <div className="Highlight__parts">
        {rects.map((rect, index) => (
          <div
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
            onClick={handleHighlightClick}
            key={index}
            style={{
              ...rect,
              backgroundColor: highlightColor || "#FFEB3B",
            }}
            className="Highlight__part"
          />
        ))}
      </div>

      {showPopup && (
      <div
  ref={popupRef}

  style={{
    position: "absolute",
     zIndex: 50,
     opacity: 1,
   backgroundColor: "ffff",
    borderRadius: "0.5rem",       
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)", 
    border: "1px solid rgb(15, 58, 144)",   
    padding: "0.75rem",            
    width: "220px",
    maxHeight: "200px",
    top: popupPosition.top,
    left: popupPosition.left,
  }}
>

          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-sm">Highlight Options</h4>
            <button onClick={() => setShowPopup(false)} className="text-gray-500 hover:text-gray-700">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-1 mb-2 text-xs text-gray-500">
                <Palette className="h-3 w-3" />
                <span>Change Color</span>
              </div>
              <div className="flex gap-2 justify-between">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(hexToRgba(color, 0.6))}
                    className={`w-8 h-8 rounded-full cursor-pointer transition-all ${
                      highlightColor === color ? "ring-2 ring-offset-1 ring-black" : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Change highlight color to ${color}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-2 border-t">
              <button
                onClick={() => {
                 if(handleDeleteHighlight ){
                   handleDeleteHighlight(highlight.id )
                 }
                 
                  setShowPopup(false)
                }}
                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </button>

              <button
                onClick={handleAskAI}
                disabled={!highlight.content?.text}
                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageCircle className="h-3 w-3" />
                Ask AI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
