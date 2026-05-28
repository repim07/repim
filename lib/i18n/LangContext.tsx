'use client'

// =============================================================================
// REPIM — Contexte de langue (FR / EN / AR / CH)
// Usage : const { lang, setLang, t } = useLang()
// =============================================================================

import { createContext, useContext, useState, useMemo, type ReactNode } from 'react'
import { TRANSLATIONS, type LangCode, type Translations } from './translations'

interface LangContextValue {
  lang:    LangCode
  setLang: (l: LangCode) => void
  t:       Translations
}

const LangContext = createContext<LangContextValue>({
  lang:    'FR',
  setLang: () => {},
  t:       TRANSLATIONS.FR,
})

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<LangCode>('FR')
  const t = useMemo(() => TRANSLATIONS[lang], [lang])
  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
