import type { NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export function middleware(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  // Run on all pages except static assets and Next internals.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|css|js|map|mp4)).*)',
  ],
}

