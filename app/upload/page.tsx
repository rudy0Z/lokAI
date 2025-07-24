"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Upload,
  FileText,
  ImageIcon,
  File,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  Download,
  Eye,
  Clock,
  Users,
  Calendar,
  Phone,
  IndianRupee,
} from "lucide-react"
import { toast } from "sonner"

interface PDFAnalysisResult {
  text: string;
  summary: string;
  keyPoints: string[];
  suggestedQuestions: string[];
  analysis: {
    summary: string;
    keyPoints: string[];
    documentType: string;
    deadlines: string[];
    fees: string[];
    contactInfo: string[];
    language: string;
    departments: string[];
    importantDates: string[];
    keyEntities: string[];
    actionItems: string[];
  };
  metadata: {
    fileName: string;
    fileSize: string;
    pages: number;
    type: string;
    title: string;
    textLength?: number;
    extractionStatus?: 'success' | 'limited' | 'failed';
  };
  success: boolean;
  confidence: number;
}

// Function to process uploaded PDF files using our API
async function processUploadedFile(file: File): Promise<PDFAnalysisResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/process-pdf', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to process PDF');
  }

  const result = await response.json();
  
  // Transform the response to match our expected interface
  const analysisData = result.analysis || {};
  
  return {
    text: result.text || '',
    summary: analysisData.summary || 'Document analysis completed.',
    keyPoints: analysisData.keyPoints || ['Document processed successfully'],
    suggestedQuestions: analysisData.suggestedQuestions || ['What are the key requirements?', 'What are the deadlines?', 'What fees are involved?'],
    analysis: {
      summary: analysisData.summary || 'Document analysis completed.',
      keyPoints: analysisData.keyPoints || ['Document processed successfully'],
      documentType: analysisData.documentType || 'Government Document',
      deadlines: analysisData.deadlines || [],
      fees: analysisData.fees || [],
      contactInfo: analysisData.contactInfo || [],
      language: analysisData.language || 'English',
      departments: analysisData.departments || ['Government Department'],
      importantDates: analysisData.importantDates || analysisData.deadlines || [],
      keyEntities: analysisData.keyEntities || ['Government Entity'],
      actionItems: analysisData.actionItems || ['Review document requirements', 'Submit necessary forms'],
    },
    metadata: {
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(2)} KB`,
      pages: result.metadata?.pages || 1,
      type: 'PDF',
      title: file.name.replace('.pdf', ''),
      textLength: result.metadata?.textLength,
      extractionStatus: result.metadata?.extractionStatus || 'success',
    },
    success: result.success || true,
    confidence: result.metadata?.extractionStatus === 'success' ? 0.95 : 0.65,
  };
}

export default function UploadPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [analysisResult, setAnalysisResult] = useState<PDFAnalysisResult | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFileUpload = async (file: File) => {
    // Validate file type
    const supportedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/bmp",
      "image/webp",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
    ]

    const isSupported =
      supportedTypes.includes(file.type) ||
      file.name.toLowerCase().match(/\.(pdf|jpg|jpeg|png|gif|bmp|webp|docx|doc|txt)$/)

    if (!isSupported) {
      toast.error("Unsupported file type. Please upload PDF, Image, Word document, or Text file.")
      return
    }

    // Validate file size (15MB for images, 10MB for documents)
    const maxSize = file.type.startsWith("image/") ? 15 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error(`File size too large. Maximum ${file.type.startsWith("image/") ? "15MB" : "10MB"} allowed.`)
      return
    }

    setUploadedFile(file)
    setIsProcessing(true)
    setUploadProgress(0)
    setAnalysisResult(null)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Process the file (this is where you'll call your backend API)
      const result = await processUploadedFile(file)

      clearInterval(progressInterval)
      setUploadProgress(100)
      setAnalysisResult(result)
      toast.success("File processed successfully!")
    } catch (error) {
      console.error("Error processing file:", error)
      toast.error("Failed to process file. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type === "application/pdf") return <FileText className="h-8 w-8 text-red-500" />
    if (file.type.startsWith("image/")) return <ImageIcon className="h-8 w-8 text-blue-500" />
    if (file.type.includes("word") || file.name.endsWith(".docx") || file.name.endsWith(".doc")) {
      return <File className="h-8 w-8 text-blue-600" />
    }
    return <File className="h-8 w-8 text-gray-500" />
  }

  const getFileTypeLabel = (file: File) => {
    if (file.type === "application/pdf") return "PDF Document"
    if (file.type.startsWith("image/")) return "Image File"
    if (file.type.includes("word")) return "Word Document"
    if (file.type === "text/plain") return "Text File"
    return "Document"
  }

  const askAboutDocument = () => {
    if (analysisResult) {
      const questions = analysisResult.suggestedQuestions.slice(0, 3).join(", ")
      window.location.href = `/chat?question=${encodeURIComponent(`I have questions about my ${analysisResult.analysis.documentType}: ${questions}`)}`
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Document Upload & Analysis</h1>
          <p className="text-gray-600">
            Upload your government documents, bills, or images for instant AI-powered analysis
          </p>
        </div>

        {/* Upload Area */}
        {!uploadedFile && (
          <Card>
            <CardContent className="p-8">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? "border-indigo-500 bg-indigo-50" : "border-gray-300 hover:border-gray-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Upload your document</h3>
                    <p className="text-gray-600">Drag and drop your file here, or click to browse</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Badge variant="secondary">PDF</Badge>
                    <Badge variant="secondary">Images</Badge>
                    <Badge variant="secondary">Word Docs</Badge>
                    <Badge variant="secondary">Text Files</Badge>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp,.docx,.doc,.txt"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 cursor-pointer">Choose File</Button>
                  </label>
                  <p className="text-xs text-gray-500">Maximum file size: 15MB for images, 10MB for documents</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Processing Status */}
        {uploadedFile && isProcessing && (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  {getFileIcon(uploadedFile)}
                  <div className="flex-1">
                    <h3 className="font-medium">{uploadedFile.name}</h3>
                    <p className="text-sm text-gray-600">{getFileTypeLabel(uploadedFile)}</p>
                  </div>
                  <Badge variant="outline">Processing...</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing document...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
                <div className="text-sm text-gray-600">
                  {uploadProgress < 30 && "Extracting text from document..."}
                  {uploadProgress >= 30 && uploadProgress < 60 && "Analyzing content..."}
                  {uploadProgress >= 60 && uploadProgress < 90 && "Generating insights..."}
                  {uploadProgress >= 90 && "Finalizing analysis..."}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysis Results */}
        {analysisResult && !isProcessing && (
          <div className="space-y-6">
            {/* File Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {uploadedFile && getFileIcon(uploadedFile)}
                    <div>
                      <h3 className="font-medium">{analysisResult.metadata.title}</h3>
                      <p className="text-sm text-gray-600">
                        {analysisResult.analysis.documentType} • {analysisResult.metadata.fileSize} • {analysisResult.metadata.pages} pages
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">
                          Text Extraction: 
                        </span>
                        {analysisResult.metadata.extractionStatus === 'success' ? (
                          <Badge variant="default" className="text-xs bg-green-100 text-green-700 border-green-200">
                            ✓ Success ({analysisResult.metadata.textLength} chars)
                          </Badge>
                        ) : analysisResult.metadata.extractionStatus === 'limited' ? (
                          <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-700 border-yellow-200">
                            ⚠ Limited Text
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs bg-red-100 text-red-700 border-red-200">
                            ✗ Failed
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          • Confidence: {Math.round(analysisResult.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button size="sm" onClick={askAboutDocument} className="bg-indigo-600 hover:bg-indigo-700">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Ask AI
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Tabs */}
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="entities">Entities</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Eye className="h-5 w-5" />
                      <span>Document Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700">{analysisResult.summary}</p>

                    <div className="space-y-3">
                      <h4 className="font-medium">Key Points:</h4>
                      <ul className="space-y-2">
                        {analysisResult.keyPoints.map((point, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {analysisResult.analysis.deadlines.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <span className="font-medium text-red-800">Important Deadlines</span>
                        </div>
                        <ul className="space-y-1">
                          {analysisResult.analysis.deadlines.map((deadline, index) => (
                            <li key={index} className="text-sm text-red-700">
                              • {deadline}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Document Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <Badge>{analysisResult.analysis.documentType}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Language:</span>
                        <span>{analysisResult.analysis.language}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pages:</span>
                        <span>{analysisResult.metadata.pages}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">File Size:</span>
                        <span>{analysisResult.metadata.fileSize}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Confidence:</span>
                        <span>{Math.round(analysisResult.confidence * 100)}%</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Extracted Text Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                        <pre className="text-sm whitespace-pre-wrap">
                          {analysisResult.text.substring(0, 500)}
                          {analysisResult.text.length > 500 && "..."}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="entities" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {analysisResult.analysis.departments.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-lg">
                          <Users className="h-4 w-4" />
                          <span>Departments</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {analysisResult.analysis.departments.map((dept, index) => (
                            <li key={index} className="text-sm bg-blue-50 px-2 py-1 rounded">
                              {dept}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {analysisResult.analysis.importantDates.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-lg">
                          <Calendar className="h-4 w-4" />
                          <span>Important Dates</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {analysisResult.analysis.importantDates.map((date, index) => (
                            <li key={index} className="text-sm bg-green-50 px-2 py-1 rounded">
                              {date}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {analysisResult.analysis.fees.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-lg">
                          <IndianRupee className="h-4 w-4" />
                          <span>Fees & Charges</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {analysisResult.analysis.fees.map((fee, index) => (
                            <li key={index} className="text-sm bg-yellow-50 px-2 py-1 rounded">
                              {fee}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {analysisResult.analysis.contactInfo.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-lg">
                          <Phone className="h-4 w-4" />
                          <span>Contact Information</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {analysisResult.analysis.contactInfo.map((contact, index) => (
                            <li key={index} className="text-sm bg-purple-50 px-2 py-1 rounded">
                              {contact}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {analysisResult.analysis.keyEntities.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-lg">
                          <Users className="h-4 w-4" />
                          <span>Key Entities</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {analysisResult.analysis.keyEntities.map((entity, index) => (
                            <li key={index} className="text-sm bg-gray-50 px-2 py-1 rounded">
                              {entity}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="actions" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>Required Actions</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {analysisResult.analysis.actionItems.length > 0 ? (
                        analysisResult.analysis.actionItems.map((action, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{action}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-600 text-sm">No specific actions required at this time.</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Suggested Questions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {analysisResult.suggestedQuestions.map((question, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-left h-auto py-2 px-3 bg-transparent"
                          onClick={() => {
                            window.location.href = `/chat?question=${encodeURIComponent(question)}`
                          }}
                        >
                          <MessageCircle className="h-3 w-3 mr-2 flex-shrink-0" />
                          <span className="text-xs">{question}</span>
                        </Button>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-3">
                  <Button onClick={askAboutDocument} className="bg-indigo-600 hover:bg-indigo-700">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat About This Document
                  </Button>
                  <Button variant="outline" onClick={() => (window.location.href = "/drafts")}>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Response Document
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Analysis
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setUploadedFile(null)
                      setAnalysisResult(null)
                      setUploadProgress(0)
                    }}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Another File
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
