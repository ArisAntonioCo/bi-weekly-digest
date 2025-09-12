'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/route-handler'

export type LoginState = {
  error?: string
  success?: boolean
}

export async function login(prevState: LoginState | undefined, formData: FormData): Promise<LoginState> {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error, data: authData } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.error('Login error:', error)
    return { error: 'Invalid credentials' }
  }

  if (!authData?.session) {
    console.error('No session returned from login')
    return { error: 'Login failed' }
  }

  if (authData?.user) {
    // Enforce email confirmation in-app: if user not confirmed, sign out and block login
    const emailConfirmedAt = (authData.user as any).email_confirmed_at
    if (!emailConfirmedAt) {
      await supabase.auth.signOut()
      return { error: 'Please confirm your email before signing in.' }
    }

    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', authData.user.id)
      .single()

    const role = userRole?.role || 'user'
    
    revalidatePath('/', 'layout')
    revalidatePath('/dashboard', 'layout')
    revalidatePath('/admin', 'layout')
    
    if (role === 'admin') {
      redirect('/admin/dashboard')
    } else {
      redirect('/dashboard')
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp({
    ...data,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm?next=%2Flogin`,
    },
  })

  if (error) {
    redirect('/login?error=Signup failed')
  }

  revalidatePath('/', 'layout')
  redirect('/login?checkEmail=1')
}

export async function logout() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    redirect('/login?error=Logout failed')
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}
