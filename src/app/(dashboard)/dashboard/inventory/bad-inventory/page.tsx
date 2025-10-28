import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { BadInventoryContent } from '@/components/inventory/bad-inventory-content'

export default async function BadInventoryPage() {
  // Create Supabase client correctly for App Router
  const supabase = createServerComponentClient({ cookies })

  //  Get authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    redirect('/login')
  }

  // Fetch bad inventory
  const { data: badInventoryItems, error: badInvError } = await supabase
    .from('isteaching_challans')
    .select(`
      *,
      ledgers (business_name),
      products (product_name, product_description, product_image, product_sku)
    `)
    .eq('inventory_classification', 'bad')
    .order('date', { ascending: false })

  if (badInvError) {
    console.error('Error fetching bad inventory items:', badInvError)
  }

  return (
    <BadInventoryContent
      items={badInventoryItems || []}
      userRole={profile.user_role}
    />
  )
}
