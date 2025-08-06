'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/route-handler'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error, data: authData } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?error=Invalid credentials')
  }

  // Check user role and redirect accordingly
  if (authData?.user) {
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', authData.user.id)
      .single()

    const role = userRole?.role || 'user'
    
    revalidatePath('/', 'layout')
    
    if (role === 'admin') {
      redirect('/admin/dashboard')
    } else {
      redirect('/dashboard')
    }
  }

  // Fallback redirect
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/login?error=Signup failed')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
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