"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Volume2, ExternalLink } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface DictionaryResult {
  word: string
  phonetic?: string
  phonetics: Array<{
    text?: string
    audio?: string
  }>
  meanings: Array<{
    partOfSpeech: string
    definitions: Array<{
      definition: string
      example?: string
      synonyms?: string[]
      antonyms?: string[]
    }>
    synonyms?: string[]
    antonyms?: string[]
  }>
  sourceUrls?: string[]
}

interface DictionaryLookupProps {
  word: string
  setWord: (word: string) => void
}

export function DictionaryLookup({ word, setWord }: DictionaryLookupProps)

{
    const [searchTerm, setSearchTerm] = useState(word)
  const [results, setResults] = useState<DictionaryResult[] | null>(null)
  const [loading, setLoading] = useState(false)

  const [error, setError] = useState<string | null>(null)

  // Update search term when word prop changes
  useEffect(() => {
    if (word) {
      setSearchTerm(word)
      handleSearch(word)
    }
  }, [word])

  const handleSearch = async (term: string = searchTerm) => {
    if (!term.trim()) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(term)}`)

      if (!response.ok) {
        if (response.status === 404) {
          setError(`No definitions found for "${term}"`)
        } else {
          setError(`Error: ${response.statusText}`)
        }
        setResults(null)
        setLoading(false)
        return
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError("Failed to fetch dictionary data. Please try again.")
      setResults(null)
    } finally {
      setLoading(false)
    }
  }

  const playAudio = (audioUrl: string) => {
    if (!audioUrl) return
    const audio = new Audio(audioUrl)
    audio.play()
  }

return (

<div className="space-y-4">



     <div className="flex gap-2">
        <Input
          placeholder="Enter a word to look up"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={() => handleSearch()} className="gap-1">
          <Search className="h-4 w-4" />
          Lookup
        </Button>
      </div>

       {loading && (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      )}

       {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try checking the spelling or looking up a different word.
            </p>
          </CardContent>
        </Card>
      )}
      {results && results.length > 0 && (
        <ScrollArea className="h-[400px]">
          {results.map((result, index) => (
            <Card key={index} className="mb-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{result.word}</CardTitle>
                    {result.phonetic && <CardDescription>{result.phonetic}</CardDescription>}
                  </div>
                  {result.phonetics && result.phonetics.some((p) => p.audio) && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => playAudio(result.phonetics.find((p) => p.audio)?.audio || "")}
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={result.meanings[0]?.partOfSpeech || "noun"}>
                  <TabsList className="mb-2">
                    {result.meanings.map((meaning, i) => (
                      <TabsTrigger key={i} value={meaning.partOfSpeech}>
                        {meaning.partOfSpeech}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {result.meanings.map((meaning, i) => (
                    <TabsContent key={i} value={meaning.partOfSpeech} className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Definitions</h4>
                        <ul className="list-disc pl-5 space-y-2">
                          {meaning.definitions.map((def, j) => (
                            <li key={j}>
                              <p>{def.definition}</p>
                              {def.example && (
                                <p className="text-sm text-muted-foreground mt-1 italic">"{def.example}"</p>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {meaning.synonyms && meaning.synonyms.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Synonyms</h4>
                          <div className="flex flex-wrap gap-1">
                            {meaning.synonyms.map((synonym, j) => (
                              <Button
                                key={j}
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSearchTerm(synonym)
                                  handleSearch(synonym)
                                }}
                              >
                                {synonym}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      {meaning.antonyms && meaning.antonyms.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Antonyms</h4>
                          <div className="flex flex-wrap gap-1">
                            {meaning.antonyms.map((antonym, j) => (
                              <Button
                                key={j}
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSearchTerm(antonym)
                                  handleSearch(antonym)
                                }}
                              >
                                {antonym}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>

                {result.sourceUrls && result.sourceUrls.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <a
                      href={result.sourceUrls[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Source
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </ScrollArea>
      )}

      </div>
)

}