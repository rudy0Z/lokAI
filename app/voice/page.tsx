"use client"

import { useState, useEffect, useRef } from "react"
import { Mic, Volume2, VolumeX, Play, Pause, RotateCcw, HelpCircle, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { Navigation } from "@/components/layout/Navigation"
import { VoiceRecorder } from "@/components/voice/VoiceRecorder"
import { redirect } from "next/navigation"

export default function VoiceInterface() {
  const { user, loading: authLoading } = useAuth()
  const { t, language, setLanguage } = useLanguage()

  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [selectedVoiceLanguage, setSelectedVoiceLanguage] = useState("hi-IN") // Separate state for voice language
  const [speechRate, setSpeechRate] = useState([1])
  const [autoPlay, setAutoPlay] = useState(true)
  const [transcribedText, setTranscribedText] = useState("")
  const [aiResponse, setAiResponse] = useState("")
  const [volumeLevel, setVolumeLevel] = useState(0)
  const [isLoadingAI, setIsLoadingAI] = useState(false)

  const recordingInterval = useRef<NodeJS.Timeout>()
  const mediaRecorder = useRef<MediaRecorder>()
  const audioContext = useRef<AudioContext>()
  const analyser = useRef<AnalyserNode>()

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      redirect("/")
    }
  }, [user, authLoading])

  useEffect(() => {
    // Sync the voice language selector with the main app language
    const currentLangCode = language === "en" ? "en-IN" : `${language}-IN`
    setSelectedVoiceLanguage(currentLangCode)
  }, [language])

  useEffect(() => {
    if (isRecording) {
      recordingInterval.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } else {
      clearInterval(recordingInterval.current)
      setRecordingTime(0)
    }

    return () => clearInterval(recordingInterval.current)
  }, [isRecording])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t("common.loading")}</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const languages = [
    { code: "hi-IN", name: "Hindi", native: "हिंदी", flag: "🇮🇳", langCode: "hi" },
    { code: "en-IN", name: "English (India)", native: "English", flag: "🇮🇳", langCode: "en" },
    { code: "ta-IN", name: "Tamil", native: "தமிழ்", flag: "🇮🇳", langCode: "ta" },
    { code: "bn-IN", name: "Bengali", native: "বাংলা", flag: "🇮🇳", langCode: "bn" },
    { code: "kn-IN", name: "Kannada", native: "ಕನ್ನಡ", flag: "🇮🇳", langCode: "kn" },
    { code: "gu-IN", name: "Gujarati", native: "ગુજરાતી", flag: "🇮🇳", langCode: "gu" },
    { code: "mr-IN", name: "Marathi", native: "मराठी", flag: "🇮🇳", langCode: "mr" },
    { code: "te-IN", name: "Telugu", native: "తెలుగు", flag: "🇮🇳", langCode: "te" },
    { code: "pa-IN", name: "Punjabi", native: "ਪੰਜਾਬੀ", flag: "🇮🇳", langCode: "pa" },
  ]

  const voiceCommands = [
    {
      category: language === "hi" ? "कानूनी सहायता" : language === "ta" ? "சட்ட உதவி" : "Legal Help",
      commands: [
        { phrase: "मेरे किरायेदार के अधिकार क्या हैं?", translation: "What are my tenant rights?" },
        { phrase: "शिकायत पत्र कैसे लिखें?", translation: "How to write a complaint letter?" },
        { phrase: "RTI आवेदन कैसे दें?", translation: "How to file RTI application?" },
      ],
    },
    {
      category: language === "hi" ? "नागरिक अपडेट" : language === "ta" ? "குடிமக்கள் புதுப்பிப்புகள்" : "Civic Updates",
      commands: [
        { phrase: "मेरे क्षेत्र में क्या अपडेट हैं?", translation: "What updates are in my area?" },
        { phrase: "सरकारी नोटिस दिखाएं", translation: "Show government notices" },
        { phrase: "पब्लिक मीटिंग कब है?", translation: "When is the public meeting?" },
      ],
    },
    {
      category: language === "hi" ? "दस्तावेज़ जेनरेटर" : language === "ta" ? "ஆவண ஜெனரேட்டர்" : "Document Generation",
      commands: [
        { phrase: "कानूनी नोटिस बनाएं", translation: "Generate legal notice" },
        { phrase: "शिकायत का पत्र तैयार करें", translation: "Prepare complaint letter" },
        { phrase: "RTI फॉर्म भरें", translation: "Fill RTI form" },
      ],
    },
  ]

  const conversationHistory = [
    {
      id: 1,
      userInput:
        language === "hi"
          ? "मेरे मकान मालिक ने मुझे बिना नोटिस के निकालने को कहा है"
          : language === "ta"
            ? "எனது வீட்டு உரிமையாளர் சரியான அறிவிப்பு இல்லாமல் காலி செய்யச் சொல்கிறார்"
            : "My landlord is asking me to vacate without proper notice",
      aiResponse:
        language === "hi"
          ? "आपके पास किरायेदार के रूप में अधिकार हैं। मकान मालिक को कम से कम 30 दिन का नोटिस देना होगा। मैं आपके लिए एक कानूनी नोटिस तैयार कर सकता हूं।"
          : language === "ta"
            ? "உங்கள் குத்தகைதாரர் உரிமைகள் பாதுகாக்கப்படுகின்றன. வீட்டு உரிமையாளர் குறைந்தது 30 நாட்கள் அறிவிப்பு கொடுக்க வேண்டும். நான் உங்களுக்கு ஒரு சட்ட அறிவிப்பை உருவாக்க முடியும்."
            : "You have rights as a tenant. The landlord must provide at least 30 days' notice. I can help you draft a legal notice.",
      timestamp: "2024-01-15 14:30",
      language: language === "hi" ? "Hindi" : language === "ta" ? "Tamil" : "English",
    },
    {
      id: 2,
      userInput:
        language === "hi"
          ? "मैं उपभोक्ता शिकायत कैसे दर्ज करूं?"
          : language === "ta"
            ? "நான் நுகர்வோர் புகார் எப்படி தாக்கல் செய்வது?"
            : "How do I file a consumer complaint?",
      aiResponse:
        language === "hi"
          ? "आप राष्ट्रीय उपभोक्ता हेल्पलाइन के माध्यम से या अपने निकटतम जिला उपभोक्ता फोरम में उपभोक्ता शिकायत दर्ज कर सकते हैं। मैं आपको सभी आवश्यक विवरणों के साथ शिकायत पत्र तैयार करने में मदद कर सकता हूं।"
          : language === "ta"
            ? "தேசிய நுகர்வோர் உதவி மையம் அல்லது உங்கள் அருகிலுள்ள மாவட்ட நுகர்வோர் மன்றம் மூலம் நுகர்வோர் புகாரை தாக்கல் செய்யலாம். தேவையான அனைத்து விவரங்களுடன் புகார் கடிதத்தை தயாரிக்க நான் உங்களுக்கு உதவ முடியும்."
            : "You can file a consumer complaint through the National Consumer Helpline or visit your nearest District Consumer Forum. I can help you prepare the complaint letter with all necessary details.",
      timestamp: "2024-01-15 12:15",
      language: language === "hi" ? "Hindi" : language === "ta" ? "Tamil" : "English",
    },
  ]

  const generateAIResponse = (input: string) => {
    setIsLoadingAI(true)
    setTimeout(() => {
      const lowerInput = input.toLowerCase()
      let response = ""

      if (lowerInput.includes("tenant") || lowerInput.includes("किरायेदार") || lowerInput.includes("குத்தகைதாரர்")) {
        response =
          language === "hi"
            ? "आपके सवाल के जवाब में, किरायेदार के रूप में आपके पास कई महत्वपूर्ण अधिकार हैं: सुरक्षा जमा वापसी, बेदखली नोटिस, और किराया नियंत्रण। क्या आप चाहते हैं कि मैं आपके लिए एक कानूनी नोटिस तैयार करूं?"
            : language === "ta"
              ? "உங்கள் கேள்விக்கு பதிலளிக்கும் விதமாக, குத்தகைதாரராக உங்களுக்கு பல முக்கிய உரிமைகள் உள்ளன: பாதுகாப்பு வைப்புத்தொகை திரும்பப் பெறுதல், வெளியேற்ற அறிவிப்பு, மற்றும் வாடகை கட்டுப்பாடு. நான் உங்களுக்கு ஒரு சட்ட அறிவிப்பை உருவாக்க வேண்டுமா?"
              : "In response to your question, as a tenant, you have several important rights: security deposit return, eviction notice, and rent control. Would you like me to draft a legal notice for you?"
      } else if (lowerInput.includes("complaint") || lowerInput.includes("शिकायत") || lowerInput.includes("புகார்")) {
        response =
          language === "hi"
            ? "मैं आपको शिकायत पत्र तैयार करने में मदद कर सकता हूं। कृपया बताएं कि आप किसे शिकायत कर रहे हैं, क्या मुद्दा है, और आप क्या समाधान चाहते हैं।"
            : language === "ta"
              ? "புகார் கடிதத்தை தயாரிக்க நான் உங்களுக்கு உதவ முடியும். நீங்கள் யாருக்கு புகார் செய்கிறீர்கள், என்ன பிரச்சினை, மற்றும் என்ன தீர்வு எதிர்பார்க்கிறீர்கள் என்பதை தயவுசெய்து சொல்லுங்கள்."
              : "I can help you prepare a complaint letter. Please tell me who you are complaining to, what the issue is, and what resolution you are seeking."
      } else if (lowerInput.includes("rti") || lowerInput.includes("आरटीआई")) {
        response =
          language === "hi"
            ? "मैं आपको RTI आवेदन बनाने में मदद कर सकता हूं। कृपया बताएं कि आपको किस सरकारी विभाग से जानकारी चाहिए, और आपके संपर्क विवरण क्या हैं।"
            : language === "ta"
              ? "RTI விண்ணப்பத்தை உருவாக்க நான் உங்களுக்கு உதவ முடியும். எந்த அரசுத் துறையிலிருந்து உங்களுக்கு தகவல் தேவை, மற்றும் உங்கள் தொடர்பு விவரங்கள் என்ன என்பதை தயவுசெய்து சொல்லுங்கள்."
              : "I can help you create an RTI application. Please tell me which government department you need information from, and what your contact details are."
      } else {
        response =
          language === "hi"
            ? `मैंने सुना: '${input}'। मैं कानूनी या नागरिक मामलों में आपकी कैसे मदद कर सकता हूं?`
            : language === "ta"
              ? `நான் கேட்டது: '${input}'. சட்ட அல்லது குடிமக்கள் விவகாரங்களில் நான் உங்களுக்கு எப்படி உதவ முடியும்?`
              : `I heard: '${input}'. How can I help you with legal or civic matters?`
      }
      setAiResponse(response)
      if (autoPlay) {
        speakText(response)
      }
      setIsLoadingAI(false)
    }, 2000)
  }

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = selectedVoiceLanguage
      utterance.rate = speechRate[0]

      utterance.onstart = () => setIsPlaying(true)
      utterance.onend = () => setIsPlaying(false)
      utterance.onerror = (event) => console.error("Speech synthesis error:", event)

      speechSynthesis.speak(utterance)
    } else {
      console.warn("Speech Synthesis API not supported in this browser.")
    }
  }

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel()
      setIsPlaying(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleVoiceTranscription = (text: string) => {
    setTranscribedText(text)
    generateAIResponse(text)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Voice Interface */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="voice" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <TabsTrigger
                  value="voice"
                  className="data-[state=active]:bg-purple-500 data-[state=active]:text-white dark:data-[state=active]:bg-purple-700"
                >
                  {language === "hi" ? "वॉइस चैट" : language === "ta" ? "குரல் அரட்டை" : "Voice Chat"}
                </TabsTrigger>
                <TabsTrigger
                  value="commands"
                  className="data-[state=active]:bg-purple-500 data-[state=active]:text-white dark:data-[state=active]:bg-purple-700"
                >
                  {language === "hi" ? "वॉइस कमांड" : language === "ta" ? "குரல் கட்டளைகள்" : "Voice Commands"}
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="data-[state=active]:bg-purple-500 data-[state=active]:text-white dark:data-[state=active]:bg-purple-700"
                >
                  {language === "hi" ? "बातचीत का इतिहास" : language === "ta" ? "உரையாடல் வரலாறு" : "Conversation History"}
                </TabsTrigger>
              </TabsList>

              {/* Voice Chat Tab */}
              <TabsContent value="voice">
                <Card className="h-[600px] flex flex-col bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center text-gray-900 dark:text-white">
                      <Mic className="h-6 w-6 mr-2 text-purple-600 dark:text-purple-400" />
                      {language === "hi" ? "वॉइस इंटरफ़ेस" : language === "ta" ? "குரல் இடைமுகம்" : "Voice Interface"}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      {language === "hi"
                        ? "अपनी पसंदीदा भाषा में बोलें। मैं समझूंगा और जवाब दूंगा।"
                        : language === "ta"
                          ? "உங்களுக்கு விருப்பமான மொழியில் பேசுங்கள். நான் புரிந்துகொண்டு பதிலளிப்பேன்."
                          : "Speak in your preferred language. I'll understand and respond back."}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex flex-col items-center space-y-6">
                    {/* Voice Recorder Component */}
                    <VoiceRecorder
                      onTranscription={handleVoiceTranscription}
                      language={selectedVoiceLanguage}
                      className="border-0 shadow-none p-0"
                    />

                    {/* Transcribed Text */}
                    {transcribedText && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-md"
                      >
                        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                          <CardContent className="p-4">
                            <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                              {language === "hi" ? "आपने कहा:" : language === "ta" ? "நீங்கள் சொன்னது:" : "You said:"}
                            </h4>
                            <p className="text-blue-800 dark:text-blue-300">{transcribedText}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}

                    {/* AI Response */}
                    {aiResponse && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-md"
                      >
                        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-green-900 dark:text-green-200">
                                {language === "hi"
                                  ? "LokAI प्रतिक्रिया:"
                                  : language === "ta"
                                    ? "LokAI பதில்:"
                                    : "LokAI Response:"}
                              </h4>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => speakText(aiResponse)}
                                  disabled={isPlaying || isLoadingAI}
                                  className="bg-transparent border-gray-300 dark:border-gray-600"
                                >
                                  {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                                </Button>
                                {isPlaying && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={stopSpeaking}
                                    className="bg-transparent border-gray-300 dark:border-gray-600"
                                  >
                                    <VolumeX className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                            <p className="text-green-800 dark:text-green-300 whitespace-pre-line">
                              {isLoadingAI ? (
                                <Loader2 className="h-4 w-4 animate-spin inline-block mr-2" />
                              ) : (
                                aiResponse
                              )}
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Voice Commands Tab */}
              <TabsContent value="commands">
                <div className="space-y-6">
                  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-gray-900 dark:text-white">
                        {language === "hi"
                          ? "इन वॉइस कमांड को आज़माएं"
                          : language === "ta"
                            ? "இந்த குரல் கட்டளைகளை முயற்சிக்கவும்"
                            : "Try These Voice Commands"}
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        {language === "hi"
                          ? "इसे आज़माने के लिए किसी भी कमांड पर क्लिक करें, या सीधे वॉइस असिस्टेंट से कहें"
                          : language === "ta"
                            ? "இதை முயற்சிக்க எந்த கட்டளையிலும் கிளிக் செய்யவும், அல்லது குரல் உதவியாளரிடம் நேரடியாக சொல்லவும்"
                            : "Click on any command to try it, or say it directly to the voice assistant"}
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  {voiceCommands.map((category, categoryIndex) => (
                    <motion.div
                      key={categoryIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: categoryIndex * 0.1 }}
                    >
                      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <CardHeader>
                          <CardTitle className="text-lg text-gray-900 dark:text-white">{category.category}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {category.commands.map((command, commandIndex) => (
                              <div
                                key={commandIndex}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                                onClick={() => {
                                  setTranscribedText(command.phrase)
                                  generateAIResponse(command.phrase)
                                }}
                              >
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">{command.phrase}</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{command.translation}</p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-transparent border-gray-300 dark:border-gray-600"
                                >
                                  <Play className="h-3 w-3 mr-1" />
                                  {language === "hi" ? "आज़माएं" : language === "ta" ? "முயற்சி" : "Try"}
                                </Button>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              {/* Conversation History Tab */}
              <TabsContent value="history">
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">
                      {language === "hi"
                        ? "बातचीत का इतिहास"
                        : language === "ta"
                          ? "உரையாடல் வரலாறு"
                          : "Conversation History"}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      {language === "hi"
                        ? "LokAI के साथ आपकी हाल की वॉइस इंटरैक्शन"
                        : language === "ta"
                          ? "LokAI உடன் உங்கள் சமீபத்திய குரல் தொடர்புகள்"
                          : "Your recent voice interactions with LokAI"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {conversationHistory.map((conversation) => (
                        <motion.div
                          key={conversation.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <Badge
                              variant="outline"
                              className="bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
                            >
                              {conversation.language}
                            </Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{conversation.timestamp}</span>
                          </div>

                          <div className="space-y-3">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                              <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
                                {language === "hi" ? "आप:" : language === "ta" ? "நீங்கள்:" : "You:"}
                              </p>
                              <p className="text-blue-800 dark:text-blue-300">{conversation.userInput}</p>
                            </div>

                            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                              <p className="text-sm font-medium text-green-900 dark:text-green-200 mb-1">LokAI:</p>
                              <p className="text-green-800 dark:text-green-300">{conversation.aiResponse}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-end mt-3 space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => speakText(conversation.aiResponse)}
                              className="bg-transparent border-gray-300 dark:border-gray-600"
                            >
                              <Volume2 className="h-3 w-3 mr-1" />
                              {language === "hi" ? "पुनः चलाएं" : language === "ta" ? "மீண்டும் இயக்கவும்" : "Replay"}
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Voice Settings */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-white">
                  {language === "hi" ? "वॉइस सेटिंग्स" : language === "ta" ? "குரல் அமைப்புகள்" : "Voice Settings"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    {language === "hi" ? "भाषण दर" : language === "ta" ? "பேச்சு விகிதம்" : "Speech Rate"}
                  </label>
                  <Slider
                    value={speechRate}
                    onValueChange={setSpeechRate}
                    max={2}
                    min={0.5}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>{language === "hi" ? "धीमा" : language === "ta" ? "மெதுவாக" : "Slow"}</span>
                    <span>{language === "hi" ? "सामान्य" : language === "ta" ? "சாதாரண" : "Normal"}</span>
                    <span>{language === "hi" ? "तेज" : language === "ta" ? "வேகமாக" : "Fast"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === "hi"
                      ? "प्रतिक्रियाएं स्वतः चलाएं"
                      : language === "ta"
                        ? "பதில்களை தானாக இயக்கவும்"
                        : "Auto-play responses"}
                  </label>
                  <Switch checked={autoPlay} onCheckedChange={setAutoPlay} />
                </div>
              </CardContent>
            </Card>

            {/* Language Support */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-white">
                  {language === "hi"
                    ? "समर्थित भाषाएं"
                    : language === "ta"
                      ? "ஆதரிக்கப்படும் மொழிகள்"
                      : "Supported Languages"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2">
                  {languages.map((lang) => (
                    <div
                      key={lang.code}
                      className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedVoiceLanguage === lang.code
                          ? "bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                      onClick={() => {
                        setSelectedVoiceLanguage(lang.code)
                        setLanguage(lang.langCode as any) // Update main app language
                      }}
                    >
                      <span>{lang.flag}</span>
                      <span className="text-sm font-medium">{lang.native}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Help & Tips */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg flex items-center text-gray-900 dark:text-white">
                  <HelpCircle className="h-5 w-5 mr-2" />
                  {language === "hi" ? "वॉइस टिप्स" : language === "ta" ? "குரல் குறிப்புகள்" : "Voice Tips"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-start space-x-2">
                    <span className="text-purple-600">•</span>
                    <span>
                      {language === "hi"
                        ? "स्पष्ट और मध्यम गति से बोलें"
                        : language === "ta"
                          ? "தெளிவாகவும் மிதமான வேகத்திலும் பேசுங்கள்"
                          : "Speak clearly and at a moderate pace"}
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-purple-600">•</span>
                    <span>
                      {language === "hi"
                        ? "बेहतर सटीकता के लिए शांत वातावरण का उपयोग करें"
                        : language === "ta"
                          ? "சிறந்த துல்லியத்திற்காக அமைதியான சூழலைப் பயன்படுத்தவும்"
                          : "Use a quiet environment for better accuracy"}
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-purple-600">•</span>
                    <span>
                      {language === "hi"
                        ? "पहले सुझाए गए वॉइस कमांड आज़माएं"
                        : language === "ta"
                          ? "முதலில் பரிந்துரைக்கப்பட்ட குரல் கட்டளைகளை முயற்சிக்கவும்"
                          : "Try the suggested voice commands first"}
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-purple-600">•</span>
                    <span>
                      {language === "hi"
                        ? "बेहतर पहचान के लिए कभी भी भाषा बदलें"
                        : language === "ta"
                          ? "சிறந்த அங்கீகாரத்திற்காக எந்த நேரத்திலும் மொழிகளை மாற்றவும்"
                          : "Switch languages anytime for better recognition"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-white">
                  {language === "hi" ? "त्वरित कार्रवाई" : language === "ta" ? "விரைவு செயல்கள்" : "Quick Actions"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent border-gray-300 dark:border-gray-600"
                  asChild
                >
                  <Link href="/legal">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    {language === "hi" ? "कानूनी सहायता" : language === "ta" ? "சட்ட உதவி" : "Legal Help"}
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent border-gray-300 dark:border-gray-600"
                  asChild
                >
                  <Link href="/documents">
                    <FileText className="h-4 w-4 mr-2" />
                    {language === "hi"
                      ? "दस्तावेज़ जेनरेट करें"
                      : language === "ta"
                        ? "ஆவணங்களை உருவாக்கவும்"
                        : "Generate Documents"}
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent border-gray-300 dark:border-gray-600"
                  asChild
                >
                  <Link href="/dashboard">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {language === "hi"
                      ? "डैशबोर्ड पर वापस"
                      : language === "ta"
                        ? "டாஷ்போர்டுக்குத் திரும்பு"
                        : "Back to Dashboard"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
