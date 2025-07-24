"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  Send,
  FileText,
  MessageSquare,
  AlertCircle,
  Building,
  Search,
  Paperclip,
} from "lucide-react"
import { toast } from "sonner"
import ReactMarkdown from "react-markdown"

interface PDFAnalysisResult {
  text: string;
  analysis: {
    summary: string;
    keyPoints: string[];
    documentType: string;
    deadlines: string[];
    fees: string[];
    contactInfo: string[];
  };
  metadata: {
    fileName: string;
    fileSize: string;
    pages: number;
    type: string;
  };
  success: boolean;
  confidence?: number;
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
  return {
    text: result.text || '',
    analysis: {
      summary: result.analysis?.summary || 'Document analysis completed.',
      keyPoints: result.analysis?.keyPoints || ['Document processed successfully'],
      documentType: result.analysis?.documentType || 'Government Document',
      deadlines: result.analysis?.deadlines || [],
      fees: result.analysis?.fees || [],
      contactInfo: result.analysis?.contactInfo || [],
    },
    metadata: result.metadata || {
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(2)} KB`,
      pages: 1,
      type: 'PDF',
    },
    success: result.success || true,
    confidence: 0.95, // Mock confidence score
  };
}

// Mock data for demonstration
const mockAlerts = [
  { id: 1, title: "New Property Tax Guidelines", city: "Mumbai", date: "2025-01-20", type: "Tax" },
  { id: 2, title: "Water Supply Maintenance Notice", city: "Delhi", date: "2025-01-19", type: "Utilities" },
  { id: 3, title: "Road Construction Update", city: "Bangalore", date: "2025-01-18", type: "Infrastructure" },
]

const cities = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad"]

interface ChatMessage {
  id: number
  type: "user" | "ai"
  content: string
  fileAnalysis?: PDFAnalysisResult
  fileName?: string
  topics?: string[]
  suggestions?: string[]
  relevantLaws?: string[]
}

export default function ChatPage() {
  const [query, setQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const [currentTopics, setCurrentTopics] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)

  // Check for URL parameters (file context from upload page)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const fileId = urlParams.get("file")
    const question = urlParams.get("question")

    if (question) {
      setQuery(decodeURIComponent(question))
    }
  }, [])

  const handleUserQuery = async (userQuery: string) => {
    if (!userQuery.trim()) return

    const newMessage: ChatMessage = { id: Date.now(), type: "user", content: userQuery }
    setMessages((prev) => [...prev, newMessage])
    setQuery("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userQuery,
          city: selectedCity,
          language: "English",
          context: {},
          sessionId: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from AI");
      }

      const result = await response.json();
      const aiMessage: ChatMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: result.data.response,
        topics: result.data.topics || [],
        suggestions: result.data.suggestions || [],
        relevantLaws: result.data.relevantLaws || [],
      };
      
      setMessages((prev) => [...prev, aiMessage]);
      
      // Update current topics
      if (result.data.topics && result.data.topics.length > 0) {
        setCurrentTopics(prev => [...new Set([...prev, ...result.data.topics])]);
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: "Sorry, I'm having trouble connecting to the AI. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload PDF files only.")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size should be less than 10MB.")
      return
    }

    setUploadingFile(true)

    try {
      // Add user message about file upload
      const uploadMessage: ChatMessage = {
        id: Date.now(),
        type: "user",
        content: `📎 Uploaded file: ${file.name}`,
        fileName: file.name,
      }
      setMessages((prev) => [...prev, uploadMessage])

      // Process the file
      const analysis = await processUploadedFile(file)

      // Add AI response with analysis
      const analysisMessage: ChatMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: `I've analyzed your document "${file.name}". Here's what I found:

**Document Type**: ${analysis.analysis.documentType}
**Summary**: ${analysis.analysis.summary}

**Key Points**:
${analysis.analysis.keyPoints.map((point: string) => `• ${point}`).join("\n")}

${analysis.analysis.deadlines.length > 0 ? `**⚠️ Important Deadlines**:\n${analysis.analysis.deadlines.map((deadline: string) => `• ${deadline}`).join("\n")}\n` : ""}

${analysis.analysis.fees.length > 0 ? `**💰 Fees/Charges**:\n${analysis.analysis.fees.map((fee: string) => `• ${fee}`).join("\n")}\n` : ""}

${analysis.analysis.contactInfo.length > 0 ? `**📞 Contact Information**:\n${analysis.analysis.contactInfo.map((contact: string) => `• ${contact}`).join("\n")}\n` : ""}

You can ask me specific questions about this document, or I can help you take action based on its contents.`,
        fileAnalysis: analysis,
        fileName: file.name,
      }

      setMessages((prev) => [...prev, analysisMessage])
      toast.success(`Successfully analyzed ${file.name}`)
    } catch (error) {
      console.error("Error processing file:", error)
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: `I encountered an error while analyzing "${file.name}". Please try uploading the file again or contact support if the issue persists.`,
      }
      setMessages((prev) => [...prev, errorMessage])
      toast.error("Failed to analyze the document. Please try again.")
    } finally {
      setUploadingFile(false)
    }
  }

  const handleCityChange = (city: string) => {
    setSelectedCity(city)
    if (messages.length > 0) {
      const cityMessage: ChatMessage = {
        id: Date.now(),
        type: "ai",
        content: `Great! I've updated your location to ${city}. I can now provide you with city-specific information, local government contacts, and relevant civic alerts for ${city}.`,
      }
      setMessages((prev) => [...prev, cityMessage])
    }
  }

  const handleActionClick = (actionType: string) => {
    const actionMessage: ChatMessage = {
      id: Date.now(),
      type: "ai",
      content: `I'll help you ${actionType.toLowerCase()}. Let me guide you through the process step by step. What specific information or assistance do you need for this?`,
    }
    setMessages((prev) => [...prev, actionMessage])
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar - Topics & Session Info */}
        <div className="lg:col-span-1 space-y-4">
          {/* Current Topics */}
          {currentTopics.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Discussion Topics</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {currentTopics.map((topic, index) => (
                    <div
                      key={index}
                      className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium"
                    >
                      {topic}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Session Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Session Info</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2 text-xs text-gray-600">
              <div>City: {selectedCity || "Not selected"}</div>
              <div>Messages: {messages.length}</div>
              <div>Session: {sessionId.split('_')[1]}</div>
            </CardContent>
          </Card>

          {/* Quick Legal Help */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Quick Legal Help</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <div className="text-xs space-y-1">
                <div className="font-medium text-gray-700">Emergency Helplines:</div>
                <div className="text-gray-600">Women: 1091</div>
                <div className="text-gray-600">Child: 1098</div>
                <div className="text-gray-600">Senior Citizens: 14567</div>
                <div className="text-gray-600">Income Tax: 1961</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Chat Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Chat with LokAI</h1>
            <p className="text-gray-600">Ask me anything about government processes, documents, or civic issues</p>
          </div>

          {/* Controls */}
          <Card>
            <CardContent className="p-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Select value={selectedCity} onValueChange={handleCityChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploadingFile}
                  />
                  <Button variant="outline" className="w-full bg-transparent" disabled={uploadingFile}>
                    {uploadingFile ? (
                      <div className="h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {uploadingFile ? "Processing..." : "Upload PDF"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chat Messages */}
          <Card className="min-h-[400px]">
            <CardContent className="p-6">
              <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Welcome to LokAI - Your Indian Civic Assistant</h3>
                    <p className="text-gray-500 mb-6">Ask questions about Indian laws, government processes, or upload documents for analysis</p>
                    
                    <div className="grid gap-3 max-w-2xl mx-auto">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Popular Questions:</h4>
                      <div className="grid gap-2 text-sm">
                        <button 
                          onClick={() => setMessage("How to file an RTI application?")}
                          className="p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                        >
                          🏛️ How to file an RTI application?
                        </button>
                        <button 
                          onClick={() => setMessage("What documents are needed for Aadhaar card correction?")}
                          className="p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
                        >
                          📄 What documents are needed for Aadhaar card correction?
                        </button>
                        <button 
                          onClick={() => setMessage("How to register a consumer complaint?")}
                          className="p-3 text-left bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors"
                        >
                          ⚖️ How to register a consumer complaint?
                        </button>
                        <button 
                          onClick={() => setMessage("What are my rights as a tenant in India?")}
                          className="p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
                        >
                          🏠 What are my rights as a tenant in India?
                        </button>
                        <button 
                          onClick={() => setMessage("How to apply for PM-KISAN scheme benefits?")}
                          className="p-3 text-left bg-pink-50 hover:bg-pink-100 rounded-lg border border-pink-200 transition-colors"
                        >
                          🌾 How to apply for PM-KISAN scheme benefits?
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200 max-w-xl mx-auto">
                      <p className="text-sm text-amber-800">
                        💡 <strong>Tip:</strong> Upload government documents (tax notices, bills, legal papers) for instant analysis and guidance
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.type === "user" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        {message.fileName && (
                          <div className="flex items-center space-x-2 mb-2 text-sm opacity-75">
                            <Paperclip className="h-3 w-3" />
                            <span>{message.fileName}</span>
                          </div>
                        )}
                        {message.type === "ai" ? (
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                                em: ({ children }) => <em className="italic">{children}</em>,
                                ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>,
                                li: ({ children }) => <li className="ml-2">{children}</li>,
                                h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-sm font-bold mb-2">{children}</h3>,
                                code: ({ children }) => <code className="bg-gray-200 px-1 py-0.5 rounded text-sm font-mono">{children}</code>,
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                            
                            {/* Legal Topics */}
                            {message.topics && message.topics.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="text-xs font-medium text-gray-600 mb-1">Legal Topics:</div>
                                <div className="flex flex-wrap gap-1">
                                  {message.topics.map((topic, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800"
                                    >
                                      {topic}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Quick Suggestions */}
                            {message.suggestions && message.suggestions.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="text-xs font-medium text-gray-600 mb-2">Related Questions:</div>
                                <div className="space-y-1">
                                  {message.suggestions.map((suggestion, index) => (
                                    <button
                                      key={index}
                                      onClick={() => setQuery(suggestion)}
                                      className="block w-full text-left text-xs p-2 bg-gray-50 hover:bg-gray-100 rounded border text-gray-700 transition-colors"
                                    >
                                      💡 {suggestion}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        )}
                        {message.fileAnalysis && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="text-xs text-gray-600">
                              Analysis confidence: {Math.round((message.fileAnalysis.confidence || 0.95) * 100)}%
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="flex space-x-2">
                <Textarea
                  placeholder="Type your civic issue or question..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 min-h-[60px]"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleUserQuery(query)
                    }
                  }}
                />
                <Button
                  onClick={() => handleUserQuery(query)}
                  disabled={!query.trim() || isLoading}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {messages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Suggested Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Button variant="outline" onClick={() => handleActionClick("Draft RTI")} className="justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Draft RTI
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleActionClick("Lodge Complaint")}
                    className="justify-start"
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Lodge Complaint
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleActionClick("Find Authority")}
                    className="justify-start"
                  >
                    <Building className="h-4 w-4 mr-2" />
                    Find Authority
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleActionClick("Recent Civic Alerts")}
                    className="justify-start"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Recent Alerts
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Latest Alerts */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Latest Civic Alerts</CardTitle>
              <p className="text-sm text-gray-600">Recent updates from government sources</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockAlerts.map((alert) => (
                <div key={alert.id} className="border-l-4 border-indigo-500 pl-4 py-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium text-sm">{alert.title}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {alert.city}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {alert.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">{alert.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <p className="font-medium">💡 Pro Tips:</p>
                <ul className="space-y-1 text-gray-600">
                  <li>• Upload PDFs for instant analysis</li>
                  <li>• Select your city for local alerts</li>
                  <li>• Ask specific questions for better help</li>
                  <li>• Use action buttons for quick tasks</li>
                  <li>• Mention document types for targeted advice</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
