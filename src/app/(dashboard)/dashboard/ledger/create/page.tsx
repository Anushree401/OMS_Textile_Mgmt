import { LedgerForm } from "@/components/ledger/ledger-form";
import { createClient } from "@/lib/supabase/server"; // Use standardized custom client
import { redirect } from "next/navigation";

// Import Database types for safety (assuming this path is correct)
import { Database } from "@/types/supabase";

// Define a type for the profile based on what is selected
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type LedgerCreatorProfile = Pick<ProfileRow, "id" | "user_role">;

export default async function CreateLedgerPage() {
  // FIX 1: Use the standardized function and MUST await it.
  const supabase = await createClient();

  // 1. Authentication Check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Must return redirect() in an async component
    return redirect("/login");
  }

  // 2. Profile Fetch and Role Check (Only fetch necessary fields)
  const { data: profile } = await supabase
    .from("profiles")
    // FIX 2: Select only the role and ID required for the check
    .select("id, user_role")
    .eq("id", user.id)
    .single();

  // Use type assertion after fetch for cleaner access
  const typedProfile = profile as LedgerCreatorProfile | null;

  // 3. Authorization Check
  const allowedRoles = ["Admin", "Manager"];

  // FIX 3: Check if profile is missing OR if the user's role is not allowed
  if (!typedProfile || !allowedRoles.includes(typedProfile.user_role!)) {
    // Use return redirect() and send them to a safe list page
    return redirect("/dashboard/ledger/list");
  }

  // 4. Render Form
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create Ledger</h1>
        <p className="text-gray-600 mt-1">
          Add a new business partner or vendor to your ledger
        </p>
      </div>

      <LedgerForm userId={user.id} isEdit={false} />
    </div>
  );
}
