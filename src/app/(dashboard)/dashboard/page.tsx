// src/app/(dashboard)/dashboard/page.tsx

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
// Assuming this path to your Supabase generated types is correct
import { Database } from "@/types/supabase";

// Define a type for the profile object to satisfy TypeScript,
// ensuring all selected columns are present.
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type DashboardProfile = Pick<
  ProfileRow,
  "id" | "username" | "full_name" | "user_role" | "avatar_url"
>;

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // FIXED: Properly fetch user profile with username
  // Note: TypeScript will still need assurance, handled below.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, username, full_name, user_role, avatar_url")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Error fetching profile:", profileError);
  }

  // Use fallback if username is not available
  // FIX APPLIED: Type-cast the profile data to ensure username/full_name are recognized
  const typedProfile = profile as DashboardProfile | null;

  const displayName =
    typedProfile?.username ||
    typedProfile?.full_name ||
    user.email?.split("@")[0] ||
    "User";

  // Fetch dashboard statistics
  const [ordersResult, productsResult, ledgersResult, challansResult] =
    await Promise.all([
      supabase
        .from("purchase_orders")
        .select("id, status, created_at", { count: "exact" }),
      supabase
        .from("products")
        .select("id", { count: "exact" })
        .eq("status", "active"),
      supabase
        .from("ledgers")
        .select("id", { count: "exact" })
        .eq("status", "active"),
      supabase
        .from("weaver_challans")
        .select("id, batch_number, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  // Get today's orders count
  const today = new Date().toISOString().split("T")[0];
  const { count: todayOrdersCount } = await supabase
    .from("purchase_orders")
    .select("id", { count: "exact" })
    .gte("created_at", today);

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
        {typedProfile?.avatar_url && (
          <img
            src={typedProfile.avatar_url}
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
function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
  description: string;
}) {
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
