import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Basic route protection - pages will handle auth checks
  // This middleware can be extended later with proper Supabase auth when migrating to @supabase/ssr
  
  const response = NextResponse.next()
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

