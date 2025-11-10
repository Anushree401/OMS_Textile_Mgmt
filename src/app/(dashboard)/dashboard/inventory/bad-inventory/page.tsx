import { BadInventoryContent } from "@/components/inventory/bad-inventory-content";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server"; // Use your client
import { redirect } from "next/navigation";

export default async function BadInventoryPage() {
    // FIX: Use your shared utility client and AWAIT it.
    const supabase = await createServerSupabaseClient();

    //  Get authenticated user
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        redirect("/login");
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (profileError || !profile) {
        redirect("/login");
    }

    // Fetch bad inventory
    const { data: badInventoryItems, error: badInvError } = await supabase
        .from("isteaching_challans")
        .select(
            `
            *,
            ledgers (business_name),
            products (product_name, product_description, product_image, product_sku)
        `,
        )
        .eq("inventory_classification", "bad")
        .order("date", { ascending: false });

    if (badInvError) {
        console.error("Error fetching bad inventory items:", badInvError);
    }

    return (
        <BadInventoryContent
            items={badInventoryItems || []}
            // ✅ FIX: Assert profile as 'any' to access 'user_role' and suppress the 'never' error
            userRole={(profile as any).user_role} 
        />
    );
}