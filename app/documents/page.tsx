"use client"

import { useState, useEffect } from "react"
import { FileText, Plus, Download, Copy, CheckCircle, Gavel, BookOpen, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { Navigation } from "@/components/layout/Navigation"
import { redirect } from "next/navigation"

export default function DocumentGenerator() {
  const { user, userProfile, loading: authLoading } = useAuth()
  const { t, language } = useLanguage()

  const [docType, setDocType] = useState("RTI Application")
  const [formData, setFormData] = useState<any>({})
  const [generatedDoc, setGeneratedDoc] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      redirect("/")
    }
  }, [user, authLoading])

  useEffect(() => {
    // Pre-fill user data if available
    if (userProfile) {
      setFormData((prev: any) => ({
        ...prev,
        applicant_name: userProfile.displayName || "",
        applicant_address: userProfile.location || "",
        complainant_name: userProfile.displayName || "",
        complainant_address: userProfile.location || "",
        contact_details: userProfile.phone || userProfile.email || "",
      }))
    }
  }, [userProfile])

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

  const LEGAL_TEMPLATES: { [key: string]: { template: string; fields: string[] } } = {
    "RTI Application": {
      template: `To,
The Public Information Officer,
{department}
{address}

Subject: Application under Right to Information Act, 2005

Sir/Madam,

I, {applicant_name}, resident of {applicant_address}, would like to obtain the following information under the Right to Information Act, 2005:

{information_requested}

I am enclosing the application fee of Rs. 10/- as required under the Act.

Please provide the information within the stipulated time period of 30 days.

Thanking you,

{applicant_name}
Date: {date}
`,
      fields: ["department", "address", "applicant_name", "applicant_address", "information_requested", "date"],
    },
    "Complaint Letter": {
      template: `To,
{authority_name}
{authority_address}

Subject: Complaint regarding {complaint_subject}

Sir/Madam,

I am writing to bring to your attention the following issue:

{complaint_details}

This matter has been causing significant inconvenience and requires immediate attention. I request you to take necessary action to resolve this issue at the earliest.

I look forward to your prompt response and action.

Thanking you,

{complainant_name}
{complainant_address}
{contact_details}
Date: {date}
`,
      fields: [
        "authority_name",
        "authority_address",
        "complaint_subject",
        "complaint_details",
        "complainant_name",
        "complainant_address",
        "contact_details",
        "date",
      ],
    },
    "Legal Notice": {
      template: `LEGAL NOTICE

To,
{recipient_name}
{recipient_address}

Subject: Legal Notice under {applicable_law}

Sir/Madam,

I, {sender_name}, resident of {sender_address}, hereby serve you this legal notice for the following reasons:

{notice_content}

You are hereby called upon to {demanded_action} within {time_period} days from the receipt of this notice, failing which I shall be constrained to initiate appropriate legal proceedings against you at your risk as to costs and consequences.

Take notice that if you fail to comply with the above demand within the stipulated time, I shall be left with no alternative but to approach the competent court of law for appropriate relief and damages.

Yours faithfully,
{sender_name}

Date: {date}
Place: {place}
`,
      fields: [
        "recipient_name",
        "recipient_address",
        "applicable_law",
        "sender_name",
        "sender_address",
        "notice_content",
        "demanded_action",
        "time_period",
        "date",
        "place",
      ],
    },
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleGenerateDocument = () => {
    setIsLoading(true)
    setGeneratedDoc("")
    setTimeout(() => {
      try {
        const templateData = LEGAL_TEMPLATES[docType]
        if (!templateData) {
          throw new Error("Selected document type not found.")
        }

        const currentFormData = {
          ...formData,
          date: new Date().toLocaleDateString(language === "en" ? "en-IN" : `${language}-IN`, {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          place: formData.place || userProfile?.location?.split(",")[0] || "Your City",
        }

        const docContent = templateData.template.replace(/{(\w+)}/g, (match, key) => {
          return currentFormData[key] !== undefined ? currentFormData[key] : `{${key}}` // Keep placeholder if data is missing
        })

        setGeneratedDoc(docContent)
        toast({
          title: t("common.success"),
          description:
            language === "hi"
              ? "दस्तावेज़ सफलतापूर्वक जेनरेट किया गया!"
              : language === "ta"
                ? "ஆவணம் வெற்றிகரமாக உருவாக்கப்பட்டது!"
                : "Document generated successfully!",
        })
      } catch (error: any) {
        toast({
          title: t("common.error"),
          description: error.message,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }, 1000)
  }

  const handleDownloadDocument = () => {
    if (!generatedDoc) {
      toast({
        title: t("common.error"),
        description:
          language === "hi"
            ? "जेनरेट करने के लिए कोई दस्तावेज़ नहीं है।"
            : language === "ta"
              ? "உருவாக்க எந்த ஆவணமும் இல்லை."
              : "No document to download.",
        variant: "destructive",
      })
      return
    }
    const blob = new Blob([generatedDoc], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${docType.toLowerCase().replace(/\s/g, "_")}_${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({
      title: t("common.success"),
      description:
        language === "hi"
          ? "दस्तावेज़ डाउनलोड किया गया!"
          : language === "ta"
            ? "ஆவணம் பதிவிறக்கம் செய்யப்பட்டது!"
            : "Document downloaded!",
    })
  }

  const handleCopyDocument = () => {
    if (!generatedDoc) {
      toast({
        title: t("common.error"),
        description:
          language === "hi"
            ? "कॉपी करने के लिए कोई दस्तावेज़ नहीं है।"
            : language === "ta"
              ? "நகலெடுக்க எந்த ஆவணமும் இல்லை."
              : "No document to copy.",
        variant: "destructive",
      })
      return
    }
    navigator.clipboard.writeText(generatedDoc)
    toast({
      title: t("common.success"),
      description:
        language === "hi"
          ? "दस्तावेज़ कॉपी किया गया!"
          : language === "ta"
            ? "ஆவணம் நகலெடுக்கப்பட்டது!"
            : "Document copied to clipboard!",
    })
  }

  const currentTemplate = LEGAL_TEMPLATES[docType]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="generate" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <TabsTrigger
                  value="generate"
                  className="data-[state=active]:bg-purple-500 data-[state=active]:text-white dark:data-[state=active]:bg-purple-700"
                >
                  {language === "hi" ? "दस्तावेज़ जेनरेट करें" : language === "ta" ? "ஆவணத்தை உருவாக்கவும்" : "Generate Document"}
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="data-[state=active]:bg-purple-500 data-[state=active]:text-white dark:data-[state=active]:bg-purple-700"
                >
                  {language === "hi" ? "जेनरेटेड दस्तावेज़" : language === "ta" ? "உருவாக்கப்பட்ட ஆவணங்கள்" : "Generated Documents"}
                </TabsTrigger>
              </TabsList>

              {/* Generate Document Tab */}
              <TabsContent value="generate">
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center text-gray-900 dark:text-white">
                      <FileText className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                      {language === "hi"
                        ? "नया दस्तावेज़ जेनरेट करें"
                        : language === "ta"
                          ? "புதிய ஆவணத்தை உருவாக்கவும்"
                          : "Generate New Document"}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      {language === "hi"
                        ? "अपनी आवश्यकताओं के अनुसार कानूनी दस्तावेज़ों को स्वचालित रूप से तैयार करें।"
                        : language === "ta"
                          ? "உங்கள் தேவைகளுக்கு ஏற்ப சட்ட ஆவணங்களை தானாகவே உருவாக்கவும்."
                          : "Automatically draft legal documents tailored to your needs."}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="doc-type" className="text-gray-900 dark:text-white">
                          {language === "hi"
                            ? "दस्तावेज़ प्रकार चुनें"
                            : language === "ta"
                              ? "ஆவண வகையைத் தேர்ந்தெடுக்கவும்"
                              : "Select Document Type"}
                        </Label>
                        <Select value={docType} onValueChange={setDocType}>
                          <SelectTrigger
                            id="doc-type"
                            className="w-full mt-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                          >
                            <SelectValue
                              placeholder={
                                language === "hi"
                                  ? "एक प्रकार चुनें"
                                  : language === "ta"
                                    ? "ஒரு வகையைத் தேர்ந்தெடுக்கவும்"
                                    : "Select a type"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            {Object.keys(LEGAL_TEMPLATES).map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {currentTemplate && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {language === "hi"
                              ? "जानकारी भरें"
                              : language === "ta"
                                ? "தகவலை நிரப்பவும்"
                                : "Fill in the Information"}
                          </h3>
                          {currentTemplate.fields.map((field) => (
                            <div key={field} className="space-y-2">
                              <Label htmlFor={field} className="text-gray-900 dark:text-white">
                                {field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                              </Label>
                              {field.includes("content") || field.includes("details") || field.includes("requested") ? (
                                <Textarea
                                  id={field}
                                  placeholder={`Enter ${field.replace(/_/g, " ")}`}
                                  value={formData[field] || ""}
                                  onChange={(e) => handleInputChange(field, e.target.value)}
                                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                                />
                              ) : (
                                <Input
                                  id={field}
                                  type={field.includes("email") ? "email" : field.includes("phone") ? "tel" : "text"}
                                  placeholder={`Enter ${field.replace(/_/g, " ")}`}
                                  value={formData[field] || ""}
                                  onChange={(e) => handleInputChange(field, e.target.value)}
                                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                                />
                              )}
                            </div>
                          ))}
                          <Button
                            onClick={handleGenerateDocument}
                            className="w-full bg-purple-500 hover:bg-purple-600 dark:bg-purple-700 dark:hover:bg-purple-600"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {language === "hi"
                                  ? "जेनरेट कर रहा है..."
                                  : language === "ta"
                                    ? "உருவாக்குகிறது..."
                                    : "Generating..."}
                              </>
                            ) : (
                              <>
                                <FileText className="mr-2 h-4 w-4" />
                                {language === "hi"
                                  ? "दस्तावेज़ जेनरेट करें"
                                  : language === "ta"
                                    ? "ஆவணத்தை உருவாக்கவும்"
                                    : "Generate Document"}
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Generated Documents Tab */}
              <TabsContent value="history">
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center text-gray-900 dark:text-white">
                      <BookOpen className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                      {language === "hi"
                        ? "जेनरेटेड दस्तावेज़"
                        : language === "ta"
                          ? "உருவாக்கப்பட்ட ஆவணங்கள்"
                          : "Generated Documents"}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      {language === "hi"
                        ? "यहां आपके द्वारा जेनरेट किए गए दस्तावेज़ों की सूची है।"
                        : language === "ta"
                          ? "நீங்கள் உருவாக்கிய ஆவணங்களின் பட்டியல் இங்கே உள்ளது."
                          : "Here's a list of documents you've generated."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {generatedDoc ? (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                            {language === "hi"
                              ? "हाल ही में जेनरेट किया गया दस्तावेज़"
                              : language === "ta"
                                ? "சமீபத்தில் உருவாக்கப்பட்ட ஆவணம்"
                                : "Recently Generated Document"}
                          </h3>
                          <Textarea
                            value={generatedDoc}
                            readOnly
                            rows={10}
                            className="font-mono text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                          />
                          <div className="flex space-x-2 mt-4">
                            <Button
                              onClick={handleDownloadDocument}
                              className="bg-green-500 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-600"
                            >
                              <Download className="mr-2 h-4 w-4" />
                              {language === "hi" ? "डाउनलोड करें" : language === "ta" ? "பதிவிறக்கு" : "Download"}
                            </Button>
                            <Button
                              onClick={handleCopyDocument}
                              variant="outline"
                              className="bg-transparent border-gray-300 dark:border-gray-600"
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              {language === "hi" ? "कॉपी करें" : language === "ta" ? "நகலெடு" : "Copy"}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p>
                          {language === "hi"
                            ? "अभी तक कोई दस्तावेज़ जेनरेट नहीं किया गया है।"
                            : language === "ta"
                              ? "இதுவரை எந்த ஆவணமும் உருவாக்கப்படவில்லை."
                              : "No documents generated yet."}
                        </p>
                        <Button
                          onClick={() =>
                            document.querySelector('button[data-state="active"][value="generate"]')?.click()
                          }
                          className="mt-4 bg-purple-500 hover:bg-purple-600 dark:bg-purple-700 dark:hover:bg-purple-600"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          {language === "hi"
                            ? "पहला दस्तावेज़ जेनरेट करें"
                            : language === "ta"
                              ? "முதல் ஆவணத்தை உருவாக்கவும்"
                              : "Generate First Document"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Document Tips */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                  {language === "hi" ? "दस्तावेज़ टिप्स" : language === "ta" ? "ஆவண குறிப்புகள்" : "Document Tips"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-1" />
                    <span>
                      {language === "hi"
                        ? "सभी आवश्यक फ़ील्ड सही ढंग से भरें।"
                        : language === "ta"
                          ? "அனைத்து தேவையான புலங்களையும் சரியாக நிரப்பவும்."
                          : "Fill all required fields accurately."}
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-1" />
                    <span>
                      {language === "hi"
                        ? "जेनरेट करने से पहले सामग्री की समीक्षा करें।"
                        : language === "ta"
                          ? "உருவாக்குவதற்கு முன் உள்ளடக்கத்தை மதிப்பாய்வு செய்யவும்."
                          : "Review the content before generating."}
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-1" />
                    <span>
                      {language === "hi"
                        ? "कानूनी सलाह के लिए हमेशा एक वकील से परामर्श करें।"
                        : language === "ta"
                          ? "சட்ட ஆலோசனைக்கு எப்போதும் ஒரு வழக்கறிஞரை அணுகவும்."
                          : "Always consult a lawyer for legal advice."}
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-1" />
                    <span>
                      {language === "hi"
                        ? "डाउनलोड करने के बाद दस्तावेज़ को प्रिंट करें और हस्ताक्षर करें।"
                        : language === "ta"
                          ? "பதிவிறக்கிய பிறகு ஆவணத்தை அச்சிட்டு கையொப்பமிடுங்கள்."
                          : "Print and sign the document after downloading."}
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Related Legal Topics */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center">
                  <Gavel className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                  {language === "hi"
                    ? "संबंधित कानूनी विषय"
                    : language === "ta"
                      ? "தொடர்புடைய சட்ட தலைப்புகள்"
                      : "Related Legal Topics"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent border-gray-300 dark:border-gray-600"
                    asChild
                  >
                    <Link href="/legal?scenario=tenant-rights">
                      <FileText className="h-4 w-4 mr-2" />
                      {language === "hi"
                        ? "किरायेदार अधिकार"
                        : language === "ta"
                          ? "குத்தகைதாரர் உரிமைகள்"
                          : "Tenant Rights"}
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent border-gray-300 dark:border-gray-600"
                    asChild
                  >
                    <Link href="/legal?scenario=consumer-rights">
                      <FileText className="h-4 w-4 mr-2" />
                      {language === "hi" ? "उपभोक्ता अधिकार" : language === "ta" ? "நுகர்வோர் உரிமைகள்" : "Consumer Rights"}
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent border-gray-300 dark:border-gray-600"
                    asChild
                  >
                    <Link href="/legal?scenario=workplace-rights">
                      <FileText className="h-4 w-4 mr-2" />
                      {language === "hi" ? "श्रम अधिकार" : language === "ta" ? "தொழிலாளர் உரிமைகள்" : "Labor Rights"}
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
