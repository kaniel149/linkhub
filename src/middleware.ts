import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Reserved paths that should NOT be treated as usernames
const RESERVED_PATHS = new Set([
  'api', 'auth', 'login', 'dashboard', 'projects', 'llms.txt', '_next',
  'favicon.ico', 'robots.txt', 'sitemap.xml',
])

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Content negotiation: if Accept header includes application/json
  // and path looks like a username (single segment, not reserved)
  const acceptHeader = request.headers.get('accept') || ''
  if (acceptHeader.includes('application/json')) {
    // Match single-segment paths like /kaniel (but not /api/*, /dashboard/*, etc.)
    const segments = pathname.split('/').filter(Boolean)
    if (
      segments.length === 1 &&
      !RESERVED_PATHS.has(segments[0]) &&
      !segments[0].startsWith('_') &&
      !segments[0].includes('.')
    ) {
      const username = segments[0]
      const url = request.nextUrl.clone()
      url.pathname = `/api/profiles/${username}`
      return NextResponse.rewrite(url)
    }
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
