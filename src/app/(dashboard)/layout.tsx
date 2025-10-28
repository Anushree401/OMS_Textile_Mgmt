import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  // Create Supabase client using cookies for authentication context
  const supabase = createServerComponentClient({ cookies })

  // Get current authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    redirect('/login')
  }

  return (
    <DashboardLayout profile={profile}>
      {children}
    </DashboardLayout>
  )
}
