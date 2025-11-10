import { GoodInventoryContent } from "@/components/inventory/good-inventory-content";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function GoodInventoryPage() {
  // FIX 1: Add 'await' to resolve the Supabase client Promise
  const supabase = await createServerSupabaseClient(); 

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
    
  // ⚠️ Note: If this line throws a 'user_role' on 'never' error, 
  // you'll need to use 'profile as any' due to the untyped client.

  if (!profile) {
    redirect("/login");
  }

  // Fetch good inventory items
  const { data: goodInventoryItems, error } = await supabase
    .from("isteaching_challans")
    .select(
      `
      *,
      ledgers (business_name),
      products (product_name, product_description, product_image, product_sku)
    `,
    )
    .eq("inventory_classification", "good")
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching good inventory items:", error);
  }

  return (
    <GoodInventoryContent
      items={goodInventoryItems || []}
      userRole={(profile as any)?.user_role} // Use safe access for userRole
    />
  );
}