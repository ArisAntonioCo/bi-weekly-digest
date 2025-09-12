import { NextResponse, type NextRequest } from 'next/server'

// Edge-safe middleware without importing Supabase client
// Uses presence of `sb-` auth cookies to detect authentication.
export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request })

  const url = request.nextUrl.clone()
  const pathname = url.pathname

  const isApiRoute = pathname.startsWith('/api')
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup')
  const isLegalRoute = pathname === '/privacy' || pathname === '/terms'

  // Only homepage and auth pages are public. Everything else requires auth.
  const isPublicRoute = pathname === '/' || isAuthRoute || isLegalRoute

  if (isApiRoute) return response

  // Robust auth detection: require a valid access token cookie
  const cookies = request.cookies.getAll()
  const access = cookies.find(c => /^(sb-access-token|sb-.*-access-token)$/.test(c.name))
  const token = access?.value ?? ''
  // JWTs have 2 dots (header.payload.signature) and are non-empty
  const hasValidAuthCookie = token.split('.').length === 3 && token.length > 10

  if (!hasValidAuthCookie && !isPublicRoute) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If authenticated and hitting auth screens, send to user dashboard
  if (hasValidAuthCookie && isAuthRoute) {
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Admin role checks should be handled server-side within pages/routes to avoid Edge runtime limitations.
  return response
}
