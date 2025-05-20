"use client"

import { Button } from "@/components/ui/button"
import { Trash2, ArrowRight } from "lucide-react"

interface NotesListProps {
  notes: Array<{
    id: string
    text: string
    color: string
    pageNumber: number
  }>
  onDeleteNote: (id: string) => void
  onJumpToPage: (pageNumber: number) => void
  currentPage: number
}

export default function NotesList({ notes, onDeleteNote, onJumpToPage, currentPage }: NotesListProps) {
  if (notes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No notes yet. Add notes while reading the PDF.</p>
      </div>
    )
  }

  // Group notes by page number
  const notesByPage: Record<number, typeof notes> = {}
  notes.forEach((note) => {
    if (!notesByPage[note.pageNumber]) {
      notesByPage[note.pageNumber] = []
    }
    notesByPage[note.pageNumber].push(note)
  })

  return (
    <div className="space-y-6">
      {Object.entries(notesByPage).map(([pageNumber, pageNotes]) => (
        <div key={pageNumber} className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Page {pageNumber}</h4>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => onJumpToPage(Number(pageNumber))}
            >
              Go to page
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>

          {pageNotes.map((note) => (
            <div key={note.id} className="p-3 rounded-md border" style={{ borderLeft: `4px solid ${note.color}` }}>
              <div className="flex justify-between items-start gap-2">
                <p className="text-sm whitespace-pre-wrap">{note.text}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={() => onDeleteNote(note.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
