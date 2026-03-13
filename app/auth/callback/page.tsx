'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const type = searchParams.get('type') // 'signup', 'email', or 'recovery' for email confirmations
      const errorParam = searchParams.get('error')
      
      // Check for OAuth errors
      if (errorParam) {
        console.error('OAuth error:', errorParam)
        router.push('/auth/login?error=oauth_failed')
        return
      }
      
      if (code) {
        try {
          // Exchange code for session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          
          if (error) {
            console.error('Error exchanging code:', error)
            router.push('/auth/login?error=callback_failed')
            return
          }
          
          if (type === 'recovery') {
            // Password reset — keep session and redirect to reset page
            router.push('/auth/reset-password')
          } else if (type === 'signup' || type === 'email') {
            // Email confirmation — sign out and redirect to login
            await supabase.auth.signOut()
            router.push('/auth/login?confirmed=true')
          } else {
            // OAuth login - verify session and redirect
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
              router.push('/')
              router.refresh()
            } else {
              router.push('/auth/login?error=session_failed')
            }
          }
        } catch (error) {
          console.error('Callback error:', error)
          router.push('/auth/login?error=callback_failed')
        }
      } else {
        // No code - might be OAuth redirect, check for session
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          router.push('/')
          router.refresh()
        } else {
          router.push('/auth/login')
        }
      }
    }

    handleCallback()
  }, [searchParams, router, supabase])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}

