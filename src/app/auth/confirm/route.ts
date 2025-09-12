import { type EmailOtpType, type User } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/route-handler'
import { createServiceClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/login'
  const email = searchParams.get('email')

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      // If confirming and next points to login, show success
      if (next === '/login' || next.startsWith('/login?')) {
        redirect('/login?confirmed=1')
      }
      // otherwise honor next
      redirect(next)
    }
  }

  // If token invalid, but we have an email, check if the user is already confirmed (common: link scanners consume token)
  if (email) {
    try {
      const svc = createServiceClient()
      const { data } = await svc.auth.admin.listUsers({ page: 1, perPage: 100 })
      const users: User[] = (data?.users as User[]) || []
      const found = users.find((u: User) => (u.email || '').toLowerCase() === email.toLowerCase())
      type ConfirmState = { confirmed_at?: string | null; email_confirmed_at?: string | null }
      const { email_confirmed_at, confirmed_at } = (found ?? {}) as ConfirmState
      const alreadyConfirmed = Boolean(email_confirmed_at ?? confirmed_at)
      if (alreadyConfirmed) {
        redirect('/login?confirmed=1')
      }
    } catch {
      // fall through
    }
  }
  redirect('/login?error=Invalid verification link')
}
