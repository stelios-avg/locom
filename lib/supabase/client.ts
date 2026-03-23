import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'

type BrowserClient = ReturnType<typeof createClientComponentClient<Database>>

let browserClient: BrowserClient | undefined

function assertBrowserUsesAnonKeyOnly() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!key || typeof window === 'undefined') return
  // New Supabase keys: never put sb_secret_* in NEXT_PUBLIC_* (Vercel will expose it to the browser).
  if (key.startsWith('sb_secret_')) {
    throw new Error(
      'MISSING_SUPABASE_ENV: NEXT_PUBLIC_SUPABASE_ANON_KEY is the SECRET key. Use the Publishable (anon) key from Supabase → Settings → API Keys.'
    )
  }
}

function assertSupabaseEnvForClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url?.trim() || !key?.trim()) {
    throw new Error(
      'MISSING_SUPABASE_ENV: Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel → Environment Variables (Production), then Redeploy.'
    )
  }
}

/**
 * Single browser client instance. Creating a new client on every render breaks
 * auth state (OAuth, session refresh) because listeners/session get out of sync.
 */
export const createClient = (): BrowserClient => {
  assertSupabaseEnvForClient()
  assertBrowserUsesAnonKeyOnly()
  if (typeof window === 'undefined') {
    return createClientComponentClient<Database>()
  }
  if (!browserClient) {
    browserClient = createClientComponentClient<Database>()
  }
  return browserClient
}

