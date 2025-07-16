"use client"

import { useState, useEffect } from "react"
import {
  Bell,
  MapPin,
  Calendar,
  Users,
  FileText,
  Mic,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { useLocation } from "@/contexts/LocationContext"
import { useTheme } from "@/contexts/ThemeContext"
import { VoiceRecorder } from "@/components/voice/VoiceRecorder"
import { Navigation } from "@/components/layout/Navigation"
import { redirect } from "next/navigation"

export default function Dashboard() {
  const { user, userProfile, loading: authLoading } = useAuth()
  const { t, language } = useLanguage()
  const { location } = useLocation()
  const { actualTheme } = useTheme()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [notifications, setNotifications] = useState(3)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      redirect("/")
    }
  }, [user, authLoading])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t("common.loading")}</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const civicAlerts = [
    {
      id: 1,
      title:
        language === "hi"
          ? "वार्ड 15 - जल कर संशोधन"
          : language === "ta"
            ? "வார்டு 15 - நீர் வரி திருத்தம்"
            : "Water Tax Revision - Ward 15",
      description:
        language === "hi"
          ? "जल कर में 2% वृद्धि का प्रस्ताव। 20 जनवरी 2024 को सार्वजनिक सुनवाई निर्धारित।"
          : language === "ta"
            ? "நீர் வரியில் 2% அதிகரிப்பு முன்மொழிவு। ஜனவரி 20, 2024 அன்று பொது விசாரணை நிர்ணயிக்கப்பட்டுள்ளது।"
            : "Proposed 2% increase in water tax. Public hearing scheduled for January 20th, 2024.",
      category: "Municipal",
      priority: "high",
      date: "2024-01-15",
      location: location?.city || "Mumbai",
      actionRequired: true,
      deadline: "2024-01-20",
    },
    {
      id: 2,
      title:
        language === "hi"
          ? "नए यातायात नियम लागू"
          : language === "ta"
            ? "புதிய போக்குவரத்து விதிகள் அமல்"
            : "New Traffic Rules Implementation",
      description:
        language === "hi"
          ? "दोपहिया वाहनों के लिए अद्यतन यातायात नियम 1 फरवरी 2024 से प्रभावी।"
          : language === "ta"
            ? "இருசக்கர வாகனங்களுக்கான புதுப்பிக்கப்பட்ட போக்குவரத்து விதிகள் பிப்ரவரி 1, 2024 முதல் நடைமுறைக்கு வரும்।"
            : "Updated traffic regulations for two-wheelers effective February 1st, 2024.",
      category: "Transport",
      priority: "medium",
      date: "2024-01-10",
      location: location?.city || "Delhi",
      actionRequired: false,
      deadline: null,
    },
    {
      id: 3,
      title:
        language === "hi"
          ? "सार्वजनिक पार्क विकास योजना"
          : language === "ta"
            ? "பொது பூங்கா மேம்பாட்டு திட்டம்"
            : "Public Park Development Plan",
      description:
        language === "hi"
          ? "सेक्टर 21 में नए पार्क विकास के लिए सामुदायिक परामर्श।"
          : language === "ta"
            ? "செக்டர் 21 இல் புதிய பூங்கா மேம்பாட்டிற்கான சமூக ஆலோசனை।"
            : "Community consultation for new park development in Sector 21.",
      category: "Development",
      priority: "medium",
      date: "2024-01-12",
      location: location?.city || "Bangalore",
      actionRequired: true,
      deadline: "2024-01-25",
    },
  ]

  const recentActivity = [
    {
      id: 1,
      action:
        language === "hi"
          ? "RTI आवेदन जेनरेट किया"
          : language === "ta"
            ? "RTI விண்ணப்பம் உருவாக்கப்பட்டது"
            : "Generated RTI Application",
      description:
        language === "hi"
          ? "स्थानीय जल आपूर्ति के बारे में जानकारी अनुरोध"
          : language === "ta"
            ? "உள்ளூர் நீர் வழங்கல் பற்றிய தகவல் கோரிக்கை"
            : "Information request about local water supply",
      date: "2024-01-15",
      status: "completed",
    },
    {
      id: 2,
      action:
        language === "hi"
          ? "कानूनी प्रश्न: किरायेदार अधिकार"
          : language === "ta"
            ? "சட்ட கேள்வி: குத்தகைதாரர் உரிமைகள்"
            : "Legal Query: Tenant Rights",
      description:
        language === "hi"
          ? "सिक्योरिटी डिपॉजिट वापसी के बारे में पूछा"
          : language === "ta"
            ? "பாதுகாப்பு வைப்பு திரும்ப பற்றி கேட்டார்"
            : "Asked about security deposit return",
      date: "2024-01-14",
      status: "resolved",
    },
    {
      id: 3,
      action:
        language === "hi"
          ? "नागरिक अलर्ट प्रतिक्रिया"
          : language === "ta"
            ? "குடிமக்கள் எச்சரிக்கை பதில்"
            : "Civic Alert Response",
      description:
        language === "hi"
          ? "जल कर सुनवाई के लिए पंजीकृत"
          : language === "ta"
            ? "நீர் வரி விசாரணைக்கு பதிவு செய்யப்பட்டது"
            : "Registered for water tax hearing",
      date: "2024-01-13",
      status: "pending",
    },
  ]

  const quickActions = [
    {
      title:
        language === "hi"
          ? "RTI आवेदन दाखिल करें"
          : language === "ta"
            ? "RTI விண்ணப்பம் தாக்கல் செய்யுங்கள்"
            : "File RTI Application",
      description:
        language === "hi"
          ? "सरकार से जानकारी का अनुरोध करें"
          : language === "ta"
            ? "அரசாங்கத்திடம் தகவல் கோருங்கள்"
            : "Request information from government",
      icon: <FileText className="h-6 w-6" />,
      href: "/documents/rti",
      color: "bg-blue-500",
    },
    {
      title: language === "hi" ? "कानूनी अधिकार सहायता" : language === "ta" ? "சட்ட உரிமைகள் உதவி" : "Legal Rights Help",
      description:
        language === "hi"
          ? "अपने अधिकारों पर मार्गदर्शन प्राप्त करें"
          : language === "ta"
            ? "உங்கள் உரிமைகள் குறித்த வழிகாட்டுதலைப் பெறுங்கள்"
            : "Get guidance on your rights",
      icon: <Users className="h-6 w-6" />,
      href: "/legal",
      color: "bg-green-500",
    },
    {
      title: language === "hi" ? "वॉइस असिस्टेंट" : language === "ta" ? "குரல் உதவியாளர்" : "Voice Assistant",
      description:
        language === "hi"
          ? "आवाज का उपयोग करके प्रश्न पूछें"
          : language === "ta"
            ? "குரலைப் பயன்படுத்தி கேள்விகள் கேளுங்கள்"
            : "Ask questions using voice",
      icon: <Mic className="h-6 w-6" />,
      href: "/voice",
      color: "bg-purple-500",
    },
    {
      title: language === "hi" ? "शिकायत पत्र" : language === "ta" ? "புகார் கடிதம்" : "Complaint Letter",
      description:
        language === "hi"
          ? "औपचारिक शिकायतें जेनरेट करें"
          : language === "ta"
            ? "முறையான புகார்களை உருவாக்குங்கள்"
            : "Generate formal complaints",
      icon: <FileText className="h-6 w-6" />,
      href: "/documents/complaint",
      color: "bg-orange-500",
    },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800"
      case "medium":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800"
      case "low":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800"
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const handleVoiceTranscription = (text: string) => {
    console.log("Voice input:", text)
    // Handle voice commands here
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {language === "hi"
              ? `नमस्ते, ${userProfile?.displayName || "उपयोगकर्ता"}! 👋`
              : language === "ta"
                ? `வணக்கம், ${userProfile?.displayName || "பயனர்"}! 👋`
                : `Welcome back, ${userProfile?.displayName || "User"}! 👋`}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {language === "hi"
              ? "अपने क्षेत्र में नागरिक मामलों और कानूनी अधिकारों के साथ अपडेट रहें।"
              : language === "ta"
                ? "உங்கள் பகுதியில் குடிமக்கள் விவகாரங்கள் மற்றும் சட்ட உரிமைகளுடன் புதுப்பித்த நிலையில் இருங்கள்।"
                : "Stay updated with civic matters and legal rights in your area."}
          </p>
          {location && (
            <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
              <MapPin className="h-4 w-4 mr-1" />
              <span>
                {location.city}, {location.state}
              </span>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {language === "hi" ? "सक्रिय अलर्ट" : language === "ta" ? "செயலில் எச்சரிக்கைகள்" : "Active Alerts"}
                  </p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">3</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {language === "hi" ? "दस्तावेज़" : language === "ta" ? "ஆவணங்கள்" : "Documents"}
                  </p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">12</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {language === "hi" ? "प्रश्न" : language === "ta" ? "கேள்விகள்" : "Queries"}
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">28</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {language === "hi" ? "कार्रवाई" : language === "ta" ? "செயல்கள்" : "Actions"}
                  </p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">7</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {language === "hi" ? "त्वरित कार्रवाई" : language === "ta" ? "விரைவு செயல்கள்" : "Quick Actions"}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link href={action.href}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardContent className="p-4">
                      <div className={`${action.color} rounded-lg p-3 w-fit mb-3`}>
                        <div className="text-white">{action.icon}</div>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{action.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Civic Alerts */}
          <div className="lg:col-span-2">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-gray-900 dark:text-white">
                    <Bell className="h-5 w-5 mr-2 text-orange-600 dark:text-orange-400" />
                    {language === "hi" ? "नागरिक अलर्ट" : language === "ta" ? "குடிமக்கள் எச்சரிக்கைகள்" : "Civic Alerts"}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-32 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <SelectItem value="all">
                          {language === "hi" ? "सभी" : language === "ta" ? "அனைத்தும்" : "All"}
                        </SelectItem>
                        <SelectItem value="municipal">
                          {language === "hi" ? "नगरपालिका" : language === "ta" ? "நகராட்சி" : "Municipal"}
                        </SelectItem>
                        <SelectItem value="transport">
                          {language === "hi" ? "परिवहन" : language === "ta" ? "போக்குவரத்து" : "Transport"}
                        </SelectItem>
                        <SelectItem value="development">
                          {language === "hi" ? "विकास" : language === "ta" ? "மேம்பாடு" : "Development"}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  {language === "hi"
                    ? "स्थानीय सरकारी निर्णयों और सार्वजनिक बैठकों के बारे में सूचित रहें"
                    : language === "ta"
                      ? "உள்ளூர் அரசு முடிவுகள் மற்றும் பொது கூட்டங்கள் பற்றி அறிந்திருங்கள்"
                      : "Stay informed about local government decisions and public meetings"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {civicAlerts.map((alert) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-50 dark:bg-gray-700/50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{alert.title}</h3>
                        <Badge className={getPriorityColor(alert.priority)}>
                          {language === "hi"
                            ? alert.priority === "high"
                              ? "उच्च"
                              : alert.priority === "medium"
                                ? "मध्यम"
                                : "कम"
                            : language === "ta"
                              ? alert.priority === "high"
                                ? "உயர்"
                                : alert.priority === "medium"
                                  ? "நடுத்தர"
                                  : "குறைந்த"
                              : alert.priority}
                        </Badge>
                      </div>

                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{alert.description}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {alert.date}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {alert.location}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          {alert.actionRequired && (
                            <Badge variant="destructive" className="text-xs">
                              {language === "hi"
                                ? "कार्रवाई आवश्यक"
                                : language === "ta"
                                  ? "நடவடிக்கை தேவை"
                                  : "Action Required"}
                            </Badge>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-transparent border-gray-300 dark:border-gray-600"
                          >
                            {language === "hi" ? "विवरण देखें" : language === "ta" ? "விவரங்களைப் பார்க்கவும்" : "View Details"}
                            <ChevronRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Voice Assistant */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center">
                  <Mic className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                  {language === "hi" ? "वॉइस असिस्टेंट" : language === "ta" ? "குரல் உதவியாளர்" : "Voice Assistant"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VoiceRecorder
                  onTranscription={handleVoiceTranscription}
                  language={language === "en" ? "en-IN" : `${language}-IN`}
                  className="border-0 shadow-none p-0"
                />
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-white">
                  {language === "hi" ? "हाल की गतिविधि" : language === "ta" ? "சமீபத்திய செயல்பாடு" : "Recent Activity"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      {getStatusIcon(activity.status)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{activity.description}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{activity.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-white">
                  {language === "hi"
                    ? "आगामी समय सीमा"
                    : language === "ta"
                      ? "வரவிருக்கும் காலக்கெடு"
                      : "Upcoming Deadlines"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div>
                      <p className="text-sm font-medium text-red-900 dark:text-red-200">
                        {language === "hi" ? "जल कर सुनवाई" : language === "ta" ? "நீர் வரி விசாரணை" : "Water Tax Hearing"}
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400">Jan 20, 2024</p>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      {language === "hi" ? "2 दिन" : language === "ta" ? "2 நாட்கள்" : "2 days"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div>
                      <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
                        {language === "hi" ? "पार्क परामर्श" : language === "ta" ? "பூங்கா ஆலோசனை" : "Park Consultation"}
                      </p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400">Jan 25, 2024</p>
                    </div>
                    <Badge className="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 text-xs">
                      {language === "hi" ? "7 दिन" : language === "ta" ? "7 நாட்கள்" : "7 days"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help & Support */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-white">
                  {language === "hi" ? "सहायता चाहिए?" : language === "ta" ? "உதவி தேவையா?" : "Need Help?"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent border-gray-300 dark:border-gray-600"
                    asChild
                  >
                    <Link href="/legal">
                      <Users className="h-4 w-4 mr-2" />
                      {language === "hi" ? "कानूनी सहायक" : language === "ta" ? "சட்ட உதவியாளர்" : "Legal Assistant"}
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent border-gray-300 dark:border-gray-600"
                    asChild
                  >
                    <Link href="/voice">
                      <Mic className="h-4 w-4 mr-2" />
                      {language === "hi" ? "वॉइस सहायता" : language === "ta" ? "குரல் உதவி" : "Voice Help"}
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent border-gray-300 dark:border-gray-600"
                    asChild
                  >
                    <Link href="/help">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {language === "hi" ? "सहायता केंद्र" : language === "ta" ? "உதவி மையம்" : "Help Center"}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
