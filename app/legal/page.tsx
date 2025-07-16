"use client"

import { useState, useEffect } from "react"
import {
  Scale,
  MessageCircle,
  FileText,
  Mic,
  Send,
  Bot,
  User,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { Navigation } from "@/components/layout/Navigation"
import { VoiceRecorder } from "@/components/voice/VoiceRecorder"
import { redirect } from "next/navigation"
import { Loader2 } from "lucide-react" // Import Loader2

export default function LegalAssistant() {
  const { user, loading: authLoading } = useAuth()
  const { t, language } = useLanguage()

  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: "bot",
      message:
        language === "hi"
          ? "नमस्ते! मैं आपका कानूनी सहायक हूं। मैं आपको अपने अधिकारों को समझने और कानूनी मामलों पर मार्गदर्शन प्रदान करने में मदद कर सकता हूं। आप क्या जानना चाहते हैं?"
          : language === "ta"
            ? "வணக்கம்! நான் உங்கள் சட்ட உதவியாளர். உங்கள் உரிமைகளைப் புரிந்துகொள்ளவும் சட்ட விவகாரங்களில் வழிகாட்டுதல் வழங்கவும் நான் உங்களுக்கு உதவ முடியும். நீங்கள் என்ன தெரிந்து கொள்ள விரும்புகிறீர்கள்?"
            : "Hello! I'm your legal assistant. I can help you understand your rights and provide guidance on legal matters. What would you like to know?",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [selectedScenario, setSelectedScenario] = useState("")
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t("common.loading")}</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const legalScenarios = [
    {
      id: "tenant-rights",
      title:
        language === "hi"
          ? "किरायेदार अधिकार और मकान मालिक के मुद्दे"
          : language === "ta"
            ? "குத்தகைதாரர் உரிமைகள் & வீட்டு உரிமையாளர் பிரச்சினைகள்"
            : "Tenant Rights & Landlord Issues",
      description:
        language === "hi"
          ? "सिक्योरिटी डिपॉजिट, बेदखली नोटिस, किराया विवाद"
          : language === "ta"
            ? "பாதுகாப்பு வைப்பு, வெளியேற்ற அறிவிப்பு, வாடகை தகராறுகள்"
            : "Security deposit, eviction notice, rent disputes",
      icon: "🏠",
      commonIssues: [
        language === "hi"
          ? "मकान मालिक सिक्योरिटी डिपॉजिट वापस नहीं कर रहा"
          : language === "ta"
            ? "வீட்டு உரிமையாளர் பாதுகாப்பு வைப்பு திருப்பித் தரவில்லை"
            : "Landlord not returning security deposit",
        language === "hi"
          ? "उचित नोटिस के बिना बेदखली"
          : language === "ta"
            ? "சரியான அறிவிப்பு இல்லாமல் வெளியேற்றம்"
            : "Eviction without proper notice",
        language === "hi"
          ? "मनमाना किराया वृद्धि"
          : language === "ta"
            ? "தன்னிச்சையான வாடகை அதிகரிப்பு"
            : "Arbitrary rent increase",
        language === "hi"
          ? "संपत्ति रखरखाव के मुद्दे"
          : language === "ta"
            ? "சொத்து பராமரிப்பு பிரச்சினைகள்"
            : "Property maintenance issues",
      ],
    },
    {
      id: "consumer-rights",
      title: language === "hi" ? "उपभोक्ता संरक्षण" : language === "ta" ? "நுகர்வோர் பாதுகாப்பு" : "Consumer Protection",
      description:
        language === "hi"
          ? "दोषपूर्ण उत्पाद, सेवा शिकायतें, रिफंड"
          : language === "ta"
            ? "குறைபாடுள்ள தயாரிப்புகள், சேவை புகார்கள், பணத்தைத் திரும்பப் பெறுதல்"
            : "Defective products, service complaints, refunds",
      icon: "🛒",
      commonIssues: [
        language === "hi"
          ? "खरीदा गया दोषपूर्ण उत्पाद"
          : language === "ta"
            ? "வாங்கிய குறைபாடுள்ள தயாரிப்பு"
            : "Defective product purchased",
        language === "hi" ? "सेवा प्रदाता धोखाधड़ी" : language === "ta" ? "சேவை வழங்குநர் மோசடி" : "Service provider fraud",
        language === "hi"
          ? "ऑनलाइन शॉपिंग विवाद"
          : language === "ta"
            ? "ஆன்லைன் ஷாப்பிங் தகராறுகள்"
            : "Online shopping disputes",
        language === "hi"
          ? "बीमा दावा अस्वीकृति"
          : language === "ta"
            ? "காப்பீட்டு கோரிக்கை நிராகரிப்பு"
            : "Insurance claim rejection",
      ],
    },
    {
      id: "workplace-rights",
      title:
        language === "hi"
          ? "कार्यक्षेत्र और श्रम अधिकार"
          : language === "ta"
            ? "பணியிடம் & தொழிலாளர் உரிமைகள்"
            : "Workplace & Labor Rights",
      description:
        language === "hi"
          ? "वेतन विवाद, उत्पीड़न, गलत तरीके से बर्खास्तगी"
          : language === "ta"
            ? "சம்பள தகராறுகள், துன்புறுத்தல், தவறான பணிநீக்கம்"
            : "Salary disputes, harassment, wrongful termination",
      icon: "💼",
      commonIssues: [
        language === "hi"
          ? "समय पर वेतन नहीं मिला"
          : language === "ta"
            ? "சரியான நேரத்தில் சம்பளம் கிடைக்கவில்லை"
            : "Salary not paid on time",
        language === "hi" ? "कार्यक्षेत्र में उत्पीड़न" : language === "ta" ? "பணியிடத்தில் துன்புறுத்தல்" : "Workplace harassment",
        language === "hi" ? "गलत तरीके से बर्खास्तगी" : language === "ta" ? "தவறான பணிநீக்கம்" : "Wrongful termination",
        language === "hi" ? "ओवरटाइम मुआवजा" : language === "ta" ? "கூடுதல் நேர இழப்பீடு" : "Overtime compensation",
      ],
    },
    {
      id: "traffic-legal",
      title:
        language === "hi"
          ? "यातायात और वाहन के मुद्दे"
          : language === "ta"
            ? "போக்குவரத்து & வாகன பிரச்சினைகள்"
            : "Traffic & Vehicle Issues",
      description:
        language === "hi"
          ? "चालान विवाद, दुर्घटना दावे, लाइसेंस के मுद्दे"
          : language === "ta"
            ? "அபராத தகராறுகள், விபத்து கோரிக்கைகள், உரிமம் பிரச்சினைகள்"
            : "Challan disputes, accident claims, license issues",
      icon: "🚗",
      commonIssues: [
        language === "hi"
          ? "अनुचित यातायात चालान"
          : language === "ta"
            ? "நியாயமற்ற போக்குவரத்து அபராதம்"
            : "Unfair traffic challan",
        language === "hi"
          ? "दुर्घटना बीमा दावा"
          : language === "ta"
            ? "விபத்து காப்பீட்டு கோரிக்கை"
            : "Accident insurance claim",
        language === "hi" ? "लाइसेंस निलंबन" : language === "ta" ? "உரிமம் இடைநிறுத்தம்" : "License suspension",
        language === "hi"
          ? "वाहन पंजीकरण के मுद्दे"
          : language === "ta"
            ? "வாகன பதிவு பிரச்சினைகள்"
            : "Vehicle registration issues",
      ],
    },
  ]

  const recentQueries = [
    {
      id: 1,
      query:
        language === "hi"
          ? "मेरा मकान मालिक मुझसे उचित नोटिस के बिना खाली करने को कह रहा है"
          : language === "ta"
            ? "எனது வீட்டு உரிமையாளர் சரியான அறிவிப்பு இல்லாமல் காலி செய்யச் சொல்கிறார்"
            : "My landlord is asking me to vacate without proper notice",
      status: "resolved",
      date: "2024-01-15",
      category: language === "hi" ? "किरायेदार अधिकार" : language === "ta" ? "குத்தகைதாரர் உரிமைகள்" : "Tenant Rights",
    },
    {
      id: 2,
      query:
        language === "hi"
          ? "क्या मैं दोषपूर्ण मोबाइल फोन के खिलाफ शिकायत दर्ज कर सकता हूं?"
          : language === "ta"
            ? "குறைபாடுள்ள மொபைல் போனுக்கு எதிராக புகார் அளிக்க முடியுமா?"
            : "Can I file a complaint against defective mobile phone?",
      status: "in-progress",
      date: "2024-01-14",
      category: language === "hi" ? "उपभोक्ता अधिकार" : language === "ta" ? "நுகர்வோர் உரிமைகள்" : "Consumer Rights",
    },
    {
      id: 3,
      query:
        language === "hi"
          ? "मेरा नियोक्ता ओवरटाइम मुआवजा नहीं दे रहा"
          : language === "ta"
            ? "எனது முதலாளி கூடுதல் நேர இழப்பீடு தரவில்லை"
            : "My employer is not paying overtime compensation",
      status: "pending",
      date: "2024-01-13",
      category: language === "hi" ? "श्रम अधिकार" : language === "ta" ? "தொழிலாளர் உரிமைகள்" : "Labor Rights",
    },
  ]

  const legalResources = [
    {
      title:
        language === "hi"
          ? "उपभोक्ता न्यायालय स्थान"
          : language === "ta"
            ? "நுகர்வோர் நீதிமன்ற இடங்கள்"
            : "Consumer Court Locations",
      description:
        language === "hi"
          ? "अपने शहर में निकटतम उपभोक्ता न्यायालय खोजें"
          : language === "ta"
            ? "உங்கள் நகரத்தில் அருகிலுள்ள நுகர்வோர் நீதிமன்றத்தைக் கண்டறியுங்கள்"
            : "Find nearest consumer court in your city",
      link: "/resources/consumer-courts",
    },
    {
      title: language === "hi" ? "कानूनी सहायता क्लिनिक" : language === "ta" ? "சட்ட உதவி மையங்கள்" : "Legal Aid Clinics",
      description:
        language === "hi"
          ? "कम आय वाले नागरिकों के लिए मुफ्त कानूनी सहायता"
          : language === "ta"
            ? "குறைந்த வருமானம் உள்ள குடிமக்களுக்கு இலவச சட்ட உதவி"
            : "Free legal assistance for low-income citizens",
      link: "/resources/legal-aid",
    },
    {
      title: language === "hi" ? "RTI जानकारी" : language === "ta" ? "RTI தகவல்" : "RTI Information",
      description:
        language === "hi"
          ? "सूचना का अधिकार अनुरोध कैसे दाखिल करें"
          : language === "ta"
            ? "தகவல் அறியும் உரிமை கோரிக்கைகளை எவ்வாறு தாக்கல் செய்வது"
            : "How to file Right to Information requests",
      link: "/resources/rti-guide",
    },
    {
      title:
        language === "hi"
          ? "पुलिस शिकायत प्रक्रिया"
          : language === "ta"
            ? "காவல்துறை புகார் செயல்முறை"
            : "Police Complaint Process",
      description:
        language === "hi"
          ? "पुलिस शिकायत दर्ज करने के लिए चरण-दर-चरण गाइड"
          : language === "ta"
            ? "காவல்துறை புகார் அளிப்பதற்கான படிப்படியான வழிகாட்டி"
            : "Step-by-step guide to file police complaints",
      link: "/resources/police-complaint",
    },
  ]

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const newMessage = {
      id: chatMessages.length + 1,
      type: "user" as const,
      message: inputMessage,
      timestamp: new Date(),
    }

    setChatMessages([...chatMessages, newMessage])
    setInputMessage("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: chatMessages.length + 2,
        type: "bot" as const,
        message: generateAIResponse(inputMessage),
        timestamp: new Date(),
      }
      setChatMessages((prev) => [...prev, aiResponse])
      setIsLoading(false)
    }, 2000)
  }

  const generateAIResponse = (query: string) => {
    const lowerQuery = query.toLowerCase()

    if (
      lowerQuery.includes("tenant") ||
      lowerQuery.includes("landlord") ||
      lowerQuery.includes("rent") ||
      lowerQuery.includes("किरायेदार") ||
      lowerQuery.includes("मकान मालिक") ||
      lowerQuery.includes("किराया") ||
      lowerQuery.includes("குத்தகைதாரர்") ||
      lowerQuery.includes("வீட்டு உரிமையாளர்") ||
      lowerQuery.includes("வாடகை")
    ) {
      if (language === "hi") {
        return `आपके किरायेदार संबंधी प्रश्न के आधार पर, यहां आपके मुख्य अधिकार हैं:

1. **सिक्योरिटी डिपॉजिट**: मकान मालिक को लीज समाप्ति के 30 दिन के भीतर जमा राशि वापस करनी होगी
2. **बेदखली नोटिस**: बेदखली के लिए न्यूनतम 30 दिन का लिखित नोटिस आवश्यक है
3. **किराया नियंत्रण**: मनमाने किराया वृद्धि से सुरक्षा

**तत्काल कार्रवाई:**
- अपने मकान मालिक के साथ सभी संचार का दस्तावेजीकरण करें
- अपने लीज समझौते की शर्तों की जांच करें
- कानूनी नोटिस भेजने पर विचार करें

क्या आप चाहते हैं कि मैं आपके लिए एक कानूनी नोटिस तैयार करूं या आपको आपके क्षेत्र में किरायेदार अधिकार संगठनों से जोड़ूं?`
      } else if (language === "ta") {
        return `உங்கள் குத்தகைதாரர் தொடர்பான கேள்விக்கு அடிப்படையில், இங்கே உங்கள் முக்கிய உரிமைகள்:

1. **பாதுகாப்பு வைப்பு**: வீட்டு உரிமையாளர்கள் குத்தகை முடிவுக்கு 30 நாட்களுக்குள் வைப்புத்தொகையை திருப்பித் தர வேண்டும்
2. **வெளியேற்ற அறிவிப்பு**: குறைந்தது 30 நாட்கள் எழுத்துப்பூர்வ அறிவிப்பு தேவை
3. **வாடகை கட்டுப்பாடு**: தன்னிச்சையான வாடகை அதிகரிப்புகளிலிருந்து பாதுகாப்பு

**உடனடி நடவடிக்கைகள்:**
- உங்கள் வீட்டு உரிமையாளருடனான அனைத்து தொடர்புகளையும் ஆவணப்படுத்துங்கள்
- உங்கள் குத்தகை ஒப்பந்த விதிமுறைகளைச் சரிபார்க்கவும்
- சட்ட அறிவிப்பு அனுப்புவதைக் கருத்தில் கொள்ளுங்கள்

நான் உங்களுக்கு ஒரு சட்ட அறிவிப்பை உருவாக்க உதவ வேண்டுமா அல்லது உங்கள் பகுதியில் உள்ள குத்தகைதாரர் உரிமைகள் அமைப்புகளுடன் உங்களை இணைக்க வேண்டுமா?`
      } else {
        return `Based on your tenant-related query, here are your key rights:

1. **Security Deposit**: Landlords must return deposits within 30 days of lease termination
2. **Eviction Notice**: Minimum 30 days written notice required for eviction
3. **Rent Control**: Protection against arbitrary rent increases

**Immediate Actions:**
- Document all communications with your landlord
- Check your lease agreement terms
- Consider sending a legal notice

Would you like me to help you generate a legal notice or connect you with tenant rights organizations in your area?`
      }
    }

    if (
      lowerQuery.includes("consumer") ||
      lowerQuery.includes("product") ||
      lowerQuery.includes("defective") ||
      lowerQuery.includes("उपभोक्ता") ||
      lowerQuery.includes("उत्पाद") ||
      lowerQuery.includes("दोषपूर्ण") ||
      lowerQuery.includes("நுகர்வோர்") ||
      lowerQuery.includes("தயாரிப்பு") ||
      lowerQuery.includes("குறைபாடுள்ள")
    ) {
      if (language === "hi") {
        return `उपभोक्ता संरक्षण मुद्दों के लिए, आपके पास उपभोक्ता संरक्षण अधिनियम 2019 के तहत कई अधिकार हैं:

1. **सुरक्षा का अधिकार**: खतरनाक सामानों से सुरक्षा
2. **जानकारी का अधिकार**: पूर्ण उत्पाद/सेवा विवरण
3. **निवारण का अधिकार**: दोषपूर्ण उत्पादों/सेवाओं के लिए मुआवजा

**उठाए जाने वाले कदम:**
- पहले विक्रेता/निर्माता से संपर्क करें
- जिला उपभोक्ता फोरम में शिकायत दर्ज करें
- सभी खरीद रसीदें और सबूत इकट्ठा करें

शिकायत राष्ट्रीय उपभोक्ता हेल्पलाइन के माध्यम से ऑनलाइन दर्ज की जा सकती है। क्या आप उபभोक्ता शिकायत का मसौदा तैयार करने में मदद चाहते हैं?`
      } else if (language === "ta") {
        return `நுகர்வோர் பாதுகாப்பு சிக்கல்களுக்கு, நுகர்வோர் பாதுகாப்பு சட்டம் 2019 இன் கீழ் உங்களுக்கு பல உரிமைகள் உள்ளன:

1. **பாதுகாப்பு உரிமை**: ஆபத்தான பொருட்களிலிருந்து பாதுகாப்பு
2. **தகவல் உரிமை**: முழுமையான தயாரிப்பு/சேவை விவரங்கள்
3. **நிவாரண உரிமை**: குறைபாடுள்ள தயாரிப்புகள்/சேவைகளுக்கு இழப்பீடு

**எடுக்க வேண்டிய படிகள்:**
- முதலில் விற்பனையாளர்/உற்பத்தியாளரைத் தொடர்பு கொள்ளுங்கள்
- மாவட்ட நுகர்வோர் மன்றத்தில் புகார் தாக்கல் செய்யுங்கள்
- அனைத்து கொள்முதல் ரசீதுகள் மற்றும் ஆதாரங்களை சேகரிக்கவும்

தேசிய நுகர்வோர் உதவி மையத்தின் மூலம் ஆன்லைனில் புகார் தாக்கல் செய்யலாம். நுகர்வோர் புகார் தயாரிக்க உங்களுக்கு உதவி வேண்டுமா?`
      } else {
        return `For consumer protection issues, you have several rights under the Consumer Protection Act 2019:

1. **Right to Safety**: Protection against hazardous goods
2. **Right to Information**: Complete product/service details
3. **Right to Redressal**: Compensation for defective products/services

**Steps to take:**
- Contact the seller/manufacturer first
- File complaint with District Consumer Forum
- Gather all purchase receipts and evidence

The complaint can be filed online through the National Consumer Helpline. Would you like help drafting a consumer complaint?`
      }
    }

    return language === "hi"
      ? `मैं आपकी चिंता को समझता हूं: "${query}"। यह एक महत्वपूर्ण कानूनी मामला है जिसके लिए उचित मार्गदर्शन की आवश्यकता है।

मैं आपकी मदद कर सकता हूं:
1. आपकी स्थिति के लिए लागू कानूनों का विश्लेषण करना
2. आपके द्वारा उठाए जा सकने वाले तत्काल कदमों का सुझाव देना
3. किसी भी आवश्यक दस्तावेज के लिए टेम्पलेट प्रदान करना
4. आपको संबंधित कानूनी संसाधनों से जोड़ना

क्या आप अपनी स्थिति के बारे में अधिक विशिष्ट विवरங்கள் प्रदान कर सकते हैं ताकि मैं आपको अधिक लक्षित सलाह दे सकूं?`
      : language === "ta"
        ? `உங்கள் கவலையை நான் புரிந்துகொள்கிறேன்: "${query}". இது ஒரு முக்கியமான சட்ட விவகாரம், இதற்கு சரியான வழிகாட்டுதல் தேவை.

நான் உங்களுக்கு உதவ முடியும்:
1. உங்கள் சூழ்நிலைக்கு பொருந்தக்கூடிய சட்டங்களை பகுப்பாய்வு செய்தல்
2. நீங்கள் எடுக்கக்கூடிய உடனடி நடவடிக்கைகளை பரிந்துரைத்தல்
3. தேவையான எந்த ஆவணங்களுக்கும் டெம்ப்ளேட்களை வழங்குதல்
4. தொடர்புடைய சட்ட ஆதாரங்களுடன் உங்களை இணைத்தல்

நான் உங்களுக்கு மேலும் இலக்கு வைக்கப்பட்ட ஆலோசனைகளை வழங்க உங்கள் சூழ்நிலை பற்றி மேலும் குறிப்பிட்ட விவரங்களை வழங்க முடியுமா?`
        : `I understand your concern about: "${query}". This is an important legal matter that requires proper guidance.

Let me help you by:
1. Analyzing the applicable laws for your situation
2. Suggesting immediate steps you can take
3. Providing templates for any required documents
4. Connecting you with relevant legal resources

Could you provide more specific details about your situation so I can give you more targeted advice?`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-200"
      case "in-progress":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-200"
      case "pending":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-200"
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="h-4 w-4" />
      case "in-progress":
        return <Clock className="h-4 w-4" />
      case "pending":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const handleVoiceTranscription = (text: string) => {
    setInputMessage(text)
    // Optionally trigger send message automatically
    // handleSendMessage()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="chat" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <TabsTrigger
                  value="chat"
                  className="data-[state=active]:bg-green-500 data-[state=active]:text-white dark:data-[state=active]:bg-green-700"
                >
                  {language === "hi" ? "AI चैट" : language === "ta" ? "AI அரட்டை" : "AI Chat"}
                </TabsTrigger>
                <TabsTrigger
                  value="scenarios"
                  className="data-[state=active]:bg-green-500 data-[state=active]:text-white dark:data-[state=active]:bg-green-700"
                >
                  {language === "hi" ? "कानूनी परिदृश्य" : language === "ta" ? "சட்ட சூழ்நிலைகள்" : "Legal Scenarios"}
                </TabsTrigger>
                <TabsTrigger
                  value="resources"
                  className="data-[state=active]:bg-green-500 data-[state=active]:text-white dark:data-[state=active]:bg-green-700"
                >
                  {language === "hi" ? "संसाधन" : language === "ta" ? "வளங்கள்" : "Resources"}
                </TabsTrigger>
              </TabsList>

              {/* AI Chat Tab */}
              <TabsContent value="chat">
                <Card className="h-[600px] flex flex-col bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center text-gray-900 dark:text-white">
                      <MessageCircle className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                      {language === "hi"
                        ? "कानूनी AI सहायक"
                        : language === "ta"
                          ? "சட்ட AI உதவியாளர்"
                          : "Legal AI Assistant"}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      {language === "hi"
                        ? "किसी भी कानूनी प्रश्न को सरल भाषा में पूछें। मैं आपको अपने अधिकारों और अगले कदमों को समझने में मदद करूंगा।"
                        : language === "ta"
                          ? "எந்தவொரு சட்ட கேள்வியையும் எளிய மொழியில் கேளுங்கள். உங்கள் உரிமைகளையும் அடுத்த படிகளையும் புரிந்துகொள்ள நான் உங்களுக்கு உதவுவேன்."
                          : "Ask any legal question in simple language. I'll help you understand your rights and next steps."}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col">
                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                      {chatMessages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`flex items-start space-x-2 max-w-[80%] ${
                              message.type === "user" ? "flex-row-reverse space-x-reverse" : ""
                            }`}
                          >
                            <div
                              className={`p-2 rounded-full ${message.type === "user" ? "bg-blue-500" : "bg-green-500"}`}
                            >
                              {message.type === "user" ? (
                                <User className="h-4 w-4 text-white" />
                              ) : (
                                <Bot className="h-4 w-4 text-white" />
                              )}
                            </div>

                            <div
                              className={`p-3 rounded-lg ${
                                message.type === "user"
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                              }`}
                            >
                              <p className="text-sm whitespace-pre-line">{message.message}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  message.type === "user" ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                                }`}
                              >
                                {message.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="flex items-start space-x-2 max-w-[80%]">
                            <div className="p-2 rounded-full bg-green-500">
                              <Bot className="h-4 w-4 text-white" />
                            </div>
                            <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">
                              <div className="flex items-center">
                                <span className="animate-pulse">...</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Input Area */}
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <Textarea
                          placeholder={
                            language === "hi"
                              ? "अपने कानूनी अधिकारों, किरायेदार मुद्दों, उपभोक्ता शिकायतों के बारे में पूछें..."
                              : language === "ta"
                                ? "உங்கள் சட்ட உரிமைகள், குத்தகைதாரர் பிரச்சினைகள், நுகர்வோர் புகார்கள் பற்றி கேளுங்கள்..."
                                : "Ask about your legal rights, tenant issues, consumer complaints..."
                          }
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                          className="min-h-[40px] max-h-[120px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                        />
                      </div>
                      <Button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || isLoading}
                        className="bg-green-500 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-600"
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setIsVoiceActive(!isVoiceActive)}
                        className={`bg-transparent border-gray-300 dark:border-gray-600 ${isVoiceActive ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300" : ""}`}
                      >
                        <Mic className="h-4 w-4" />
                      </Button>
                    </div>
                    {isVoiceActive && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4"
                      >
                        <VoiceRecorder
                          onTranscription={handleVoiceTranscription}
                          language={language === "en" ? "en-IN" : `${language}-IN`}
                          className="border-0 shadow-none p-0"
                        />
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Legal Scenarios Tab */}
              <TabsContent value="scenarios">
                <div className="grid md:grid-cols-2 gap-6">
                  {legalScenarios.map((scenario) => (
                    <motion.div key={scenario.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                      <Card className="h-full hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <CardHeader>
                          <CardTitle className="flex items-center text-lg text-gray-900 dark:text-white">
                            <span className="text-2xl mr-3">{scenario.icon}</span>
                            {scenario.title}
                          </CardTitle>
                          <CardDescription className="text-gray-600 dark:text-gray-400">
                            {scenario.description}
                          </CardDescription>
                        </CardHeader>

                        <CardContent>
                          <div className="space-y-3">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {language === "hi"
                                ? "सामान्य मुद्दे:"
                                : language === "ta"
                                  ? "பொதுவான பிரச்சினைகள்:"
                                  : "Common Issues:"}
                            </h4>
                            <ul className="space-y-2">
                              {scenario.commonIssues.map((issue, index) => (
                                <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                  <ChevronRight className="h-3 w-3 mr-2 text-gray-400" />
                                  {issue}
                                </li>
                              ))}
                            </ul>

                            <Button
                              className="w-full mt-4 bg-green-500 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-600"
                              onClick={() => {
                                setInputMessage(scenario.commonIssues[0]) // Pre-fill with first common issue
                                setChatMessages((prev) => [
                                  ...prev,
                                  {
                                    id: prev.length + 1,
                                    type: "user",
                                    message: scenario.commonIssues[0],
                                    timestamp: new Date(),
                                  },
                                ])
                                setIsLoading(true)
                                setTimeout(() => {
                                  setChatMessages((prev) => [
                                    ...prev,
                                    {
                                      id: prev.length + 1,
                                      type: "bot",
                                      message: generateAIResponse(scenario.commonIssues[0]),
                                      timestamp: new Date(),
                                    },
                                  ])
                                  setIsLoading(false)
                                }, 2000)
                                // Switch to chat tab and add scenario context
                                document.querySelector('button[data-state="active"][value="chat"]')?.click()
                              }}
                            >
                              {language === "hi"
                                ? "इसमें सहायता प्राप्त करें"
                                : language === "ta"
                                  ? "இதில் உதவி பெறுங்கள்"
                                  : "Get Help with This"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              {/* Resources Tab */}
              <TabsContent value="resources">
                <div className="grid md:grid-cols-2 gap-6">
                  {legalResources.map((resource, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <CardContent className="p-6">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{resource.title}</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{resource.description}</p>
                          <Button
                            variant="outline"
                            className="w-full bg-transparent border-gray-300 dark:border-gray-600"
                            asChild
                          >
                            <Link href={resource.link}>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              {language === "hi" ? "और जानें" : language === "ta" ? "மேலும் அறிக" : "Learn More"}
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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
                  <Link href="/documents/rti">
                    <FileText className="h-4 w-4 mr-2" />
                    {language === "hi"
                      ? "RTI आवेदन दाखिल करें"
                      : language === "ta"
                        ? "RTI விண்ணப்பம் தாக்கல் செய்யுங்கள்"
                        : "File RTI Application"}
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent border-gray-300 dark:border-gray-600"
                  asChild
                >
                  <Link href="/documents/complaint">
                    <FileText className="h-4 w-4 mr-2" />
                    {language === "hi"
                      ? "शिकायत पत्र जेनरेट करें"
                      : language === "ta"
                        ? "புகார் கடிதம் உருவாக்கவும்"
                        : "Generate Complaint Letter"}
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent border-gray-300 dark:border-gray-600"
                  asChild
                >
                  <Link href="/documents/legal-notice">
                    <Scale className="h-4 w-4 mr-2" />
                    {language === "hi"
                      ? "कानूनी नोटिस का मसौदा तैयार करें"
                      : language === "ta"
                        ? "சட்ட அறிவிப்பைத் தயாரிக்கவும்"
                        : "Draft Legal Notice"}
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent border-gray-300 dark:border-gray-600"
                  asChild
                >
                  <Link href="/voice">
                    <Mic className="h-4 w-4 mr-2" />
                    {language === "hi" ? "वॉइस असिस्टेंट" : language === "ta" ? "குரல் உதவியாளர்" : "Voice Assistant"}
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Queries */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-white">
                  {language === "hi" ? "हाल के प्रश्न" : language === "ta" ? "சமீபத்திய கேள்விகள்" : "Recent Queries"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentQueries.map((query) => (
                    <div
                      key={query.id}
                      className={`border-l-4 ${query.status === "resolved" ? "border-green-500" : query.status === "in-progress" ? "border-blue-500" : "border-yellow-500"} pl-4`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Badge className={`text-xs ${getStatusColor(query.status)}`}>
                          {getStatusIcon(query.status)}
                          <span className="ml-1">
                            {language === "hi"
                              ? query.status === "resolved"
                                ? "हल किया गया"
                                : query.status === "in-progress"
                                  ? "प्रगति में"
                                  : "लंबित"
                              : language === "ta"
                                ? query.status === "resolved"
                                  ? "தீர்க்கப்பட்டது"
                                  : query.status === "in-progress"
                                    ? "செயல்பாட்டில் உள்ளது"
                                    : "நிலுவையில் உள்ளது"
                                : query.status}
                          </span>
                        </Badge>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{query.date}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{query.query}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{query.category}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-red-600 dark:text-red-400">
                  {language === "hi"
                    ? "आपातकालीन कानूनी सहायता"
                    : language === "ta"
                      ? "அவசர சட்ட உதவி"
                      : "Emergency Legal Help"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-900 dark:text-white">
                  <div>
                    <p className="font-medium">
                      {language === "hi"
                        ? "राष्ट्रीय कानूनी सेवा प्राधिकरण"
                        : language === "ta"
                          ? "தேசிய சட்ட சேவைகள் ஆணையம்"
                          : "National Legal Services Authority"}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">Toll Free: 15100</p>
                  </div>

                  <div>
                    <p className="font-medium">
                      {language === "hi" ? "महिला हेल्पलाइन" : language === "ta" ? "பெண்கள் உதவி எண்" : "Women Helpline"}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">24/7: 1091</p>
                  </div>

                  <div>
                    <p className="font-medium">
                      {language === "hi"
                        ? "उपभोक्ता हेल्पलाइन"
                        : language === "ta"
                          ? "நுகர்வோர் உதவி எண்"
                          : "Consumer Helpline"}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">Toll Free: 1915</p>
                  </div>

                  <div>
                    <p className="font-medium">
                      {language === "hi"
                        ? "साइबर क्राइम हेल्पलाइन"
                        : language === "ta"
                          ? "சைபர் கிரைம் உதவி எண்"
                          : "Cyber Crime Helpline"}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">24/7: 1930</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
