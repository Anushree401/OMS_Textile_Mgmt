import { UsersContent } from "@/components/users/users-content";
import { createClient } from "@/lib/supabase/server"; // Use standardized custom client
import { redirect } from "next/navigation";
// Import Database type for profile access, assuming path is correct
import { Database } from '@/types/supabase';

// Define required profile type
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type CurrentProfile = ProfileRow; 

export default async function ManageUsersPage() {
  // FIX: Await the client initialization to resolve TypeError
  const supabase = await createClient();

  // 1. Authentication Check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // 2. Get user profile (for Admin check)
  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("user_role") // Only select the necessary field for the check
    .eq("id", user.id)
    .single();

  const profile = profileRaw as CurrentProfile | null;

  // 3. Authorization Check: Only Admin can manage users
  if (!profile || profile.user_role !== "Admin") {
    return redirect("/dashboard");
  }

  // 4. Fetch all users (Admin only)
  const { data: users, count } = await supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  // 5. Render Content
  return (
    <UsersContent
      users={users || []}
      totalCount={count || 0}
      currentUserId={user.id}
    />
  );
}