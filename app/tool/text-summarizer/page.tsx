"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Copy, Download, RefreshCw } from "lucide-react"
import { toast } from "sonner"

export default function TextSummarizer() {
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState("")
  const [length, setLength] = useState("medium")

  const handleSummarize = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text to summarize")
      return
    }

    setLoading(true)
    try {
      // Simulate API response for demo
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const words = text.split(" ")
      const summaryLength = length === "short" ? 0.2 : length === "medium" ? 0.4 : 0.6
      const summaryWords = words.slice(0, Math.floor(words.length * summaryLength))
      const generatedSummary = summaryWords.join(" ")

      setSummary(generatedSummary)
      toast.success("Text summarized successfully!")
    } catch (error) {
      toast.error("Failed to summarize text")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(summary)
      toast.success("Summary copied to clipboard!")
    } catch (error) {
      toast.error("Failed to copy summary")
    }
  }

  const downloadSummary = () => {
    const blob = new Blob([summary], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "summary.txt"
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Summary downloaded!")
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">AI Text Summarizer</h1>
          <p className="text-muted-foreground">Generate concise summaries of your text using advanced AI</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Select value={length} onValueChange={setLength}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short Summary</SelectItem>
                    <SelectItem value="medium">Medium Summary</SelectItem>
                    <SelectItem value="long">Detailed Summary</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleSummarize}
                  disabled={loading || !text.trim()}
                  className="button-shine bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Summarizing...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Summarize
                    </>
                  )}
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Original Text</label>
                  <Textarea
                    placeholder="Enter your text here..."
                    className="min-h-[300px] resize-none"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                  <div className="text-sm text-muted-foreground">
                    {text.trim().split(/\s+/).filter(Boolean).length} words
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Summary</label>
                  {loading ? (
                    <div className="border rounded-md p-4 min-h-[300px] flex items-center justify-center">
                      <div className="space-y-4 w-full max-w-xs">
                        <Progress value={45} />
                        <p className="text-sm text-center text-muted-foreground">
                          Analyzing and summarizing your text...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative border rounded-md p-4 min-h-[300px]">
                      {summary ? (
                        <>
                          <div className="prose dark:prose-invert max-w-none">
                            <div className="whitespace-pre-wrap">{summary}</div>
                          </div>
                          <div className="absolute top-2 right-2 flex gap-2">
                            <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={downloadSummary}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center text-muted-foreground">Your summary will appear here</div>
                      )}
                    </div>
                  )}
                  {summary && (
                    <div className="text-sm text-muted-foreground">
                      {summary.trim().split(/\s+/).filter(Boolean).length} words
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
