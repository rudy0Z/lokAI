import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Users,
  Target,
  Shield,
  Zap,
  FileText,
  MessageSquare,
  Bell,
  Search,
  Award,
  Heart,
  Globe,
  CheckCircle,
  ArrowRight,
  Star,
  TrendingUp,
} from "lucide-react"

export default function AboutPage() {
  const features = [
    {
      icon: FileText,
      title: "Document Analysis",
      description: "AI-powered analysis of government documents, bills, and notices with instant insights and summaries.",
    },
    {
      icon: MessageSquare,
      title: "Smart Chat Assistant",
      description: "Get instant answers to civic queries and guidance on government processes in multiple languages.",
    },
    {
      icon: Bell,
      title: "Real-time Alerts",
      description: "Stay updated with the latest government circulars, policy changes, and deadlines.",
    },
    {
      icon: Search,
      title: "Process Guidance",
      description: "Step-by-step guidance for RTI applications, complaints, and other government procedures.",
    },
  ]

  const stats = [
    { number: "50,000+", label: "Documents Analyzed", icon: FileText },
    { number: "25,000+", label: "Citizens Helped", icon: Users },
    { number: "500+", label: "Government Departments", icon: Globe },
    { number: "99.5%", label: "Accuracy Rate", icon: Award },
  ]

  const teamMembers = [
    {
      name: "AI Development Team",
      role: "Artificial Intelligence & Machine Learning",
      description: "Specialized in NLP, document processing, and government domain expertise.",
    },
    {
      name: "Civic Tech Experts",
      role: "Government Process Specialists",
      description: "Deep understanding of Indian government procedures and citizen services.",
    },
    {
      name: "UX/UI Designers",
      role: "User Experience Design",
      description: "Creating intuitive interfaces for seamless citizen-government interaction.",
    },
  ]

  const values = [
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your data is encrypted and secure. We never share personal information without consent.",
    },
    {
      icon: Heart,
      title: "Citizen-Centric",
      description: "Every feature is designed with the citizen's needs and convenience in mind.",
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "Leveraging cutting-edge AI to solve real-world civic challenges.",
    },
    {
      icon: CheckCircle,
      title: "Accuracy",
      description: "Reliable, fact-checked information sourced from official government channels.",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <Badge variant="outline" className="px-4 py-2 text-sm">
            🇮🇳 Made in India for Indians
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 leading-tight">
            About <span className="text-indigo-600">LokAI</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Empowering Indian citizens with AI-powered civic assistance. Making government processes 
            accessible, understandable, and actionable for everyone.
          </p>
          <div className="flex justify-center space-x-4">
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <MessageSquare className="h-4 w-4 mr-2" />
              Try LokAI Chat
            </Button>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Analyze Document
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <div className="flex justify-center mb-3">
                  <stat.icon className="h-8 w-8 text-indigo-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mission Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-3">
              <Badge variant="outline" className="text-indigo-600 border-indigo-200">
                <Target className="h-3 w-3 mr-1" />
                Our Mission
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900">
                Democratizing Access to Government Services
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              We believe that every citizen should have easy access to understand government notices, 
              draft official letters, and stay informed about civic matters. LokAI bridges the gap 
              between complex government processes and everyday citizens.
            </p>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Simplify complex government documentation</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Provide instant, accurate civic guidance</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Enable proactive citizen engagement</span>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-8 rounded-2xl">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
                <span className="font-semibold text-gray-900">Impact Metrics</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Processing Time Reduced</span>
                  <span className="font-semibold text-green-600">85%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">User Satisfaction</span>
                  <span className="font-semibold text-green-600">96%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Document Accuracy</span>
                  <span className="font-semibold text-green-600">99.5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <Badge variant="outline" className="text-indigo-600 border-indigo-200">
              <Zap className="h-3 w-3 mr-1" />
              Features
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900">How LokAI Helps You</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive AI-powered tools designed to make government interaction effortless and efficient.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto">
                    <feature.icon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <Badge variant="outline" className="text-indigo-600 border-indigo-200">
              <Star className="h-3 w-3 mr-1" />
              Our Values
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900">What Drives Us</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6 space-y-4">
                  <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                    <value.icon className="h-6 w-6 text-gray-700" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{value.title}</h3>
                  <p className="text-sm text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <Badge variant="outline" className="text-indigo-600 border-indigo-200">
              <Users className="h-3 w-3 mr-1" />
              Our Team
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900">Built by Experts</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A dedicated team of technologists, civic experts, and designers working to improve citizen-government interaction.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6 space-y-4">
                  <div className="bg-gradient-to-br from-indigo-100 to-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                    <Users className="h-8 w-8 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-indigo-600 font-medium">{member.role}</p>
                  </div>
                  <p className="text-sm text-gray-600">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-8 text-center text-white">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
            <p className="text-indigo-100 max-w-2xl mx-auto">
              Join thousands of citizens who are already using LokAI to navigate government processes 
              with confidence and ease.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Button className="bg-white text-indigo-600 hover:bg-gray-100">
                <MessageSquare className="h-4 w-4 mr-2" />
                Start Chatting
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-indigo-600">
                <FileText className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="text-center space-y-4 py-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Have Questions?</h3>
          <p className="text-gray-600">
            We're here to help! Reach out to us through our support channels or try our AI assistant.
          </p>
          <Button variant="outline" className="mx-auto">
            <ArrowRight className="h-4 w-4 mr-2" />
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  )
}
