import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if it exists
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const isAdminRoute = url.pathname.startsWith('/admin')
  const isAuthRoute = url.pathname.startsWith('/login') || url.pathname.startsWith('/signup')
  const isPublicRoute = url.pathname === '/' || url.pathname.startsWith('/unsubscribe')
  const isApiRoute = url.pathname.startsWith('/api')
  const isDashboardRoute = url.pathname.startsWith('/dashboard')

  // Allow API routes to handle their own auth
  if (isApiRoute) {
    return supabaseResponse
  }

  // If user is not authenticated
  if (!user) {
    // Allow access to public routes and auth routes
    if (isPublicRoute || isAuthRoute) {
      return supabaseResponse
    }
    // Redirect to login for protected routes
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user is authenticated
  if (user) {
    // Get user role
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const role = userRole?.role || 'user'

    // Redirect authenticated users away from auth pages
    if (isAuthRoute) {
      if (role === 'admin') {
        url.pathname = '/admin/dashboard'
      } else {
        url.pathname = '/dashboard'
      }
      return NextResponse.redirect(url)
    }

    // Check admin routes
    if (isAdminRoute) {
      if (role !== 'admin') {
        // Non-admin users cannot access admin routes
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }
    }

    // Check dashboard routes - admin should not access user dashboard
    if (isDashboardRoute) {
      if (role === 'admin') {
        // Admins should not access user dashboard
        // Redirect them to admin dashboard
        url.pathname = '/admin/dashboard'
        return NextResponse.redirect(url)
      }
      // Regular users can access dashboard
      return supabaseResponse
    }
    
    // Allow both admins and users to view /blogs content
    // This is public content that both roles should be able to view
    if (url.pathname.startsWith('/blogs')) {
      return supabaseResponse
    }
  }

  return supabaseResponse
}