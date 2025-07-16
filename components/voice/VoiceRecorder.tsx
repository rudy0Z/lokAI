"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, MicOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/LanguageContext"
import { motion } from "framer-motion"

interface VoiceRecorderProps {
  onTranscription: (text: string) => void
  language?: string
  className?: string
}

export function VoiceRecorder({ onTranscription, language = "en-IN", className }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [volumeLevel, setVolumeLevel] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const { t } = useLanguage()
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Initialize speech recognition
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()

      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = language

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        onTranscription(transcript)
        setIsProcessing(false)
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
        setError(t("voice.tryAgain"))
        setIsProcessing(false)
        setIsRecording(false)
      }

      recognitionRef.current.onend = () => {
        setIsRecording(false)
        setIsProcessing(false)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [language, onTranscription, t])

  const startRecording = async () => {
    if (!recognitionRef.current) {
      setError(t("voice.notSupported"))
      return
    }

    try {
      setError(null)
      setIsRecording(true)
      setRecordingTime(0)

      // Start speech recognition
      recognitionRef.current.start()

      // Setup audio context for volume monitoring
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const microphone = audioContextRef.current.createMediaStreamSource(stream)
      microphone.connect(analyserRef.current)
      analyserRef.current.fftSize = 256

      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)

      // Monitor volume
      monitorVolume()
    } catch (error) {
      console.error("Recording error:", error)
      setError(t("voice.permissionDenied"))
      setIsRecording(false)
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
    }

    setIsRecording(false)
    setIsProcessing(true)
    setVolumeLevel(0)
  }

  const monitorVolume = () => {
    if (!analyserRef.current) return

    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const updateVolume = () => {
      if (isRecording && analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray)

        let sum = 0
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i]
        }
        const average = sum / bufferLength
        setVolumeLevel((average / 255) * 100)

        requestAnimationFrame(updateVolume)
      }
    }

    updateVolume()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Recording Button */}
          <div className="relative">
            <motion.div
              className={`w-20 h-20 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${
                isRecording
                  ? "bg-gradient-to-r from-red-500 to-pink-500 shadow-lg shadow-red-500/50"
                  : isProcessing
                    ? "bg-gradient-to-r from-blue-500 to-purple-500"
                    : "bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-lg hover:shadow-orange-500/50"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              ) : isRecording ? (
                <MicOff className="h-8 w-8 text-white" />
              ) : (
                <Mic className="h-8 w-8 text-white" />
              )}
            </motion.div>

            {/* Volume Indicator */}
            {isRecording && (
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-red-300"
                animate={{
                  scale: [1, 1 + (volumeLevel / 100) * 0.3, 1],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Number.POSITIVE_INFINITY,
                }}
              />
            )}
          </div>

          {/* Status */}
          <div className="text-center">
            {isProcessing ? (
              <Badge className="bg-blue-100 text-blue-800">{t("voice.processing")}</Badge>
            ) : isRecording ? (
              <div className="space-y-2">
                <Badge className="bg-red-100 text-red-800">
                  {t("voice.listening")} {formatTime(recordingTime)}
                </Badge>
                <p className="text-sm text-gray-600">{t("voice.speak")}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Badge className="bg-green-100 text-green-800">Ready to listen</Badge>
                <p className="text-sm text-gray-600">Click to start recording</p>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="text-center">
              <p className="text-sm text-red-600">{error}</p>
              <Button variant="outline" size="sm" onClick={() => setError(null)} className="mt-2">
                {t("common.retry")}
              </Button>
            </div>
          )}

          {/* Volume Bar */}
          {isRecording && (
            <div className="w-full max-w-xs">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-400 to-red-500 h-2 rounded-full transition-all duration-100"
                  style={{ width: `${volumeLevel}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 text-center mt-1">Volume Level</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
