import { ShortingEntryContent } from "@/components/production/shorting-entry-content";
import { createClient } from "@/lib/supabase/server"; // Use standardized custom client
import { redirect } from "next/navigation";
// Import Database type for profile access, assuming path is correct
import { Database } from "@/types/supabase";

// Define profile role type
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type UserRoleProfile = Pick<
  ProfileRow,
  "user_role" | "first_name" | "last_name"
>;

export default async function ShortingEntryPage() {
  // FIX 1: Await the client initialization to resolve the TypeError
  const supabase = await createClient(); // 1. Authentication Check

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  } // 2. Profile Fetch

  const { data: profileRaw } = await supabase
    .from("profiles") // Select fields needed for display name (first_name, last_name)
    .select("first_name, last_name, user_role")
    .eq("id", user.id)
    .single();

  const profile = profileRaw as UserRoleProfile | null;

  if (!profile) {
    return redirect("/login");
  }

  // Guard against missing name data (to prevent runtime errors on template literal)
  const firstName = profile.first_name || "";
  const lastName = profile.last_name || ""; // Fetch ledgers for dropdown

  const { data: ledgers } = await supabase
    .from("ledgers")
    .select("*")
    .order("business_name", { ascending: true }); // Fetch shorting entries

  const { data: shortingEntries } = await supabase
    .from("shorting_entries")
    .select(
      `
      *,
      ledgers ( business_name ),
      weaver_challans ( challan_no )
    `,
    )
    .order("created_at", { ascending: false });

  return (
    <ShortingEntryContent
      ledgers={ledgers || []}
      shortingEntries={shortingEntries || []}
      userId={user.id}
      userName={`${firstName} ${lastName}`}
    />
  );
}
