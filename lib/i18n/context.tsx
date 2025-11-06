'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Locale, Translations, loadTranslations, setLocale, getLocale } from './index'

interface I18nContextType {
  t: Translations | null
  locale: Locale
  changeLocale: (locale: Locale) => void
  loading: boolean
}

const I18nContext = createContext<I18nContextType>({
  t: null,
  locale: 'el',
  changeLocale: () => {},
  loading: true,
})

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      return getLocale()
    }
    return 'el'
  })
  const [t, setT] = useState<Translations | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTranslations(locale).then((translations) => {
      setT(translations)
      setLoading(false)
    })
  }, [locale])

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale)
    setLocaleState(newLocale)
    loadTranslations(newLocale).then((translations) => {
      setT(translations)
    })
  }

  return (
    <I18nContext.Provider value={{ t, locale, changeLocale, loading }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}


