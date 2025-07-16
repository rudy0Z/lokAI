"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { translations, type Language, getNestedTranslation } from "@/lib/translations"

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    // Load language from localStorage
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage)
    } else {
      // Detect browser language
      const browserLanguage = navigator.language.split("-")[0] as Language
      if (translations[browserLanguage]) {
        setLanguage(browserLanguage)
      }
    }
  }, [])

  useEffect(() => {
    // Save language to localStorage
    localStorage.setItem("language", language)

    // Update document language
    document.documentElement.lang = language
  }, [language])

  const t = (key: string): string => {
    return getNestedTranslation(translations[language], key) || key
  }

  const value = {
    language,
    setLanguage,
    t,
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
