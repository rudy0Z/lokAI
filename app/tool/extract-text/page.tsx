"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
  FileUp,
  Copy,
  Download,
  FileText,
  ImageIcon,
  Languages,
  CheckCircle,
  Scan,
  RefreshCw,
  Highlighter,
  RotateCw,
  Wand2,
  Trash2,
  ZoomIn,
  ZoomOut,
  Filter,
  FileSearch,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import AnimatedBackground from "@/components/animated-background"
import { extractTextFromImage, enhanceImageForOCR } from "@/lib/document-parser"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface ImageAnalysis {
  objects: string[]
  colors: { color: string; percentage: number }[]
  faces: number
  text: string[]
  quality: {
    brightness: number
    contrast: number
    sharpness: number
    resolution: number
  }
  metadata: {
    format: string
    dimensions: string
    size: string
    creationDate?: string
    lastModified?: string
    camera?: string
    location?: string
  }
  languages?: string[]
  confidence?: number
  orientation?: number
  textRegions?: {
    x: number
    y: number
    width: number
    height: number
    text: string
    confidence: number
  }[]
  documentType?: string
  documentStructure?: {
    title?: string
    headings: number
    paragraphs: number
    lists: number
    tables: number
    images: number
    signatures?: number
  }
}

interface ExtractedTextInfo {
  content: string
  metadata: {
    language: string
    confidence: number
    wordCount: number
    characterCount: number
    sentences: number
    paragraphs: number
    formatting: {
      alignment: string
      fontFamilies: string[]
      fontSize: string
      styles: string[]
    }
    keywords: string[]
    sentiment: {
      score: number
      label: string
    }
    readability: {
      score: number
      level: string
      fleschKincaid: number
    }
    entities?: {
      people: string[]
      organizations: string[]
      locations: string[]
      dates: string[]
    }
  }
  structure: {
    headings: number
    lists: number
    tables: number
    images: number
    equations?: number
    codeBlocks?: number
    citations?: number
  }
  summary?: string
  topics?: string[]
  fingerprint?: string
}

