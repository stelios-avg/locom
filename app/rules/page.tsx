'use client'

import { useTranslations } from '@/lib/i18n/hooks'
import { CheckCircle2, XCircle } from 'lucide-react'

export default function RulesPage() {
  const { t } = useTranslations()

  const communityAllowed = t?.rules.communityAllowed || []
  const communityNotAllowed = t?.rules.communityNotAllowed || []
  const marketplaceAllowed = t?.rules.marketplaceAllowed || []
  const marketplaceNotAllowed = t?.rules.marketplaceNotAllowed || []

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">
        {t?.rules.title || 'Rules & Terms of Service'}
      </h1>

      <div className="space-y-8">
        {/* Community Rules */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {t?.rules.communityRules || 'Community Rules'}
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-green-700 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                {t?.rules.allowed || 'Allowed'}
              </h3>
              <ul className="space-y-2">
                {Array.isArray(communityAllowed) ? (
                  communityAllowed.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-600 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">No rules specified</li>
                )}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-red-700 mb-3 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                {t?.rules.notAllowed || 'Not Allowed'}
              </h3>
              <ul className="space-y-2">
                {Array.isArray(communityNotAllowed) ? (
                  communityNotAllowed.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <span className="text-red-600 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">No rules specified</li>
                )}
              </ul>
            </div>
          </div>
        </section>

        {/* Marketplace Rules */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            {t?.rules.marketplaceRules || 'Marketplace Rules'}
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-green-700 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                {t?.rules.allowed || 'Allowed'}
              </h3>
              <ul className="space-y-2">
                {Array.isArray(marketplaceAllowed) ? (
                  marketplaceAllowed.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-600 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">No rules specified</li>
                )}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-red-700 mb-3 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                {t?.rules.notAllowed || 'Not Allowed'}
              </h3>
              <ul className="space-y-2">
                {Array.isArray(marketplaceNotAllowed) ? (
                  marketplaceNotAllowed.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <span className="text-red-600 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">No rules specified</li>
                )}
              </ul>
            </div>
          </div>
        </section>

        {/* Terms of Service */}
        <section className="pt-6 border-t border-gray-200">
          <h2 className="text-2xl font-semibold mb-4">
            {t?.rules.termsOfService || 'Terms of Service'}
          </h2>
          <div className="prose max-w-none text-gray-700">
            <p className="mb-4">
              By using this platform, you agree to follow our community guidelines and marketplace rules.
              Violations may result in warnings, content removal, or account suspension.
            </p>
            <p>
              If you encounter inappropriate content, please use the report feature. Our moderation team
              will review reports and take appropriate action.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}



