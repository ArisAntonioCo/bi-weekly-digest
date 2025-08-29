import { NextResponse, type NextRequest } from 'next/server'

// Edge-safe middleware without importing Supabase client
// Uses presence of `sb-` auth cookies to detect authentication.
export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request })

  const url = request.nextUrl.clone()
  const pathname = url.pathname

  const isApiRoute = pathname.startsWith('/api')
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup')
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin')

  if (isApiRoute) return response

  // Basic auth detection via Supabase cookie prefix
  const hasAuthCookie = request.cookies.getAll().some(c => c.name.startsWith('sb-'))

  if (!hasAuthCookie && isProtectedRoute && !isAuthRoute) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If authenticated and hitting auth screens, send to user dashboard
  if (hasAuthCookie && isAuthRoute) {
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Admin role checks should be handled server-side within pages/routes to avoid Edge runtime limitations.
  return response
}
