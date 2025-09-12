import { type EmailOtpType, type User } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/route-handler'
import { createServiceClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  const form = await request.formData()
  const token_hash = String(form.get('token_hash') || '')
  const type = String(form.get('type') || '') as EmailOtpType
  const next = String(form.get('next') || '/login')
  const email = String(form.get('email') || '')

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) {
      const dest = next.startsWith('/login') ? '/login?confirmed=1' : next
      return NextResponse.redirect(new URL(dest, request.url))
    }
  }

  // Fallback: if we know the email, check if it is already confirmed (scanner prefetch)
  if (email && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const svc = createServiceClient()
      const { data } = await svc.auth.admin.listUsers({ page: 1, perPage: 100 })
      const users: User[] = (data?.users as User[]) || []
      const found = users.find((u) => (u.email || '').toLowerCase() === email.toLowerCase())
      type ConfirmProps = { email_confirmed_at?: string | null; confirmed_at?: string | null }
      const { email_confirmed_at, confirmed_at } = (found ?? {}) as ConfirmProps
      const alreadyConfirmed = Boolean(email_confirmed_at ?? confirmed_at)
      if (alreadyConfirmed) {
        return NextResponse.redirect(new URL('/login?confirmed=1', request.url))
      }
    } catch {
      // ignore and fall through
    }
  }

  return NextResponse.redirect(new URL('/login?error=Invalid verification link', request.url))
}
