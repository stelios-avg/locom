'use client'

import { useI18n } from './context'

// Re-export useI18n as useTranslations for backward compatibility
export function useTranslations() {
  return useI18n()
}

