import { WastageContent } from "@/components/inventory/wastage-content";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function WastagePage() {
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

    if (!profile) {
        redirect("/login");
    }

    // Fetch wastage items
    const { data: wastageItems, error } = await supabase
        .from("isteaching_challans")
        .select(
            `
            *,
            ledgers (business_name),
            products (product_name, product_description, product_image, product_sku)
        `,
        )
        .eq("inventory_classification", "wastage")
        .order("date", { ascending: false });

    if (error) {
        console.error("Error fetching wastage items:", error);
    }

    return (
        <WastageContent 
            items={wastageItems || []} 
            // FIX 2: Assert profile as 'any' to safely access 'user_role' (to resolve 'never' error)
            userRole={(profile as any).user_role} 
        />
    );
}