'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react'
import { useTranslations } from '@/lib/i18n/hooks'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])
  const { t } = useTranslations()

  useEffect(() => {
    // Check if user just confirmed their email
    if (searchParams.get('confirmed') === 'true') {
      setSuccess(t?.auth.emailConfirmed || 'Email confirmed successfully! Please sign in with your email and password.')
      // Clean up URL
      router.replace('/auth/login', { scroll: false })
    }
    
    // Check for OAuth errors
    const errorParam = searchParams.get('error')
    if (errorParam) {
      // Show the raw error message so we can debug exactly what's failing
      setError(`Login error: ${decodeURIComponent(errorParam)}`)
      router.replace('/auth/login', { scroll: false })
    }
  }, [searchParams, router, t])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
        return
      }

      if (data.user) {
        // Successfully logged in
      router.push('/')
      router.refresh()
      } else {
        setError('Login failed. Please try again.')
        setLoading(false)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
      console.error('Login error:', err)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetLoading(true)
    setError(null)

    try {
      // Use same-origin API so Supabase is called from the server (avoids ad blockers / "Failed to fetch" to *.supabase.co)
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail.trim() }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Could not send reset email. Try again.')
        setResetLoading(false)
        return
      }

      setSuccess('Check your email for a password reset link.')
      setShowForgotPassword(false)
      setResetEmail('')
    } catch (err) {
      console.error('Forgot password:', err)
      setError(
        'Network error. Check your connection, or try disabling ad blockers for this site.'
      )
    } finally {
      setResetLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {success && (
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-xl">
          <CheckCircle className="w-4 h-4" />
          <span>{success}</span>
        </div>
      )}

      {showForgotPassword ? (
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Forgot Password</h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter your email and we&apos;ll send you a reset link.
            </p>
            <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-1">
              {t?.auth.email || 'Email'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="resetEmail"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="input pl-10"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-xl">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={resetLoading}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {resetLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForgotPassword(false); setError(null) }}
              className="btn-outline flex-1"
            >
              {t?.common.cancel || 'Cancel'}
            </button>
          </div>
        </form>
      ) : (
        <>
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t?.auth.email || 'Email'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  {t?.auth.password || 'Password'}
                </label>
                <button
                  type="button"
                  onClick={() => { setShowForgotPassword(true); setError(null) }}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-xl">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (t?.auth.signingIn || 'Signing in...') : (t?.auth.login || 'Sign In')}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">{t?.auth.orContinueWith || 'Or continue with'}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              disabled={loading}
              className="btn-outline w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {t?.auth.loginWithGoogle || 'Google'}
            </button>

            <button
              type="button"
              onClick={() => handleOAuthLogin('facebook')}
              disabled={loading}
              className="btn-outline w-full flex items-center justify-center gap-2 border-[#1877F2] text-[#1877F2] hover:bg-[#1877F2]/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="currentColor"
                  d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                />
              </svg>
              {t?.auth.loginWithFacebook || 'Facebook'}
            </button>
          </div>

          <p className="text-center text-sm text-gray-600">
            {t?.auth.dontHaveAccount || 'Don\'t have an account?'}{' '}
            <Link href="/auth/signup" className="text-primary-600 hover:text-primary-700 font-medium">
              {t?.auth.signUp || 'Sign up'}
            </Link>
          </p>
        </>
      )}
    </div>
  )
}

