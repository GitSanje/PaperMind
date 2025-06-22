"use client";

import type React from "react";
import { useEffect } from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileUp,
  Save,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  CircleSlash,
  BookOpen,
  BrainCircuit,
  Sparkles,
  LinkIcon,
  Database,
} from "lucide-react";

import PDFViewer from "@/components/pdf/pdf-viewer";
import NotesList from "@/components/pdf/notes-list";

import { Sidebar } from "@/components/pdf/highlight-sidebar";

import { AskAI } from "@/components/pdf/ask-ai";
import { useGlobalContext } from "../context/globalcontext";
import { DictionaryLookup } from "./dictionary-lookup";
import { SelectionPopup } from "./selection-popup";

import { Summarize } from "./summerize";
import { Input } from "../ui/input";
import { deleteHighlight } from "../../../redux/highlightSlice";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";

import Link from "next/link";
import CreatePage from "../notion/create-page";
import { NotionConnectButton } from "../notion/notion-connect-button";
import { Session } from "next-auth";
import { NotionSyncPanel } from "../notion/notion-sync-panel";

import { HighlightType } from "../context/globalcontext";
import { getPdfTitle } from "@/actions/summary_llm";
import { updatePdfState } from "../../../redux/pdfSlice";
const highlightOptions = [
  "#FFEB3B",
  "#4CAF50",
  "#2196F3",
  "#F44336",
  "#9C27B0",
  { type: "none" }, // icon button to disable selection
];

export default function PDFViewerPage({ session }: { session: Session }) {
  const [notes, setNotes] = useState<
    Array<{
      id: string;
      text: string;
      color: string;
      pageNumber: number;
      pdfname: string;
    }>
  >([]);
  const [currentNote, setCurrentNote] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [activeHighlightColor, setActiveHighlightColor] = useState("#FFEB3B");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [isurl, IsSetUrl] = useState<boolean>(false);
  const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 });
  const [dictionaryWord, setDictionaryWord] = useState("");
  

  const {
    pagehighlights,
    setHighlights,
    selectedText,
    setSelectedText,
    setShowSelectionPopup,
    showSelectionPopup,
  } = useGlobalContext();

  
  const tab = useAppSelector((state) => state.pdfsetting.tab);
  const isSelecting = useAppSelector((state) => state.pdfsetting.isSelecting);
  const file = useAppSelector((state) => state.pdfsetting.file);
  const url = useAppSelector((state) => state.pdfsetting.url);
   const pdfTitle = useAppSelector((state) => state.pdfsetting.pdfTitle);
  const highlights = useAppSelector((state) => state.highlight.highlights);
  const highlightStatus = useAppSelector((state) => state.notion.highlightStatus);
  const isConnected = useAppSelector((state) => state.notion.isConnected);

  const completedIds = new Set(
  highlightStatus
    .filter((h) => h.status === "completed")
    .map((h) => h.id)
);

