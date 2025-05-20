"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { BrainCircuit, Send, Trash2, Copy, CheckCheck, FileText } from "lucide-react"
import { genText } from "@/actions/llm"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import "katex/dist/katex.min.css"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface AskAIProps {
  query: string
  setQuery: (query: string) => void
  file?: File
  url?: string
}

export function AskAI({ query, setQuery, file, url }: AskAIProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [streamingResponse, setStreamingResponse] = useState("")
  const [conversation, setConversation] = useState<Array<{ role: "user" | "ai"; content: string }>>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState<string | null>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversation, streamingResponse])

  // // Update query when prop changes
  // useEffect(() => {
  //   if (query && !conversation.some((msg) => msg.content === query)) {
  //     handleSubmit()
  //   }
  // }, [query])

  const handleSubmit = async () => {
    if (!query.trim()) return

    setIsLoading(true)
    setStreamingResponse("")

    // Add user message to conversation
    const newConversation = [...conversation, { role: "user" as const, content: query }]
    setConversation(newConversation)

    try {
      // Prepare form data
      const formData = new FormData()
      if (file) formData.append("file", file)
      formData.append("query", query)
      if (url) formData.append("url", url)

      // Simulate streaming for demo purposes
      // In a real implementation, you would use a streaming API
      const fullResponse = await genText(formData)

      // Simulate streaming by revealing characters gradually
      let displayedResponse = ""
      const streamResponse = async () => {
        for (let i = 0; i < fullResponse.length; i++) {
          displayedResponse += fullResponse[i]
          setStreamingResponse(displayedResponse)
          await new Promise((resolve) => setTimeout(resolve, 10)) // Adjust speed as needed
        }

        // When streaming is complete, add to conversation
        setConversation([...newConversation, { role: "ai", content: fullResponse }])
        setStreamingResponse("")
      }

      await streamResponse()

      // Clear the input
      setQuery("")
    } catch (error) {
      console.error("Error getting AI response:", error)
      setConversation([
        ...newConversation,
        {
          role: "ai",
          content: "Sorry, I encountered an error processing your request. Please try again.",
        },
      ])
      setStreamingResponse("")
    } finally {
      setIsLoading(false)
    }
  }

  const clearConversation = () => {
    setConversation([])
    setQuery("")
    setStreamingResponse("")
  }

  const copyToClipboard = (text: string, messageId: number) => {
    navigator.clipboard.writeText(text)
    setCopied(String(messageId))
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium flex items-center gap-2">
          <BrainCircuit className="h-4 w-4" />
          Ask AI about your PDF
        </h3>
        {conversation.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearConversation} className="gap-1">
            <Trash2 className="h-3 w-3" />
            Clear Chat
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 pr-4 mb-4 h-[400px]">
        {conversation.length > 0 || streamingResponse ? (
          <div className="space-y-4">
            {conversation.map((message, index) => (
              <MessageBubble
                key={index}
                message={message}
                index={index}
                onCopy={copyToClipboard}
                copied={copied === String(index)}
              />
            ))}

            {/* Streaming message */}
            {streamingResponse && (
              <div className="relative group">
                <Card className="bg-white border-primary/10">
                  <CardContent className="p-4 pt-3">
                    <div className="flex items-center gap-2 mb-2 text-primary">
                      <BrainCircuit className="h-4 w-4" />
                      <span className="font-medium">AI Assistant</span>
                    </div>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                          code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || "")
                            return !inline && match ? (
                              <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" {...props}>
                                {String(children).replace(/\n$/, "")}
                              </SyntaxHighlighter>
                            ) : (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            )
                          },
                        }}
                      >
                        {streamingResponse}
                      </ReactMarkdown>
                    </div>
                    <div className="h-4 w-4 mt-1">
                      <span className="inline-block h-2 w-2 bg-primary rounded-full animate-pulse"></span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="p-6 text-center text-muted-foreground">
              <BrainCircuit className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Ask questions about the content in your PDF</p>
              <p className="text-sm mt-1">Try "Explain this concept" or "Summarize this section"</p>
            </CardContent>
          </Card>
        )}
      </ScrollArea>

      <div className="flex gap-2 mt-auto">
        <Textarea
          placeholder="Ask a question about your PDF..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
          className="min-h-[80px] resize-none"
        />
        <Button onClick={handleSubmit} disabled={isLoading || !query.trim()} className="self-end" variant="default">
          {isLoading ? (
            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}

interface MessageBubbleProps {
  message: { role: "user" | "ai"; content: string }
  index: number
  onCopy: (text: string, index: number) => void
  copied: boolean
}

function MessageBubble({ message, index, onCopy, copied }: MessageBubbleProps) {
  return (
    <div className="relative group">
      <Card className={cn(message.role === "user" ? "bg-muted/50 border-muted" : "bg-white border-primary/10")}>
        <CardContent className="p-4 pt-3">
          {message.role === "ai" ? (
            <div className="flex items-center gap-2 mb-2 text-primary">
              <BrainCircuit className="h-4 w-4" />
              <span className="font-medium">AI Assistant</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span className="font-medium">You</span>
            </div>
          )}

          {message.role === "ai" ? (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "")
                    return !inline && match ? (
                      <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" {...props}>
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    )
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </CardContent>
      </Card>

      {/* Copy button */}
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onCopy(message.content, index)}
      >
        {copied ? <CheckCheck className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  )
}
