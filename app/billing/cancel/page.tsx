'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { useTranslations } from '@/lib/i18n/hooks'

export default function BillingCancel() {
  const { t } = useTranslations()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-4">
          {t?.billing.cancelTitle || 'Checkout canceled'}
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          {t?.billing.cancelMessage || 'No worries—your current plan remains active. You can upgrade anytime.'}
        </p>
        <Link href="/billing" className="btn-primary">
          {t?.billing.backToBilling || 'Back to billing'}
        </Link>
      </div>
    </div>
  )
}
