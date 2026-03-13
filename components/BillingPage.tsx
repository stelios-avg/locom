'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/app/providers'
import Navbar from './Navbar'
import { useTranslations } from '@/lib/i18n/hooks'
import { formatDistanceToNow } from 'date-fns'

interface SubscriptionInfo {
  status: string
  current_period_end: string | null
}

interface ProfileInfo {
  plan: string
  is_pro: boolean
}

export default function BillingPage() {
  const { user } = useAuth()
  const { t } = useTranslations()
  const supabase = createClient()

  const [profile, setProfile] = useState<ProfileInfo | null>(null)
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [buttonLoading, setButtonLoading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        const [{ data: profileData, error: profileError }, { data: subscriptionData, error: subscriptionError }] = await Promise.all([
          supabase
            .from('profiles')
            .select('plan, is_pro')
            .eq('user_id', user.id)
            .maybeSingle(),
          supabase
            .from('subscriptions')
            .select('status, current_period_end')
            .eq('user_id', user.id)
            .maybeSingle(),
        ])

        if (profileError) throw profileError
        if (subscriptionError) throw subscriptionError

        setProfile(profileData)
        setSubscription(subscriptionData)
      } catch (err) {
        console.error('Error loading billing info', err)
        setError(t?.billing.loadError || 'Could not load billing information')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase, t?.billing.loadError, user?.id])

  const benefits = useMemo(
    () => (
      t?.billing.benefits || [
        'Priority placement in marketplace results',
        'Pro badge on your profile and listings',
        'Unlimited promotional posts each month',
      ]
    ),
    [t?.billing.benefits]
  )

  const handleUpgrade = async () => {
    if (!user?.id) return
    setError(null)
    setButtonLoading(true)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })

      const data = await response.json()

      if (!response.ok || !data?.url) {
        throw new Error(data?.error || 'Unable to start checkout')
      }

      window.location.href = data.url as string
    } catch (err) {
      console.error('Checkout error', err)
      setError(t?.billing.checkoutError || 'Unable to start checkout. Please try again later.')
    } finally {
      setButtonLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    if (!user?.id) return
    setError(null)
    setPortalLoading(true)

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })

      const data = await response.json()

      if (!response.ok || !data?.url) {
        throw new Error(data?.error || 'Unable to open billing portal')
      }

      window.location.href = data.url as string
    } catch (err) {
      console.error('Portal error', err)
      setError('Unable to open billing portal. Please try again later.')
    } finally {
      setPortalLoading(false)
    }
  }

  const nextBillingText = subscription?.current_period_end
    ? formatDistanceToNow(new Date(subscription.current_period_end), { addSuffix: true })
    : null

  const isPro = profile?.plan === 'pro' || profile?.is_pro

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-6">
          {t?.billing.title || 'Billing'}
        </h1>

        {loading ? (
          <div className="card text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">{t?.common.loading || 'Loading...'}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                {error}
              </div>
            )}

            {isPro ? (
              <div className="card">
                <div className="flex flex-col gap-4">
                  <span className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-primary-600">
                    {t?.billing.planPro || 'Locom Pro'}
                  </span>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {t?.billing.onPro || 'You are on Locom Pro'}
                  </h2>
                  {subscription?.status && (
                    <p className="text-gray-600">
                      {t?.billing.statusLabel || 'Status'}: <strong className="text-gray-900">{subscription.status}</strong>
                    </p>
                  )}
                  {nextBillingText && (
                    <p className="text-gray-600">
                      {t?.billing.nextBilling || 'Renews'} {nextBillingText}
                    </p>
                  )}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <button
                      type="button"
                      className="btn-secondary w-full sm:w-auto disabled:opacity-50"
                      disabled={portalLoading}
                      onClick={handleManageSubscription}
                    >
                      {portalLoading ? (t?.common.loading || 'Loading...') : (t?.billing.cancelButton || 'Manage / Cancel Subscription')}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card">
                <span className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-primary-600">
                  {t?.billing.planFree || 'Locom Free'}
                </span>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t?.billing.upgradeHeadline || 'Upgrade to Locom Pro'}
                </h2>
                <p className="text-gray-600 mb-6">
                  {t?.billing.upgradeDescription ||
                    'Unlock premium placement in the marketplace, get highlighted badges, and reach more local customers.'}
                </p>

                <ul className="space-y-3 mb-6">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-700">
                      <span className="mt-1 text-primary-600">•</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleUpgrade}
                  disabled={buttonLoading}
                  className="btn-primary w-full sm:w-auto"
                >
                  {buttonLoading ? t?.common.loading || 'Loading...' : t?.billing.upgradeButton || 'Upgrade to Locom Pro'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
