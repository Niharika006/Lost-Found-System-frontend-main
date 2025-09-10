"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type Language = "English" | "Hindi" | "Marathi"

type Ctx = {
  language: Language
  setLanguage: (l: Language) => void
}

const LanguageContext = createContext<Ctx | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("English")

  useEffect(() => {
    const saved = typeof window !== "undefined" ? (localStorage.getItem("loft:language") as Language | null) : null
    if (saved) setLanguageState(saved)
  }, [])
  const setLanguage = (l: Language) => {
    setLanguageState(l)
    try {
      localStorage.setItem("loft:language", l)
    } catch {}
  }
  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider")
  return ctx
}
