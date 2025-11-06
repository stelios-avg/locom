'use client'

import { Globe } from 'lucide-react'
import { useTranslations } from '@/lib/i18n/hooks'
import { Locale } from '@/lib/i18n'

export default function LanguageSwitcher() {
  const { locale, changeLocale } = useTranslations()

  const toggleLanguage = () => {
    const newLocale: Locale = locale === 'el' ? 'en' : 'el'
    changeLocale(newLocale)
  }

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
      title={locale === 'el' ? 'Switch to English' : 'Αλλαγή σε Ελληνικά'}
    >
      <Globe className="w-5 h-5 flex-shrink-0" />
      <span className="hidden sm:inline font-medium">{locale === 'el' ? 'EN' : 'EL'}</span>
    </button>
  )
}


