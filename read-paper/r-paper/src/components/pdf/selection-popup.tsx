"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BookOpen, BrainCircuit, Copy, X } from "lucide-react"

interface SelectionPopupProps {
  position: { x: number; y: number }
  selectedText: string
  onDictionaryLookup: (word: string) => void
  onAskAI: (query: string) => void
  onClose: () => void
}

export function SelectionPopup({ position, selectedText, onDictionaryLookup, onAskAI, onClose }: SelectionPopupProps) {
  const menuRef = useRef<HTMLDivElement>(null)
console.log('====================================');
console.log(selectedText);
console.log('====================================');
  // Adjust position to ensure menu stays within viewport
  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - 200),
    y: Math.min(position.y, window.innerHeight - 150),
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedText)
    onClose()
  }

  // Get the first word for dictionary lookup
  const getFirstWord = () => {
    const firstWord = selectedText.trim().split(/\s+/)[0]
    return firstWord.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
  }

  return (
    <Card
      ref={menuRef}
      className="absolute z-50 p-2 shadow-lg bg-white rounded-lg"
      style={{
        top: adjustedPosition.y,
        left: adjustedPosition.x,
        transform: "translate(-50%, -100%)",
      }}
    >
      <div className="flex flex-col gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 justify-start"
          onClick={() => onDictionaryLookup(getFirstWord())}
        >
          <BookOpen className="h-4 w-4" />
          <span>Dictionary Lookup</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 justify-start"
          onClick={() => onAskAI(selectedText)}
        >
          <BrainCircuit className="h-4 w-4" />
          <span>Ask AI</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex items-center gap-2 justify-start" onClick={handleCopy}>
          <Copy className="h-4 w-4" />
          <span>Copy</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 justify-start text-destructive"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
          <span>Close</span>
        </Button>
      </div>
    </Card>
  )
}
