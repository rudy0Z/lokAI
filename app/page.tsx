"use client"

import { useState } from "react"
import { Mic, FileText, Scale, Bell, ChevronRight, Shield, Zap, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { motion } from "framer-motion"
import { AuthModal } from "@/components/auth/AuthModal"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { LanguageSelector } from "@/components/ui/language-selector"
import { LocationDetector } from "@/components/ui/location-detector"
import { VoiceRecorder } from "@/components/voice/VoiceRecorder"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { useLocation } from "@/contexts/LocationContext"
import { useTheme } from "@/contexts/ThemeContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function HomePage() {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false)
  const [voiceTranscription, setVoiceTranscription] = useState("")

  const { user, userProfile, logout } = useAuth()
  const { t, language } = useLanguage()
  const { location } = useLocation()
  const { actualTheme } = useTheme()

  const features = [
    {
      icon: <Bell className="h-8 w-8" />,
      title: t("features.civicAwareness.title"),
      description: t("features.civicAwareness.description"),
      color: "bg-blue-500",
    },
    {
      icon: <Scale className="h-8 w-8" />,
      title: t("features.legalRights.title"),
      description: t("features.legalRights.description"),
      color: "bg-green-500",
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: t("features.documentGenerator.title"),
      description: t("features.documentGenerator.description"),
      color: "bg-purple-500",
    },
    {
      icon: <Mic className="h-8 w-8" />,
      title: t("features.voiceInterface.title"),
      description: t("features.voiceInterface.description"),
      color: "bg-orange-500",
    },
  ]

  const stats = [
    { number: "1M+", label: "Citizens Helped" },
    { number: "50K+", label: "Documents Generated" },
    { number: "15+", label: "Languages Supported" },
    { number: "24/7", label: "AI Assistance" },
  ]

  const testimonials = [
    {
      name: "Priya Sharma",
      location: "Mumbai",
      text: "LokAI helped me understand my tenant rights and generate a legal notice. Got my security deposit back!",
      avatar: "PS",
    },
    {
      name: "Rajesh Kumar",
      location: "Delhi",
      text: "The voice feature in Hindi made it so easy to file an RTI application. No more language barriers!",
      avatar: "RK",
    },
    {
      name: "Meera Nair",
      location: "Bangalore",
      text: "Finally got updates about my ward's water tax hearing. Democracy feels more accessible now.",
      avatar: "MN",
    },
  ]

  const handleVoiceTranscription = (text: string) => {
    setVoiceTranscription(text)
    // Here you would typically send this to your AI service
    console.log("Voice transcription:", text)
  }

  const openAuthModal = (mode: "login" | "signup") => {
    setAuthMode(mode)
    setAuthModalOpen(true)
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-orange-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg">
                <Scale className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                LokAI
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/dashboard"
                className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                {t("nav.dashboard")}
              </Link>
              <Link
                href="/legal"
                className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                {t("nav.legalHelp")}
              </Link>
              <Link
                href="/documents"
                className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                {t("nav.documents")}
              </Link>
            </div>

            <div className="flex items-center space-x-3">
              <LanguageSelector />
              <LocationDetector />
              <ThemeToggle />

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={userProfile?.photoURL || "/placeholder.svg"} alt={userProfile?.displayName} />
                        <AvatarFallback>{userProfile?.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{userProfile?.displayName}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <User className="mr-2 h-4 w-4" />
                        <span>{t("nav.dashboard")}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t("nav.logout")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" onClick={() => openAuthModal("login")}>
                    {t("nav.login")}
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    onClick={() => openAuthModal("signup")}
                  >
                    {t("nav.getStarted")}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Badge className="mb-4 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 hover:bg-orange-200 dark:hover:bg-orange-800">
                {t("hero.badge")}
              </Badge>

              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                {t("hero.title")
                  .split(" ")
                  .map((word, index) => (
                    <span key={index}>
                      {word === "AI-Powered" ? (
                        <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                          {word}
                        </span>
                      ) : (
                        word
                      )}{" "}
                    </span>
                  ))}
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">{t("hero.subtitle")}</p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3"
                  asChild={!!user}
                  onClick={!user ? () => openAuthModal("signup") : undefined}
                >
                  {user ? (
                    <Link href="/dashboard">
                      <Zap className="mr-2 h-5 w-5" />
                      {t("hero.startButton")}
                    </Link>
                  ) : (
                    <>
                      <Zap className="mr-2 h-5 w-5" />
                      {t("hero.startButton")}
                    </>
                  )}
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 px-8 py-3 bg-transparent"
                  onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                >
                  <Mic className="mr-2 h-5 w-5" />
                  {t("hero.voiceDemo")}
                </Button>
              </div>

              {/* Voice Demo */}
              {isVoiceEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="max-w-md mx-auto mb-12"
                >
                  <VoiceRecorder
                    onTranscription={handleVoiceTranscription}
                    language={language === "en" ? "en-IN" : `${language}-IN`}
                  />

                  {voiceTranscription && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                    >
                      <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                        You said: "{voiceTranscription}"
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        AI response would appear here...
                      </p>
                    </motion.div>
                  )}

                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-4">{t("hero.voicePlaceholder")}</p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{t("features.title")}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">{t("features.subtitle")}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow border-0 bg-white dark:bg-gray-800">
                  <CardHeader>
                    <div className={`${feature.color} rounded-lg p-3 w-fit mb-4`}>
                      <div className="text-white">{feature.icon}</div>
                    </div>
                    <CardTitle className="text-xl dark:text-white">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">How LokAI Works</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Simple, fast, and in your language</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-orange-100 dark:bg-orange-900/20 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Mic className="h-10 w-10 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4 dark:text-white">1. Speak or Type</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Ask your question in Hindi, English, Tamil, or any Indian language. Use voice or text - whatever feels
                natural.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/20 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Shield className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4 dark:text-white">2. Get AI Analysis</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our AI understands Indian laws and local governance. Get personalized advice based on your location and
                situation.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/20 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <FileText className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4 dark:text-white">3. Take Action</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get ready-to-send documents, contact information for legal aid, and step-by-step guidance to resolve
                your issue.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Real Stories, Real Impact
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">See how LokAI is helping citizens across India</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                  <CardContent className="p-6">
                    <p className="text-gray-700 dark:text-gray-300 mb-6 italic">"{testimonial.text}"</p>
                    <div className="flex items-center">
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-full w-12 h-12 flex items-center justify-center text-white font-semibold mr-4">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</div>
                        <div className="text-gray-600 dark:text-gray-400 text-sm">{testimonial.location}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-red-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Know Your Rights?</h2>
          <p className="text-xl text-orange-100 mb-8">
            Join millions of Indians who are taking control of their civic and legal lives with LokAI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-3"
              onClick={user ? undefined : () => openAuthModal("signup")}
              asChild={!!user}
            >
              {user ? (
                <Link href="/dashboard">
                  Start Free Today
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              ) : (
                <>
                  Start Free Today
                  <ChevronRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-orange-600 px-8 py-3 bg-transparent"
              asChild
            >
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg">
                  <Scale className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold">LokAI</span>
              </div>
              <p className="text-gray-400">Empowering Indian citizens with AI-powered civic and legal assistance.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/dashboard" className="hover:text-white">
                    Civic Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/legal" className="hover:text-white">
                    Legal Assistant
                  </Link>
                </li>
                <li>
                  <Link href="/documents" className="hover:text-white">
                    Document Generator
                  </Link>
                </li>
                <li>
                  <Link href="/voice" className="hover:text-white">
                    Voice Interface
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Languages</h3>
              <div className="grid grid-cols-2 gap-2 text-gray-400 text-sm">
                <div>English</div>
                <div>हिंदी</div>
                <div>தமிழ்</div>
                <div>বাংলা</div>
                <div>ಕನ್ನಡ</div>
                <div>ગુજરાતી</div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 LokAI. Made with ❤️ for India. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultMode={authMode} />
    </div>
  )
}
