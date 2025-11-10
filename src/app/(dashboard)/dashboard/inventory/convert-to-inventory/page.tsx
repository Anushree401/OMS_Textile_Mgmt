import { ConvertToInventoryContent } from "@/components/inventory/convert-to-inventory-content";
import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/supabase";
import { redirect } from "next/navigation";

// Define a type for the profile object to ensure user_role is known
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ConvertedProfile = Pick<ProfileRow, "id" | "user_role">;

// *** ASSUMPTION: The correct Foreign Key is 'weaver_challans_vendor_ledger_id_fkey' ***
const LEDGER_RELATIONSHIP_KEY = "ledgers!weaver_challans_vendor_ledger_id_fkey"; 

export default async function ConvertToInventoryPage() {
  const supabase = await createClient();

  // 1. Authentication Check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // 2. Get User Profile and Check for Existence
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, user_role")
    .eq("id", user.id)
    .single();

  const typedProfile = profile as unknown as ConvertedProfile;

  if (!profile || !typedProfile.user_role) {
    return redirect("/login");
  }

  // 3. Fetch Challans
  const { data: challans, error } = await supabase
    .from("weaver_challans")
    .select(
      `
        // FIX: Explicitly specify the Foreign Key relationship name
        *,
        ${LEDGER_RELATIONSHIP_KEY} (business_name), 
        products (product_name, product_description, product_image, product_sku)
      `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching challans:", error);
    // Returning empty array will allow the page to render with an error message
  }

  // 4. Render Content
  return (
    <ConvertToInventoryContent
      challans={challans || []}
      userRole={typedProfile.user_role!}
    />
  );
}