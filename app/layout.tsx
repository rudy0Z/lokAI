import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { ThemeProvider } from "@/contexts/ThemeContext"
import { LanguageProvider } from "@/contexts/LanguageContext"
import { LocationProvider } from "@/contexts/LocationContext"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LokAI - Your AI-Powered Civic & Legal Assistant",
  description:
    "Understand your rights, stay informed about local governance, and take action - all in the language you speak, with the help of AI that truly understands India.",
  keywords: "civic rights, legal assistance, India, AI assistant, government, RTI, consumer rights, tenant rights",
  authors: [{ name: "LokAI Team" }],
  creator: "LokAI",
  publisher: "LokAI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://lokai.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "LokAI - Your AI-Powered Civic & Legal Assistant",
    description:
      "Understand your rights, stay informed about local governance, and take action - all in the language you speak.",
    url: "https://lokai.app",
    siteName: "LokAI",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "LokAI - Civic & Legal Assistant",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LokAI - Your AI-Powered Civic & Legal Assistant",
    description: "Understand your rights, stay informed about local governance, and take action.",
    images: ["/og-image.jpg"],
    creator: "@LokAI_India",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <LocationProvider>
                {children}
                <Toaster />
              </LocationProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
