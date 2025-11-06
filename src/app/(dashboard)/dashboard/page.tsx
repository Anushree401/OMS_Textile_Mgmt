// import { createServerSupabaseClient } from '@/lib/supabase/server'
// import { redirect } from 'next/navigation'
// import { DashboardContent } from '@/components/dashboard/dashboard-content'

// export default async function DashboardPage() {
//   const supabase = createServerSupabaseClient()
  
//   const { data: { user } } = await supabase.auth.getUser()
  
//   if (!user) {
//     redirect('/login')
//   }

//   // Get user profile
//   const { data: profile } = await supabase
//     .from('profiles')
//     .select('*')
//     .eq('id', user.id)
//     .single()

//   if (!profile) {
//     redirect('/login')
//   }

//   // Fetch dashboard data in parallel
//   const [
//     { data: products, count: productsCount },
//     { data: ledgers, count: ledgersCount },
//     { data: purchaseOrders, count: purchaseOrdersCount },
//     { data: weaverChallans, count: weaverChallansCount },
//     { data: recentPurchaseOrders },
//     { data: recentWeaverChallans }
//   ] = await Promise.all([
//     // Products stats
//     supabase
//       .from('products')
//       .select('*', { count: 'exact' })
//       .eq('product_status', 'Active'),
    
//     // Ledgers stats
//     supabase
//       .from('ledgers')
//       .select('*', { count: 'exact' }),
    
//     // Purchase Orders stats
//     supabase
//       .from('purchase_orders')
//       .select('*', { count: 'exact' }),
    
//     // Weaver Challans stats
//     supabase
//       .from('weaver_challans')
//       .select('*', { count: 'exact' }),
    
//     // Recent Purchase Orders
//     supabase
//       .from('purchase_orders')
//       .select(`
//         *,
//         ledgers (
//           business_name,
//           contact_person_name
//         )
//       `)
//       .order('created_at', { ascending: false })
//       .limit(5),
    
//     // Recent Weaver Challans
//     supabase
//       .from('weaver_challans')
//       .select(`
//         *,
//         ledgers (
//           business_name,
//           contact_person_name
//         )
//       `)
//       .order('created_at', { ascending: false })
//       .limit(5)
//   ])

//   // Calculate today's stats
//   const today = new Date().toISOString().split('T')[0]
  
//   const { count: todayPurchaseOrders } = await supabase
//     .from('purchase_orders')
//     .select('*', { count: 'exact', head: true })
//     .gte('created_at', today)

//   const { count: todayWeaverChallans } = await supabase
//     .from('weaver_challans')
//     .select('*', { count: 'exact', head: true })
//     .gte('created_at', today)

//   const dashboardData = {
//     stats: {
//       todayOrders: (todayPurchaseOrders || 0) + (todayWeaverChallans || 0),
//       totalOrders: (purchaseOrdersCount || 0) + (weaverChallansCount || 0),
//       totalProducts: productsCount || 0,
//       activeLedgers: ledgersCount || 0,
//       productionBatches: weaverChallansCount || 0
//     },
//     recentPurchaseOrders: recentPurchaseOrders || [],
//     recentWeaverChallans: recentWeaverChallans || []
//   }

//   return <DashboardContent profile={profile} dashboardData={dashboardData} />
// }

// src/app/(dashboard)/dashboard/page.tsx
// Fix for username fetching issue

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = createClient();

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // FIXED: Properly fetch user profile with username
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, username, full_name, role, avatar_url')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('Error fetching profile:', profileError);
  }

  // Use fallback if username is not available
  const displayName = profile?.username || profile?.full_name || user.email?.split('@')[0] || 'User';

  // Fetch dashboard statistics
  const [ordersResult, productsResult, ledgersResult, challansResult] = await Promise.all([
    supabase.from('purchase_orders').select('id, status, created_at', { count: 'exact' }),
    supabase.from('products').select('id', { count: 'exact' }).eq('status', 'active'),
    supabase.from('ledgers').select('id', { count: 'exact' }).eq('status', 'active'),
    supabase.from('weaver_challans').select('id, batch_number, created_at').order('created_at', { ascending: false }).limit(5),
  ]);

  // Get today's orders count
  const today = new Date().toISOString().split('T')[0];
  const { count: todayOrdersCount } = await supabase
    .from('purchase_orders')
    .select('id', { count: 'exact' })
    .gte('created_at', today);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {displayName}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your business today.
          </p>
        </div>
        {profile?.avatar_url && (
          <img
            src={profile.avatar_url}
            alt={displayName}
            className="h-12 w-12 rounded-full object-cover"
          />
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Orders"
          value={todayOrdersCount || 0}
          description="Orders placed today"
        />
        <StatCard
          title="Total Orders"
          value={ordersResult.count || 0}
          description="All time orders"
        />
        <StatCard
          title="Active Products"
          value={productsResult.count || 0}
          description="Products in inventory"
        />
        <StatCard
          title="Active Ledgers"
          value={ledgersResult.count || 0}
          description="Business partners"
        />
      </div>

      {/* Recent Activities */}
      <div className="grid gap-4 md:grid-cols-2">
        <RecentOrdersCard orders={ordersResult.data || []} />
        <RecentChallansCard challans={challansResult.data || []} />
      </div>
    </div>
  );
}

// Helper component for stat cards
function StatCard({ title, value, description }: { title: string; value: number; description: string }) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

// Component stubs for recent activities
function RecentOrdersCard({ orders }: { orders: any[] }) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
      {/* Add your orders list here */}
    </div>
  );
}

function RecentChallansCard({ challans }: { challans: any[] }) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Challans</h3>
      {/* Add your challans list here */}
    </div>
  );
}