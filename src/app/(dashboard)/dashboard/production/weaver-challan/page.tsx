import { WeaverChallanContent } from "@/components/production/weaver-challan-content";
import { createClient } from "@/lib/supabase/server"; // Use standardized custom client
import { redirect } from "next/navigation";
// Import Database type for profile access, assuming path is correct
import { Database } from "@/types/supabase";

// Define profile role type
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type UserProfile = Pick<ProfileRow, "user_role" | "first_name" | "last_name">;

export default async function WeaverChallanPage() {
  // FIX: Await the client initialization to resolve the TypeError
  const supabase = await createClient(); // 1. Authentication Check

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  } // 2. Get user profile

  const { data: profileRaw } = await supabase
    .from("profiles") // Select fields needed for display name
    .select("first_name, last_name, user_role")
    .eq("id", user.id)
    .single(); // Assert type for safer access

  const profile = profileRaw as UserProfile | null;

  if (!profile) {
    return redirect("/login");
  } // 3. Fetch weaver challans with ledger details

  const { data: challans, count } = await supabase
    .from("weaver_challans")
    .select(
      `
      *,
      ledgers:ledgers!weaver_challans_ledger_id_fkey (
        business_name,
        contact_person_name
      )
    `,
      { count: "exact" },
    )
    .order("created_at", { ascending: false }); // 4. Fetch ledgers for dropdown

  const { data: ledgers } = await supabase
    .from("ledgers")
    .select("*")
    .order("business_name", { ascending: true }); // 5. Render Content

  return (
    <WeaverChallanContent
      challans={challans || []}
      totalCount={count || 0}
      ledgers={ledgers || []}
      userRole={profile.user_role!}
      userId={user.id}
      userName={`${profile.first_name} ${profile.last_name}`}
    />
  );
}
