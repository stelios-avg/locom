import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

/**
 * Server-side password reset request. Avoids browser "Failed to fetch" when
 * ad blockers or network block direct calls to *.supabase.co from the client.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = typeof body?.email === 'string' ? body.email.trim() : ''

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl?.trim() || !anonKey?.trim()) {
      console.error('[forgot-password] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const origin =
      request.headers.get('origin') ||
      (() => {
        try {
          return new URL(request.url).origin
        } catch {
          return ''
        }
      })()

    // Prefer request Origin so reset link matches the site the user is actually on (Vercel preview vs production).
    const appBase =
      origin ||
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
      ''

    if (!appBase) {
      return NextResponse.json({ error: 'Could not determine app URL for reset link' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appBase}/auth/reset-password`,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[forgot-password]', e)
    return NextResponse.json({ error: 'Request failed' }, { status: 500 })
  }
}