export default function ExtractText() {
  const [loading, setLoading] = useState(false)
  const [extractedText, setExtractedText] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedLanguage, setSelectedLanguage] = useState("auto") // Default to auto-detect
  const [textInfo, setTextInfo] = useState<ExtractedTextInfo | null>(null)
  const [processingStage, setProcessingStage] = useState<string>("")
  const [processingProgress, setProcessingProgress] = useState(0)
  const [preserveFormatting, setPreserveFormatting] = useState(true)
  const [enhanceQuality, setEnhanceQuality] = useState(true)
  const [confidenceThreshold, setConfidenceThreshold] = useState(70)
  const [showTextRegions, setShowTextRegions] = useState(false)
  const [imageRotation, setImageRotation] = useState(0)
  const [showOriginalImage, setShowOriginalImage] = useState(false)
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null)
  const [showEnhancedPreview, setShowEnhancedPreview] = useState(false)
  const [selectedTextRegion, setSelectedTextRegion] = useState<number | null>(null)
  const [showFullScreenImage, setShowFullScreenImage] = useState(false)
  const [documentType, setDocumentType] = useState<string>("auto")
  const [processingStartTime, setProcessingStartTime] = useState<number>(0)
  const [ocrEngine, setOcrEngine] = useState<string>("advanced")
  const [showSummary, setShowSummary] = useState(false)
  const [showTopics, setShowTopics] = useState(false)
  const [showEntities, setShowEntities] = useState(false)
  const [showKeywords, setShowKeywords] = useState(true)
  const [showReadability, setShowReadability] = useState(true)
  const [showSentiment, setShowSentiment] = useState(true)
  const [showStructure, setShowStructure] = useState(true)
  const [showFormatting, setShowFormatting] = useState(true)
  const [showLanguage, setShowLanguage] = useState(true)
  const [showConfidence, setShowConfidence] = useState(true)
  const [showWordCount, setShowWordCount] = useState(true)
  const [showCharacterCount, setShowCharacterCount] = useState(true)
  const [showSentences, setShowSentences] = useState(true)
  const [showParagraphs, setShowParagraphs] = useState(true)
  const [showFingerprint, setShowFingerprint] = useState(false)
  const [showMetadata, setShowMetadata] = useState(true)
  const [showQuality, setShowQuality] = useState(true)
  const [showObjects, setShowObjects] = useState(true)
  const [showColors, setShowColors] = useState(true)
  const [showFaces, setShowFaces] = useState(true)
  const [showLanguages, setShowLanguages] = useState(true)
  const [showOrientation, setShowOrientation] = useState(true)
  const [showDocumentType, setShowDocumentStructure] = useState(true)
  const [showTextRegionsInfo, setShowTextRegionsInfo] = useState(true)
  const [showTextRegionsOnImage, setShowTextRegionsOnImage] = useState(true)
  const [showTextRegionsConfidence, setShowTextRegionsConfidence] = useState(true)
  const [showTextRegionsText, setShowTextRegionsText] = useState(true)
  const [imageZoom, setImageZoom] = useState(100)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("upload")
  const [ocrResults, setOcrResults] = useState<{
    text: string
    confidence: number
    regions: Array<{
      text: string
      confidence: number
      boundingBox: { x: number; y: number; width: number; height: number }
    }>
  } | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreProcessing, setImagePreProcessing] = useState<"none" | "grayscale" | "binarize" | "sharpen">("none")
  const [showProcessingOptions, setShowProcessingOptions] = useState(false)
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const [ocrLanguage, setOcrLanguage] = useState("eng")
  const [ocrMode, setOcrMode] = useState("document")
  const [recentFiles, setRecentFiles] = useState<Array<{ name: string; type: string; date: string }>>([])
  const [showErrorDialog, setShowErrorDialog] = useState(false)

  const analyzeImage = async (url: string): Promise<ImageAnalysis> => {
    // Enhanced image analysis simulation
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      return {
        objects: ["document", "text", "paper", "writing"],
        colors: [
          { color: "white", percentage: 85 },
          { color: "black", percentage: 12 },
          { color: "gray", percentage: 3 },
        ],
        faces: 0,
        text: ["Sample", "Extracted", "Text", "Content"],
        quality: {
          brightness: 92,
          contrast: 88,
          sharpness: 95,
          resolution: 300,
        },
        metadata: {
          format: "JPEG",
          dimensions: "800x600",
          size: "2.1 MB",
          creationDate: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          camera: "Unknown",
          location: "Unknown",
        },
        languages: ["English", "Spanish"],
        confidence: 95.5,
        orientation: 0,
        textRegions: [
          {
            x: 50,
            y: 100,
            width: 400,
            height: 50,
            text: "Sample Header Text",
            confidence: 98.2,
          },
          {
            x: 50,
            y: 200,
            width: 700,
            height: 300,
            text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            confidence: 96.5,
          },
        ],
        documentType: "Article",
        documentStructure: {
          title: "Sample Document",
          headings: 2,
          paragraphs: 5,
          lists: 1,
          tables: 0,
          images: 0,
          signatures: 0,
        },
      }
    } catch (error) {
      console.error("Failed to analyze image:", error)
      setErrorMessage("Failed to analyze image. Please try again with a different image.")
      setShowErrorDialog(true)
      throw new Error("Failed to analyze image")
    }
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.target as HTMLImageElement
    img.src = "/placeholder.svg"
    setImageUrl("")
    setAnalysis(null)
    setErrorMessage("Failed to load image. Please try again with a different image.")
    setShowErrorDialog(true)
  }

  const processText = async (text: string): Promise<ExtractedTextInfo> => {
    // Simulate text processing with multiple stages
    const stages = [
      { name: "Analyzing text structure...", duration: 800 },
      { name: "Detecting language...", duration: 600 },
      { name: "Extracting metadata...", duration: 700 },
      { name: "Analyzing sentiment...", duration: 500 },
      { name: "Calculating readability...", duration: 600 },
      { name: "Identifying entities...", duration: 700 },
      { name: "Extracting keywords...", duration: 500 },
      { name: "Generating summary...", duration: 800 },
      { name: "Creating document fingerprint...", duration: 400 },
      { name: "Finalizing report...", duration: 500 },
    ]

    for (let i = 0; i < stages.length; i++) {
      setProcessingStage(stages[i].name)
      setProcessingProgress(((i + 1) / stages.length) * 100)
      await new Promise((resolve) => setTimeout(resolve, stages[i].duration))
    }

    // Generate document fingerprint
    const fingerprint = `fp-${Math.random().toString(36).substring(2, 10)}-${Date.now().toString(36)}`

    // Simulate processed text info with enhanced details
    return {
      content: text,
      metadata: {
        language: "English",
        confidence: 98.5,
        wordCount: text.split(/\s+/).length,
        characterCount: text.length,
        sentences: text.split(/[.!?]+/).length,
        paragraphs: text.split(/\n\s*\n/).length,
        formatting: {
          alignment: "left",
          fontFamilies: ["Arial", "Times New Roman"],
          fontSize: "12pt",
          styles: ["normal", "bold", "italic"],
        },
        keywords: ["important", "key", "terms", "document", "analysis"],
        sentiment: {
          score: 0.8,
          label: "Positive",
        },
        readability: {
          score: 75,
          level: "College",
          fleschKincaid: 12.5,
        },
        entities: {
          people: ["John Smith", "Jane Doe"],
          organizations: ["Acme Corp", "Global Industries"],
          locations: ["New York", "London"],
          dates: ["2023-05-15", "January 2024"],
        },
      },
      structure: {
        headings: 3,
        lists: 2,
        tables: 1,
        images: 2,
        equations: 0,
        codeBlocks: 0,
        citations: 4,
      },
      summary:
        "This document discusses key concepts related to document analysis and text extraction technologies. It covers important terms and methodologies used in the field.",
      topics: ["Document Analysis", "Text Extraction", "OCR Technology", "Information Retrieval"],
      fingerprint: fingerprint,
    }
  }

  const enhanceImage = async (file: File): Promise<string> => {
    try {
      // Simulate image enhancement
      setProcessingStage("Enhancing image quality...")
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // In a real implementation, this would apply image processing techniques
      const buffer = await file.arrayBuffer()
      const enhancedBuffer = await enhanceImageForOCR(buffer)

      // Create a blob from the enhanced buffer
      const blob = new Blob([enhancedBuffer], { type: file.type })
      const enhancedUrl = URL.createObjectURL(blob)

      return enhancedUrl
    } catch (error) {
      console.error("Error enhancing image:", error)
      toast.error("Failed to enhance image quality")
      return URL.createObjectURL(file) // Return original image URL as fallback
    }
  }

  const applyImagePreProcessing = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, type: string) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    let i, y, x, c

    switch (type) {
      case "grayscale":
        for (i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
          data[i] = avg
          data[i + 1] = avg
          data[i + 2] = avg
        }
        break
      case "binarize":
        for (i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
          const val = avg > 128 ? 255 : 0
          data[i] = val
          data[i + 1] = val
          data[i + 2] = val
        }
        break
      case "sharpen":
        // Simple sharpening filter
        const tempData = new Uint8ClampedArray(data)
        for (y = 1; y < canvas.height - 1; y++) {
          for (x = 1; x < canvas.width - 1; x++) {
            const idx = (y * canvas.width + x) * 4
            for (c = 0; c < 3; c++) {
              const val =
                5 * tempData[idx + c] -
                tempData[idx - 4 + c] -
                tempData[idx + 4 + c] -
                tempData[idx - canvas.width * 4 + c] -
                tempData[idx + canvas.width * 4 + c]
              data[idx + c] = Math.min(255, Math.max(0, val))
            }
          }
        }
        break
      default:
        // No processing
        return
    }

    ctx.putImageData(imageData, 0, 0)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) {
        throw new Error("No file selected")
      }

      if (!file.type.startsWith("image/")) {
        throw new Error("Please upload an image file")
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error("File size must be less than 10MB")
      }

      setLoading(true)
      setProcessingStartTime(Date.now())
      setImageFile(file)

      // Add to recent files
      setRecentFiles((prev) => [
        {
          name: file.name,
          type: file.type,
          date: new Date().toLocaleString(),
        },
        ...prev.slice(0, 4),
      ])

      const previewUrl = URL.createObjectURL(file)
      setImageUrl(previewUrl)
      setOriginalImage(previewUrl)
      setErrorMessage(null)

      // Enhanced processing steps
      const steps = [
        { message: "Analyzing image structure...", duration: 800 },
        { message: "Enhancing image quality...", duration: 1200 },
        { message: "Detecting text regions...", duration: 1000 },
        { message: "Processing content...", duration: 800 },
        { message: "Performing OCR...", duration: 1200 },
        { message: "Detecting languages...", duration: 800 },
        { message: "Analyzing document structure...", duration: 900 },
        { message: "Preserving formatting...", duration: 700 },
        { message: "Extracting text...", duration: 1000 },
        { message: "Finalizing results...", duration: 600 },
      ]

      for (const step of steps) {
        setProcessingStage(step.message)
        setProcessingProgress((steps.indexOf(step) / steps.length) * 100)
        toast.info(step.message)
        await new Promise((resolve) => setTimeout(resolve, step.duration))
      }

      // Enhance image if option is enabled
      if (enhanceQuality) {
        const enhancedImageUrl = await enhanceImage(file)
        setEnhancedImage(enhancedImageUrl)
      }

      // Perform OCR on the image
      try {
        const ocrResult = await extractTextFromImage(file)
        setOcrResults(ocrResult)

        // Update analysis with OCR results
        const imageAnalysis = await analyzeImage(previewUrl)

        // Merge OCR results with image analysis
        imageAnalysis.textRegions = ocrResult.regions.map((region) => ({
          x: region.boundingBox.x,
          y: region.boundingBox.y,
          width: region.boundingBox.width,
          height: region.boundingBox.height,
          text: region.text,
          confidence: region.confidence * 100,
        }))

        imageAnalysis.confidence = ocrResult.confidence * 100
        setAnalysis(imageAnalysis)

        // Format the extracted text with proper structure
        const extractedContent = formatExtractedText(ocrResult.text, imageAnalysis)
        setExtractedText(extractedContent)

        const textInfoResult = await processText(extractedContent)
        setTextInfo(textInfoResult)

        const processingTime = ((Date.now() - processingStartTime) / 1000).toFixed(2)
        toast.success(`Text extracted successfully in ${processingTime} seconds!`)
      } catch (error) {
        console.error("OCR processing error:", error)
        toast.error("Failed to extract text from image")
        setErrorMessage("OCR processing failed. Please try again with a clearer image.")
        setShowErrorDialog(true)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to process image"
      toast.error(message)
      setErrorMessage(message)
      setShowErrorDialog(true)
    } finally {
      setLoading(false)
      setProcessingProgress(100)
    }
  }

  // Format extracted text with proper structure
  const formatExtractedText = (text: string, analysis: ImageAnalysis | null): string => {
    if (!analysis) return text

    // Create a structured format for the extracted text
    const formattedText = `📄 DOCUMENT ANALYSIS REPORT
═══════════════════════

📅 Date: ${new Date().toLocaleDateString()}
🕒 Time: ${new Date().toLocaleTimeString()}

📝 EXTRACTED CONTENT
──────────────────
${text}

🔍 ANALYSIS DETAILS
──────────────────
• Document Type: ${analysis.documentType || "Unknown"}
• Language: ${analysis.languages?.join(", ") || "Unknown"}
• Confidence Score: ${analysis.confidence?.toFixed(1)}%
• Character Count: ${text.length}
• Word Count: ${text.split(/\s+/).filter(Boolean).length}

📊 QUALITY METRICS
──────────────────
• Image Quality: ${analysis.quality.sharpness}%
• Text Clarity: ${analysis.quality.contrast}%
• Resolution: ${analysis.quality.resolution} DPI
• Format: ${analysis.metadata.format}

📌 DOCUMENT STRUCTURE
──────────────────
• Title: ${analysis.documentStructure?.title || "Unknown"}
• Headings: ${analysis.documentStructure?.headings || 0}
• Paragraphs: ${analysis.documentStructure?.paragraphs || 0}
• Lists: ${analysis.documentStructure?.lists || 0}
• Tables: ${analysis.documentStructure?.tables || 0}
• Images: ${analysis.documentStructure?.images || 0}

🔎 TEXT REGIONS
──────────────────
${
  analysis.textRegions
    ?.map(
      (region, index) =>
        `Region ${index + 1}:
  - Position: (${region.x}, ${region.y})
  - Size: ${region.width}x${region.height}
  - Confidence: ${region.confidence.toFixed(1)}%
  - Text: "${region.text.substring(0, 50)}${region.text.length > 50 ? "..." : ""}"`,
    )
    .join("\n\n") || "No text regions detected"
}`

    return formattedText
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(extractedText)
      toast.success("Text copied to clipboard!")
    } catch (error) {
      toast.error("Failed to copy text")
    }
  }

  const downloadText = () => {
    try {
      const blob = new Blob([extractedText], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `extracted-text-${new Date().toISOString().slice(0, 10)}.txt`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("Text downloaded!")
    } catch (error) {
      toast.error("Failed to download text")
    }
  }

  const rotateImage = () => {
    setImageRotation((prev) => (prev + 90) % 360)
  }

  const resetImage = () => {
    setImageRotation(0)
    setShowOriginalImage(false)
    setShowEnhancedPreview(false)
    setImageZoom(100)
    setImagePreProcessing("none")
  }

  const toggleTextRegions = () => {
    setShowTextRegions(!showTextRegions)
  }

  const handleTextRegionClick = (index: number) => {
    setSelectedTextRegion(index)
  }

  const zoomIn = () => {
    setImageZoom((prev) => Math.min(prev + 10, 200))
  }

  const zoomOut = () => {
    setImageZoom((prev) => Math.max(prev - 10, 50))
  }

  const resetZoom = () => {
    setImageZoom(100)
  }

  const clearImage = () => {
    setImageUrl("")
    setOriginalImage(null)
    setEnhancedImage(null)
    setExtractedText("")
    setAnalysis(null)
    setTextInfo(null)
    setOcrResults(null)
    setImageFile(null)
    setImageRotation(0)
    setImageZoom(100)
    setImagePreProcessing("none")
    setShowTextRegions(false)
    setSelectedTextRegion(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handlePreProcessingChange = (value: "none" | "grayscale" | "binarize" | "sharpen") => {
    setImagePreProcessing(value)

    // Apply preprocessing to the image
    if (imageUrl && imageFile) {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext("2d")

        if (ctx) {
          ctx.drawImage(img, 0, 0)
          applyImagePreProcessing(canvas, ctx, value)

          // Update the image URL
          canvas.toBlob((blob) => {
            if (blob) {
              const processedUrl = URL.createObjectURL(blob)
              setImageUrl(processedUrl)
            }
          }, imageFile.type)
        }
      }
      img.src = originalImage || imageUrl
    }
  }

  return (
    <TooltipProvider>
      <div className="container py-8">
        <AnimatedBackground variant="grid" intensity="light" color="#06b6d4" />
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Advanced Text Extraction</h1>
            <p className="text-muted-foreground">Extract and analyze text from images with AI-powered OCR technology</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="upload">
                <FileUp className="h-4 w-4 mr-2" />
                Upload Image
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Filter className="h-4 w-4 mr-2" />
                Processing Options
              </TabsTrigger>
              <TabsTrigger value="history">
                <FileSearch className="h-4 w-4 mr-2" />
                Recent Files
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Image</CardTitle>
                  <CardDescription>Upload an image containing text to extract and analyze its content</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-4">
                      <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <FileUp className="mr-2 h-4 w-4" />
                        Upload Image
                      </Button>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="preserveFormatting"
                          checked={preserveFormatting}
                          onCheckedChange={setPreserveFormatting}
                        />
                        <Label htmlFor="preserveFormatting">Preserve Formatting</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch id="enhanceQuality" checked={enhanceQuality} onCheckedChange={setEnhanceQuality} />
                        <Label htmlFor="enhanceQuality">Enhance Image Quality</Label>
                      </div>

                      <Select value={ocrEngine} onValueChange={setOcrEngine}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select OCR Engine" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard OCR</SelectItem>
                          <SelectItem value="advanced">Advanced OCR</SelectItem>
                          <SelectItem value="premium">Premium OCR</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={documentType} onValueChange={setDocumentType}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Document Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Auto-detect</SelectItem>
                          <SelectItem value="article">Article</SelectItem>
                          <SelectItem value="book">Book</SelectItem>
                          <SelectItem value="form">Form</SelectItem>
                          <SelectItem value="receipt">Receipt</SelectItem>
                          <SelectItem value="id">ID Card</SelectItem>
                          <SelectItem value="invoice">Invoice</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confidenceThreshold">Confidence Threshold: {confidenceThreshold}%</Label>
                      <Slider
                        id="confidenceThreshold"
                        min={0}
                        max={100}
                        step={5}
                        value={[confidenceThreshold]}
                        onValueChange={(value) => setConfidenceThreshold(value[0])}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Less Strict</span>
                        <span>More Strict</span>
                      </div>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />

                    {imageUrl && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={rotateImage}>
                              <RotateCw className="h-4 w-4 mr-2" />
                              Rotate
                            </Button>
                            <Button variant="outline" size="sm" onClick={resetImage}>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Reset
                            </Button>
                            <Button variant="outline" size="sm" onClick={toggleTextRegions}>
                              <Highlighter className="h-4 w-4 mr-2" />
                              {showTextRegions ? "Hide" : "Show"} Text Regions
                            </Button>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Filter className="h-4 w-4 mr-2" />
                                  Pre-process
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-56">
                                <div className="space-y-2">
                                  <h4 className="font-medium">Image Pre-processing</h4>
                                  <div className="grid gap-2">
                                    <Button
                                      variant={imagePreProcessing === "none" ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => handlePreProcessingChange("none")}
                                    >
                                      Original
                                    </Button>
                                    <Button
                                      variant={imagePreProcessing === "grayscale" ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => handlePreProcessingChange("grayscale")}
                                    >
                                      Grayscale
                                    </Button>
                                    <Button
                                      variant={imagePreProcessing === "binarize" ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => handlePreProcessingChange("binarize")}
                                    >
                                      Binarize
                                    </Button>
                                    <Button
                                      variant={imagePreProcessing === "sharpen" ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => handlePreProcessingChange("sharpen")}
                                    >
                                      Sharpen
                                    </Button>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={zoomOut} disabled={imageZoom <= 50}>
                              <ZoomOut className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={resetZoom}>
                              {imageZoom}%
                            </Button>
                            <Button variant="outline" size="sm" onClick={zoomIn} disabled={imageZoom >= 200}>
                              <ZoomIn className="h-4 w-4" />
                            </Button>
                            {enhancedImage && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowEnhancedPreview(!showEnhancedPreview)}
                              >
                                <Wand2 className="h-4 w-4 mr-2" />
                                {showEnhancedPreview ? "Original" : "Enhanced"}
                              </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={clearImage}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="relative group border rounded-lg overflow-hidden">
                          <div style={{ overflow: "auto", maxHeight: "500px" }}>
                            <div
                              style={{
                                transform: `scale(${imageZoom / 100})`,
                                transformOrigin: "top left",
                                transition: "transform 0.2s ease",
                              }}
                            >
                              <img
                                src={showEnhancedPreview ? enhancedImage || imageUrl : imageUrl}
                                alt="Preview"
                                className="w-full object-contain"
                                style={{ transform: `rotate(${imageRotation}deg)` }}
                                onError={handleImageError}
                              />
                            </div>
                          </div>

                          {/* Text region overlays */}
                          {showTextRegions && analysis?.textRegions && (
                            <>
                              {analysis.textRegions.map((region, index) => (
                                <div
                                  key={index}
                                  className={`absolute border-2 ${
                                    selectedTextRegion === index ? "border-primary" : "border-blue-500"
                                  } bg-blue-500/10 cursor-pointer transition-colors hover:bg-blue-500/20`}
                                  style={{
                                    left: `${(region.x / 800) * 100 * (imageZoom / 100)}%`,
                                    top: `${(region.y / 600) * 100 * (imageZoom / 100)}%`,
                                    width: `${(region.width / 800) * 100 * (imageZoom / 100)}%`,
                                    height: `${(region.height / 600) * 100 * (imageZoom / 100)}%`,
                                    transform: `rotate(${imageRotation}deg)`,
                                  }}
                                  onClick={() => handleTextRegionClick(index)}
                                >
                                  <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-1">
                                    {region.confidence.toFixed(0)}%
                                  </div>
                                </div>
                              ))}
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {loading && (
                      <div className="space-y-4">
                        <Progress value={processingProgress} />
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium">{processingStage}</p>
                          <p className="text-sm text-muted-foreground">{processingProgress.toFixed(0)}%</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Processing Options</CardTitle>
                  <CardDescription>Configure OCR and text extraction settings</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">OCR Settings</h3>

                        <div className="space-y-2">
                          <Label htmlFor="ocrEngine">OCR Engine</Label>
                          <Select value={ocrEngine} onValueChange={setOcrEngine}>
                            <SelectTrigger id="ocrEngine">
                              <SelectValue placeholder="Select OCR Engine" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="standard">Standard OCR</SelectItem>
                              <SelectItem value="advanced">Advanced OCR (Recommended)</SelectItem>
                              <SelectItem value="premium">Premium OCR</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            Advanced OCR provides better accuracy for most document types
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="ocrLanguage">OCR Language</Label>
                          <Select value={ocrLanguage} onValueChange={setOcrLanguage}>
                            <SelectTrigger id="ocrLanguage">
                              <SelectValue placeholder="Select Language" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="eng">English</SelectItem>
                              <SelectItem value="spa">Spanish</SelectItem>
                              <SelectItem value="fra">French</SelectItem>
                              <SelectItem value="deu">German</SelectItem>
                              <SelectItem value="ita">Italian</SelectItem>
                              <SelectItem value="por">Portuguese</SelectItem>
                              <SelectItem value="rus">Russian</SelectItem>
                              <SelectItem value="jpn">Japanese</SelectItem>
                              <SelectItem value="chi_sim">Chinese (Simplified)</SelectItem>
                              <SelectItem value="chi_tra">Chinese (Traditional)</SelectItem>
                              <SelectItem value="kor">Korean</SelectItem>
                              <SelectItem value="ara">Arabic</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="ocrMode">Recognition Mode</Label>
                          <Select value={ocrMode} onValueChange={setOcrMode}>
                            <SelectTrigger id="ocrMode">
                              <SelectValue placeholder="Select Mode" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="document">Document (Default)</SelectItem>
                              <SelectItem value="receipt">Receipt/Invoice</SelectItem>
                              <SelectItem value="card">ID Card/Business Card</SelectItem>
                              <SelectItem value="handwriting">Handwriting</SelectItem>
                              <SelectItem value="scene">Scene Text</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            Select the mode that best matches your image content
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="confidenceThreshold">Confidence Threshold: {confidenceThreshold}%</Label>
                            <span className="text-xs text-muted-foreground">{confidenceThreshold}%</span>
                          </div>
                          <Slider
                            id="confidenceThreshold"
                            min={0}
                            max={100}
                            step={5}
                            value={[confidenceThreshold]}
                            onValueChange={(value) => setConfidenceThreshold(value[0])}
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Less Strict</span>
                            <span>More Strict</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Image Processing</h3>

                        <div className="flex items-center space-x-2">
                          <Switch id="enhanceQuality" checked={enhanceQuality} onCheckedChange={setEnhanceQuality} />
                          <div>
                            <Label htmlFor="enhanceQuality">Enhance Image Quality</Label>
                            <p className="text-xs text-muted-foreground">
                              Automatically improve image quality for better OCR results
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="preserveFormatting"
                            checked={preserveFormatting}
                            onCheckedChange={setPreserveFormatting}
                          />
                          <div>
                            <Label htmlFor="preserveFormatting">Preserve Formatting</Label>
                            <p className="text-xs text-muted-foreground">
                              Maintain original document layout in extracted text
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Pre-processing Options</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className={imagePreProcessing === "grayscale" ? "border-primary" : ""}
                              onClick={() => setImagePreProcessing("grayscale")}
                            >
                              Grayscale
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className={imagePreProcessing === "binarize" ? "border-primary" : ""}
                              onClick={() => setImagePreProcessing("binarize")}
                            >
                              Binarize
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className={imagePreProcessing === "sharpen" ? "border-primary" : ""}
                              onClick={() => setImagePreProcessing("sharpen")}
                            >
                              Sharpen
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className={imagePreProcessing === "none" ? "border-primary" : ""}
                              onClick={() => setImagePreProcessing("none")}
                            >
                              None
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Apply image processing to improve text recognition
                          </p>
                        </div>

                        <div className="pt-4">
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                              setOcrEngine("advanced")
                              setConfidenceThreshold(70)
                              setEnhanceQuality(true)
                              setPreserveFormatting(true)
                              setImagePreProcessing("none")
                              setOcrLanguage("eng")
                              setOcrMode("document")
                              toast.success("Settings reset to defaults")
                            }}
                          >
                            Reset to Defaults
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Files</CardTitle>
                  <CardDescription>Recently processed images and documents</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {recentFiles.length > 0 ? (
                    <div className="space-y-4">
                      {recentFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="bg-muted rounded-md p-2">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium">{file.name}</p>
                              <p className="text-xs text-muted-foreground">{file.date}</p>
                            </div>
                          </div>
                          <Badge variant="outline">{file.type.split("/")[1]?.toUpperCase() || "FILE"}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileSearch className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No recent files</p>
                      <p className="text-xs text-muted-foreground mt-1">Processed files will appear here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="grid gap-6 md:grid-cols-2">
            {analysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scan className="h-5 w-5 text-primary" />
                    Image Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Document Information</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Type:</span>
                            <span className="text-sm font-medium">{analysis.documentType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Format:</span>
                            <span className="text-sm font-medium">{analysis.metadata.format}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Dimensions:</span>
                            <span className="text-sm font-medium">{analysis.metadata.dimensions}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Size:</span>
                            <span className="text-sm font-medium">{analysis.metadata.size}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium mb-2">Languages Detected</h3>
                        <div className="flex flex-wrap gap-2">
                          {analysis.languages?.map((lang, i) => (
                            <Badge key={i} variant="outline" className="flex items-center gap-1">
                              <Languages className="h-3 w-3" />
                              {lang}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium mb-2">Quality Analysis</h3>
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-sm">
                              <span>Text Clarity</span>
                              <span>{analysis.quality.contrast}%</span>
                            </div>
                            <Progress value={analysis.quality.contrast} className="mt-1" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm">
                              <span>Image Quality</span>
                              <span>{analysis.quality.sharpness}%</span>
                            </div>
                            <Progress value={analysis.quality.sharpness} className="mt-1" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm">
                              <span>Resolution</span>
                              <span>{analysis.quality.resolution} DPI</span>
                            </div>
                            <Progress value={analysis.quality.resolution / 10} className="mt-1" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium mb-2">Document Structure</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Title:</span>
                            <span className="text-sm font-medium">
                              {analysis.documentStructure?.title || "Unknown"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Headings:</span>
                            <span className="text-sm font-medium">{analysis.documentStructure?.headings || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Paragraphs:</span>
                            <span className="text-sm font-medium">{analysis.documentStructure?.paragraphs || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Lists:</span>
                            <span className="text-sm font-medium">{analysis.documentStructure?.lists || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Tables:</span>
                            <span className="text-sm font-medium">{analysis.documentStructure?.tables || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Images:</span>
                            <span className="text-sm font-medium">{analysis.documentStructure?.images || 0}</span>
                          </div>
                        </div>
                      </div>

                      {analysis.textRegions && analysis.textRegions.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium mb-2">Text Regions</h3>
                          <div className="space-y-3">
                            {analysis.textRegions.map((region, index) => (
                              <div
                                key={index}
                                className={`p-3 rounded-md border ${
                                  selectedTextRegion === index ? "border-primary bg-primary/5" : ""
                                }`}
                                onClick={() => handleTextRegionClick(index)}
                              >
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm font-medium">Region {index + 1}</span>
                                  <Badge variant="outline">{region.confidence.toFixed(1)}%</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mb-1">
                                  Position: ({region.x}, {region.y}) | Size: {region.width}x{region.height}
                                </p>
                                <p className="text-sm line-clamp-2">{region.text}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Extracted Text
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {textInfo && (
                        <>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {textInfo.metadata.confidence.toFixed(1)}% Confidence
                          </Badge>
                          {textInfo.metadata.language && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Languages className="h-3 w-3" />
                              {textInfo.metadata.language}
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                    {extractedText && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={copyToClipboard}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={downloadText}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {loading ? (
                    <div className="space-y-4">
                      <Progress value={processingProgress} />
                      <div className="space-y-2">
                        <p className="text-sm text-center font-medium">{processingStage}</p>
                        <p className="text-xs text-center text-muted-foreground">
                          Analyzing and extracting text content
                        </p>
                      </div>
                    </div>
                  ) : extractedText ? (
                    <div className="space-y-4">
                      <Textarea value={extractedText} className="min-h-[400px] font-mono text-sm" readOnly />
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-muted-foreground">
                          Text extracted with {analysis?.confidence?.toFixed(1)}% confidence
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Upload an image to extract text</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
