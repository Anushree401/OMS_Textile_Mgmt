import { ShortingContent } from "@/components/inventory/shorting-content";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ShortingPage() {
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

    // Fetch shorting items
    const { data: shortingItems, error } = await supabase
        .from("isteaching_challans")
        .select(
            `
            *,
            ledgers (business_name),
            products (product_name, product_description, product_image, product_sku)
        `,
        )
        .eq("inventory_classification", "shorting")
        .order("date", { ascending: false });

    if (error) {
        console.error("Error fetching shorting items:", error);
    }

    return (
        <ShortingContent 
            items={shortingItems || []} 
            // FIX 2: Assert profile as 'any' to safely access 'user_role' (to resolve 'never' error)
            userRole={(profile as any).user_role} 
        />
    );
}