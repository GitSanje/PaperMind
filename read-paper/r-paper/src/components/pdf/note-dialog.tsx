"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { CirclePlus } from "lucide-react"

interface NoteDialogProps {
  onAddNote: (note: string) => void
  currentPage: number
  color: string
}

export function NoteDialog({ onAddNote, currentPage, color }: NoteDialogProps) {
  const [note, setNote] = useState("")
  const [open, setOpen] = useState(false)

  const handleSubmit = () => {
    if (note.trim()) {
      onAddNote(note)
      setNote("")
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <CirclePlus className="h-4 w-4" />
          Add Note
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Note for Page {currentPage}</DialogTitle>
          <DialogDescription>Add your thoughts, questions, or important information about this page.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            placeholder="Type your note here..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-[150px]"
            autoFocus
          />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: color }} title="Note color"></div>
            <span className="text-sm text-muted-foreground">This note will be associated with page {currentPage}</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Note</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
