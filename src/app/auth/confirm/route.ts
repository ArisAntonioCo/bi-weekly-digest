import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/route-handler'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/login'

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

  // redirect the user to an error page with some instructions
  redirect('/login?error=Invalid verification link')
}
