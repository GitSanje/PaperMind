"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Sparkles, FileText, Copy, CheckCheck, RefreshCw, ExternalLink } from "lucide-react"
import "katex/dist/katex.min.css"
import { Skeleton } from "@/components/ui/skeleton"
import { getSummary } from "@/actions/summary_llm"
import MathRenderer from "./markdown"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useGlobalContext } from "../context/globalcontext"
import { getHighlightsForCiteIds } from "@/actions/highlight-util"

interface SummarizeProps {
  filename?: string
  url?: string
  title?: string
  onNavigateToCitation?: (citation: string) => void
}


 
export function Summarize({ filename, url, title, onNavigateToCitation }: SummarizeProps) {

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>("summary")
  const contentRef = useRef<HTMLDivElement>(null)
 const {summary,setSummary,citeHighlights,setCiteHiglights,loadedPdfDocument} =useGlobalContext()


  // useEffect(() => {
  //  if(loadedPdfDocument){
  //   const getciteHiglights = async() => {
  //       return 
  //   } 
  //  }
  // },[loadedPdfDocument])
console.log('====================================');
console.log(citeHighlights,'citehightlights');
console.log('====================================');
  
  const fetchSummary = async () => {
    if (!filename && !url) {
      setError("Please provide a file or URL to summarize")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      if (filename) formData.append("filename", filename)
      if (url) formData.append("url", url)

      const result = await getSummary(formData)
      setSummary(result.allsummary)

      const getciteHiglights = await  getHighlightsForCiteIds(loadedPdfDocument!,result.chunkswitlables,result.allsummary)
      setCiteHiglights(getciteHiglights)
    } catch (err) {
      console.error("Error fetching summary:", err)
      setError("Failed to generate summary. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCitationClick = (citation: string) => {
    if (onNavigateToCitation) {
      onNavigateToCitation(citation)
    }
  }

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              {title || (filename ? filename : url ? "URL Summary" : "Document Summary")}
            </CardTitle>
          </div>
          <div className="flex gap-2">
            {summary && (
              <Button size="sm" variant="ghost" className="h-8 px-2" onClick={copyToClipboard}>
                {copied ? <CheckCheck className="h-4 w-4 text-green-500 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-2"
              onClick={fetchSummary}
              disabled={isLoading || (!filename && !url)}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
              Generate
            </Button>
          </div>
        </div>
        <CardDescription>AI-generated summary of your document</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="px-6 pt-2">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="citations">Citations</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="summary" className="flex-1 overflow-hidden p-6 pt-4">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[95%]" />
                <Skeleton className="h-4 w-[85%]" />
                <Skeleton className="h-4 w-[70%]" />
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 text-red-600 rounded-md">
                <p>{error}</p>
              </div>
            ) : summary ? (
              <ScrollArea className="h-full pr-4" ref={contentRef}>
                 <div className="prose prose-sm max-w-none dark:prose-invert">
                  <MathRenderer text={summary} />
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground h-full">
                <FileText className="h-10 w-10 mb-2 opacity-50" />
                <p>No summary available</p>
                <p className="text-sm mt-1">Click "Generate" to create a summary of your document</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="citations" className="flex-1 overflow-hidden p-6 pt-4">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Citations</h3>
                <p className="text-sm text-muted-foreground">
                  Click on any citation number in the summary to navigate to the corresponding section in the document.
                </p>

                {summary ? (
                  <div className="space-y-2 mt-4">
                    {/* Extract citations from summary and display them */}
                    {Array.from(summary.matchAll(/\[(\d+)\]/g)).map((match, index) => {
                      const citationNumber = match[1]
                      return (
                        <div key={index} className="p-3 border rounded-md">
                          <div className="flex items-center gap-2">
                            <span className="bg-primary/10 text-primary font-medium px-2 py-1 rounded-md">
                              [{citationNumber}]
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-auto"
                              onClick={() => handleCitationClick(citationNumber)}
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Go to reference
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Generate a summary to see citations</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
