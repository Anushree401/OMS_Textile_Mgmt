import { UserForm } from "@/components/users/user-form";
import { createClient } from "@/lib/supabase/server"; // Use standardized custom client
import { redirect } from "next/navigation";
// Import Database for typing safety
import { Database } from '@/types/supabase';

// Define minimal required type for the profile check
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type CurrentProfile = ProfileRow; 


export default async function CreateUserPage() {
  // FIX 1: Await the client initialization to resolve TypeError
  const supabase = await createClient();

  // 1. Authentication Check
  const {
    data: { user },
  } = await supabase.auth.getUser(); // Line 10 error resolved

  if (!user) {
    return redirect("/login");
  }

  // 2. Get user profile (for Admin check)
  const { data: profileRaw } = await supabase // Line 18 error resolved
    .from("profiles")
    .select("user_role") // Only select the necessary field
    .eq("id", user.id)
    .single();

  const profile = profileRaw as CurrentProfile | null;

  // 3. Authorization Check: Only Admin can create users
  if (!profile || profile.user_role !== "Admin") {
    return redirect("/dashboard/users/manage");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create User</h1>
        <p className="text-gray-600 mt-1">
          Create a new user account with role-based access
        </p>
      </div>

      <UserForm />
    </div>
  );
}