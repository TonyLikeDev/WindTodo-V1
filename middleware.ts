import { type NextRequest, NextResponse } from 'next/server'

// Cookie names better-auth uses, mirroring getSessionCookie() in better-auth/dist/cookies.
// Covers dot vs dash separator and HTTP vs HTTPS (__Secure- prefix) variants.
const SESSION_COOKIE_NAMES = [
  'better-auth.session_token',
  '__Secure-better-auth.session_token',
  'better-auth-session_token',
  '__Secure-better-auth-session_token',
] as const

function hasSessionCookie(request: NextRequest): boolean {
  const cookieHeader = request.headers.get('cookie') ?? ''
  return SESSION_COOKIE_NAMES.some(name => cookieHeader.includes(name + '='))
}

// Synchronous — no HTTP round-trip on every request.
// Full session validation happens inside the server component via getAuthUser().
export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/'
  ) {
    return NextResponse.next()
  }

  if (!hasSessionCookie(request)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('error', 'Please log in to access the site.')
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico)$).*)'],
}