const highlightText = highlights
  .filter((h) => h.content.text && !h.url && !completedIds.has(h.id));
  const dispatch = useAppDispatch();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      dispatch(updatePdfState({file: 
        e.target.files[0]}));
      setCurrentPage(1);
      setNotes([]);
    }
  };




  const handleAddNote = () => {
    if (!file) return;
    if (currentNote.trim()) {
      const newNote = {
        id: Date.now().toString(),
        text: currentNote,
        color: activeHighlightColor,
        pageNumber: currentPage,
        pdfname: file?.name!,
      };
      setNotes([...notes, newNote]);
      setCurrentNote("");
    }
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  const handleSaveWork = () => {
    if (!file) return;

    const data = {
      fileName: file.name,
      notes,
      pagehighlights,
      lastPage: currentPage,
    };

    localStorage.setItem("pdfViewerState", JSON.stringify(data));
    alert("Your work has been saved!");
  };

  const handleLoadSavedWork = () => {
    const savedData = localStorage.getItem("pdfViewerState");
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setNotes(data.notes || []);
        if (data.highlights) setHighlights(data.highlights);
        setCurrentPage(data.lastPage || 1);
        alert("Your saved work has been loaded!");
      } catch (error) {
        console.error("Error loading saved work:", error);
        alert("Failed to load saved work!");
      }
    } else {
      alert("No saved work found!");
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const resetHighlights = () => {
    setHighlights([]);
  };

  const handleJumpToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);

    // Scroll to the page
    if (pdfContainerRef.current) {
      const pageElement = pdfContainerRef.current.querySelector(
        `[data-page-number="${pageNumber}"]`
      );
      if (pageElement) {
        pageElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // Handle text selection
  const handleTextSelection = (
    text: string,
    position: { x: number; y: number }
  ) => {
    if (text && text.trim() && !isSelecting) {
      setSelectedText(text);
      setSelectionPosition(position);
      setShowSelectionPopup(true);
    }
  };

  // Handle dictionary lookup
  const handleDictionaryLookup = (word: string) => {
    setDictionaryWord(word || selectedText);
    dispatch(updatePdfState({tab:"tool"}));
    setShowSelectionPopup(false);
  };

  /**
   * Sets an AI query (either custom or from the selected text),
   * switches to the AI tab, and closes the popup.
   *
   * @param {string} query - User's question or text for AI
   */
  const handleAskAI = (query: string) => {
    dispatch(updatePdfState({aiQuery:query}));
        dispatch(updatePdfState({tab:"ai"}));
    setShowSelectionPopup(false);
  };

  useEffect(() => {
    if (totalPages > 0 && pdfContainerRef.current) {
      const timeout = setTimeout(() => {
        const pages =
          pdfContainerRef.current?.querySelectorAll("[data-page-number]");

        if (!pages || pages.length === 0) return;

        observerRef.current = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const pageElement = entry.target as HTMLElement;
                const pageNumber = Number.parseInt(
                  pageElement.getAttribute("data-page-number") || "1",
                  10
                );
                setCurrentPage((prev) =>
                  prev !== pageNumber ? pageNumber : prev
                );
              }
            });
          },
          {
            threshold: 0.3,
            rootMargin: "0px 0px -20% 0px",
            root: pdfContainerRef.current,
          }
        );

        pages.forEach((page) => observerRef.current?.observe(page));
      }, 1000);

      return () => {
        clearTimeout(timeout);
        observerRef.current?.disconnect();
      };
    }
  }, [totalPages, setCurrentPage, pdfContainerRef]);

  const handleTabChange = (newTab: string) => {
      dispatch(updatePdfState({tab:newTab}));
  };
  const notionAuthUrl = process.env.NEXT_PUBLIC_NOTION_AUTH_URL;
  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button
                onClick={triggerFileInput}
                variant="outline"
                className="gap-2"
              >
                <FileUp className="h-4 w-4" />
                Upload PDF
              </Button>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
              />
              {file && (
                <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                  {file.name}
                </p>
              )}
            </div>

            {/* {file && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setScale((prev) => Math.max(0.5, prev - 0.1))}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm">{Math.round(scale * 100)}%</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setScale((prev) => Math.min(2, prev + 0.1))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            )} */}
          </div>

          {file || url ? (
            <Card className="border rounded-lg overflow-hidden">
              <CardContent className="p-0 relative">
                <div className="h-[600px]" ref={pdfContainerRef}>
                  <PDFViewer
                    url={url!}
                    file={file!}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    setTotalPages={setTotalPages}
                    scale={scale}
                    activeHighlightColor={activeHighlightColor}
                    onTextSelection={handleTextSelection}
                    session = {session}
                  />
                </div>
                {showSelectionPopup && (
                  <SelectionPopup
                    position={selectionPosition}
                    selectedText={selectedText}
                    onDictionaryLookup={handleDictionaryLookup}
                    onAskAI={handleAskAI}
                    onClose={() => setShowSelectionPopup(false)}
                  />
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="border rounded-lg flex items-center justify-center h-[600px] bg-muted/20">
              <div className="text-center p-6">
                <FileUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No PDF Loaded</h3>
                <p className="text-muted-foreground mb-4">
                  Upload a PDF to get started with highlighting and note-taking
                </p>
                <Button onClick={triggerFileInput}>Select PDF File</Button>

                <p className="text-muted-foreground mb-4"> or </p>

                <div className="space-y-2 mb-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter PDF URL (e.g., https://example.com/document.pdf)"
                      value={url!}
                      onChange={(e) => dispatch(updatePdfState({ url:e.target.value}))}
                      onKeyDown={(e) => e.key === "Enter"}
                      className="flex-1"
                    />
                    <Button className="gap-2" onClick={() => IsSetUrl(true)}>
                      <LinkIcon className="h-4 w-4" />
                      Load PDF
                      {/* {isLoadingUrl ? "Loading..." : "Load PDF"} */}
                    </Button>
                  </div>
                  {/* {urlError && <p className="text-sm text-red-600">{urlError}</p>}
                {pdfUrl && <p className="text-sm text-muted-foreground truncate">Loaded: {pdfUrl}</p>} */}
                </div>
              </div>
            </div>
          )}

          {file && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage >= totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleSaveWork}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Work
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLoadSavedWork}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Load Saved
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid grid-cols-4 ">
              <TabsTrigger value="tool" className="text-indigo-600">
                Tools
              </TabsTrigger>
              <TabsTrigger value="highlights" className="text-indigo-600">
                Highlights
              </TabsTrigger>
              <TabsTrigger
                value="summerize"
                className="flex items-center gap-1 text-indigo-600"
              >
                <Sparkles className="h-4 w-4" />
                Summerize
              </TabsTrigger>

              <TabsTrigger
                value="ai"
                className="flex items-center gap-1 text-indigo-600"
              >
                <BrainCircuit className="h-4 w-4" />
                Ask AI
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tool" className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-3">Highlight Colors</h3>
                <div className="flex gap-2 flex-wrap">
                  {highlightOptions.map((option, index) => {
                    if (typeof option === "string") {
                      return (
                        <button
                          key={option}
                          className={`w-8 h-8 rounded-full transition-all ${
                            isSelecting && activeHighlightColor === option
                              ? "ring-2 ring-offset-2 ring-black"
                              : ""
                          }`}
                          style={{ backgroundColor: option }}
                          onClick={() => {
                            setActiveHighlightColor(option);
                            dispatch(updatePdfState({isSelecting:true}));
                          }}
                        />
                      );
                    } else {
                      return (
                        <button
                          key={`none-${index}`}
                          className={`w-8 h-8 rounded-full transition-all flex items-center justify-center border text-red-700 ${
                            !isSelecting
                              ? "ring-2 ring-offset-2 ring-black"
                              : ""
                          }`}
                          title="Disable highlight mode"
                          onClick={() => {
                            dispatch(updatePdfState({isSelecting:false}));
                          }}
                        >
                          <CircleSlash className="w-4 h-4" />
                        </button>
                      );
                    }
                  })}
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  {isSelecting
                    ? "Select text in the PDF to highlight it with the selected color"
                    : "Highlight mode is disabled. Select text to look up in dictionary or ask AI"}
                </p>
              </div>

              <Card>
                <CardContent className="p-4">
                  <Tabs defaultValue="dictionary" className="w-full">
                    <TabsList className="grid grid-cols-2 mb-4">
                      <TabsTrigger
                        value="dictionary"
                        className="flex items-center gap-1"
                      >
                        <BookOpen className="h-4 w-4" />
                        Dictionary
                      </TabsTrigger>
                      <TabsTrigger value="notes">Notes</TabsTrigger>
                    </TabsList>

                    <TabsContent value="dictionary">
                      <DictionaryLookup
                        word={dictionaryWord}
                        setWord={setDictionaryWord}
                      />
                    </TabsContent>
                    <TabsContent value="notes">
                      <Card>
                        <CardContent className="p-4">
                          <h3 className="font-medium mb-3">Your Notes</h3>
                          <div className="p-4 border rounded-lg">
                            <h3 className="font-medium mb-3">Add Note</h3>
                            <Textarea
                              placeholder="Type your note here..."
                              value={currentNote}
                              onChange={(e) => setCurrentNote(e.target.value)}
                              className="mb-3"
                              rows={4}
                            />
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                For page {currentPage}
                              </span>
                              <Button
                                onClick={handleAddNote}
                                size="sm"
                                className="gap-1"
                                disabled={!file}
                              >
                                <Plus className="h-4 w-4" />
                                Add Note
                              </Button>
                            </div>
                          </div>
                          <Separator className="my-2" />

                          <ScrollArea className="h-[500px] pr-4">
                            <NotesList
                              notes={notes}
                              onDeleteNote={handleDeleteNote}
                              onJumpToPage={handleJumpToPage}
                              currentPage={currentPage}
                            />
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
              <NotionConnectButton userId={session?.user.id} />

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-3">Export Options</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      Export highlights as JSON
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Export notes as Markdown
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Generate PDF report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="highlights">
              <Sidebar
                resetHighlights={resetHighlights}
                ispdfAvailable={!!file || isurl}
              />
              {/* Notion Sync Panel */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Database className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium">Notion Sync</h3>
                  </div>
                  <NotionSyncPanel
                    userId={session?.user.id}
                    highlights={highlightText as HighlightType[]}
                    pdfTitle={pdfTitle!}
                    pdfUrl={url!}
                    isConnected={isConnected}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="summerize">
              <Card>
                <CardContent className="p-4 max-h-[600px] overflow-y-auto">
                  {file || url ? (
                    <Summarize filename={file?.name as string} url={url!} />
                  ) : (
                    "Upload file to summerize"
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai">
              <Card>
                <CardContent className="p-4 max-h-[600px] overflow-y-auto">
                  <AskAI file={file!} url={url!} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
