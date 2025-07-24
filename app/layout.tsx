import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LokAI - AI-Powered Civic Assistant",
  description:
    "Empowering Indian citizens with AI-powered civic assistance. Navigate government processes, understand documents, and take civic action with confidence.",
  keywords: ["AI", "civic", "government", "India", "assistant", "documents", "RTI", "citizen services"],
  authors: [{ name: "LokAI Team" }],
  creator: "LokAI",
  publisher: "LokAI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://lokai.gov.in"),
  openGraph: {
    title: "LokAI - AI-Powered Civic Assistant",
    description: "Empowering Indian citizens with AI-powered civic assistance",
    url: "https://lokai.gov.in",
    siteName: "LokAI",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LokAI - AI-Powered Civic Assistant",
    description: "Empowering Indian citizens with AI-powered civic assistance",
    creator: "@lokai_official",
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
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
