import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type')
  const next = requestUrl.searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      if (type === 'recovery') {
        return NextResponse.redirect(new URL('/auth/reset-password', requestUrl.origin))
      }
      if (type === 'signup' || type === 'email') {
        await supabase.auth.signOut()
        return NextResponse.redirect(new URL('/auth/login?confirmed=true', requestUrl.origin))
      }
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }

    console.error('[OAuth Callback] exchangeCodeForSession error:', error)
    const msg = encodeURIComponent(error.message)
    return NextResponse.redirect(new URL(`/auth/login?error=${msg}`, requestUrl.origin))
  }

  return NextResponse.redirect(new URL('/auth/login?error=no_code_in_callback', requestUrl.origin))
}
