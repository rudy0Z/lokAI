"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Wand2, RefreshCw, Download, History, Sparkles, ImageIcon } from "lucide-react"
import { toast } from "sonner"

export default function ImageGeneration() {
  const [generatingImage, setGeneratingImage] = useState(false)
  const [imagePrompt, setImagePrompt] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [generationHistory, setGenerationHistory] = useState<
    Array<{
      prompt: string
      url: string
      timestamp: string
    }>
  >([])

  const generateImage = async (prompt: string): Promise<string | null> => {
    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate image")
      }

      const data = await response.json()
      return data.url
    } catch (error) {
      console.error("Generation error:", error)
      throw error
    }
  }

  const handleGenerate = async () => {
    if (!imagePrompt.trim()) {
      toast.error("Please enter an image description")
      return
    }

    setGeneratingImage(true)
    try {
      const url = await generateImage(imagePrompt)
      if (url) {
        setImageUrl(url)
        setGenerationHistory((prev) => [
          {
            prompt: imagePrompt,
            url,
            timestamp: new Date().toLocaleString(),
          },
          ...prev,
        ])
        toast.success("Image generated successfully!")
      }
    } catch (error) {
      toast.error("Failed to generate image")
    } finally {
      setGeneratingImage(false)
    }
  }

  const downloadImage = async () => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `generated-image-${Date.now()}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success("Image downloaded!")
    } catch (error) {
      toast.error("Failed to download image")
    }
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">AI Image Generation</h1>
          <p className="text-muted-foreground">Create unique images using advanced AI technology</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="imagePrompt">Image Description</Label>
                  <Textarea
                    id="imagePrompt"
                    placeholder="Describe the image you want to generate..."
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    className="min-h-[150px]"
                  />
                </div>

                <div className="flex gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Sparkles className="h-4 w-4" />
                    AI-Powered
                  </Badge>
                  <Badge variant="outline">High Resolution</Badge>
                  <Badge variant="outline">Commercial Use</Badge>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={generatingImage}
                  className="w-full bg-green-600 hover:bg-green-700 button-shine"
                >
                  {generatingImage ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Generate Image
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Generated Image</h3>
                  {imageUrl && (
                    <Button variant="outline" size="sm" onClick={downloadImage}>
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {imageUrl ? (
                  <div className="relative group">
                    <img
                      src={imageUrl || "/placeholder.svg"}
                      alt="Generated"
                      className="rounded-lg w-full object-cover"
                      onError={() => {
                        setImageUrl("")
                        toast.error("Failed to load image")
                      }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <p className="text-white text-sm">Click download to save</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg">
                    <div className="text-center text-muted-foreground">
                      <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                      <p>Generated image will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {generationHistory.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  <h3 className="font-medium">Generation History</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {generationHistory.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <img
                        src={item.url || "/placeholder.svg"}
                        alt={item.prompt}
                        className="rounded-lg w-full h-32 object-cover"
                      />
                      <p className="text-sm truncate">{item.prompt}</p>
                      <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
