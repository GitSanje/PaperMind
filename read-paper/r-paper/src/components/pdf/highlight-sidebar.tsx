"use client"


import { HighlightType } from "../context/globalcontext"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Trash2, ArrowRight, BookOpen, ImageIcon } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
// import "react-pdf-highlighter/dist/style.css";
interface SidebarProps {
  highlights: Array<HighlightType>
  resetHighlights?: () => void
 onDeleteHighlight?: (id: string) => void
  toggleDocument?: () => void
}

const updateHash = (highlight: HighlightType) => {
  document.location.hash = `highlight-${highlight.id}`
}

export function Sidebar({ highlights, resetHighlights,onDeleteHighlight, toggleDocument }: SidebarProps) {
  return (
    <div className="w-full bg-white rounded-lg border shadow-sm">
      <div className="p-4 border-b">
        <h3 className="font-medium text-xl">Highlights</h3>
        <p className="text-lg text-muted-foreground mt-1">
          {highlights.length} {highlights.length === 1 ? "highlight" : "highlights"}
           
        </p>
        <p className="text-sm text-muted-foreground mt-1">
  
            To create area highlight hold ⌥ Option key (Alt), then click and
            drag.
     
        </p>
      </div>

      {highlights.length > 0 ? (
        <ScrollArea className="h-[400px]">
          <ul className="divide-y">
            {highlights.map((highlight, index) => (
              <li
                key={highlight.id || index}
                className="p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => {
                  updateHash(highlight)
                }}
              >
                <div className="flex flex-col gap-2">
                  {highlight.comment?.text && (
                    <div className="font-medium text-sm">{highlight.comment.text}</div>
                  )}
                  
                  {highlight.content?.text ? (
                    <blockquote 
                      className="text-sm text-muted-foreground border-l-2 pl-2 italic"
                      style={{ borderColor: highlight?.color || "#FFEB3B" }}
                    >
                      {highlight.content.text.length > 90
                        ? `${highlight.content.text.slice(0, 90).trim()}…`
                        : highlight.content.text}
                    </blockquote>
                  ) : null}
                  
                  {highlight.content?.image ? (
                    <div className="mt-2 rounded-md overflow-hidden border">
                      <img 
                        src={highlight.content.image || "/placeholder.svg"} 
                        alt="Area highlight" 
                        className="max-w-full h-auto"
                      />
                    </div>
                  ) : null}
                  
                  
                  <div className="flex flex-row items-center justify-between mt-1">
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      Page {highlight.position.pageNumber}
                    </Badge>
                    
                    {highlight.content?.image && (
                      <Badge variant="secondary" className="text-xs">
                        <ImageIcon className="h-3 w-3 mr-1" />
                        Area
                      </Badge>
                    )}
                    <div className="">
                   {onDeleteHighlight && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => onDeleteHighlight(highlight.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    </div>
                  </div>

                  
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      ) : (
        <div className="p-6 text-center text-muted-foreground">
          <p>No highlights yet</p>
          <p className="text-sm mt-1">Select text in the PDF to highlight it</p>
        </div>
      )}
      
      <div className="p-3 border-t flex justify-between">
        {toggleDocument && (
          <Button variant="outline" size="sm" onClick={toggleDocument}>
            Toggle document
          </Button>
        )}
        
        {highlights.length > 0 && resetHighlights && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-destructive hover:text-destructive"
            onClick={resetHighlights}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Reset highlights
          </Button>
        )}
      </div>
    </div>
  )
}


