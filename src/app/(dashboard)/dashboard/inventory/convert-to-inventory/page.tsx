import { ConvertToInventoryContent } from "@/components/inventory/convert-to-inventory-content";
import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/supabase";
import { redirect } from "next/navigation";

// Define a type for the profile object to ensure user_role is known
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ConvertedProfile = Pick<ProfileRow, "id" | "user_role">;

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

  // FIX APPLIED HERE: Convert profile to 'unknown' before casting to ConvertedProfile
  const typedProfile = profile as unknown as ConvertedProfile;

  // FIX 2: Check for profile or missing user_role, then redirect
  if (!profile || !typedProfile.user_role) {
    return redirect("/login");
  }

  // 3. Fetch Challans
  const { data: challans, error } = await supabase
    .from("weaver_challans")
    .select(
      `
            *,
            ledgers (business_name),
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
      // FIX 2 (The final step): Use Non-null Assertion Operator (!)
      // This is safe because we checked if user_role exists on line 36.
      userRole={typedProfile.user_role!}
    />
  );
}
