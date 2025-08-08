import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { LandingPage } from './_sections/landing-page'

export default async function Page() {
  const supabase = await createClient()
  
  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    // Check user role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()
    
    // Redirect based on role
    if (roleData?.role === 'admin') {
      redirect('/admin/dashboard')
    } else {
      redirect('/dashboard')
    }
  }

  return <LandingPage />
}
