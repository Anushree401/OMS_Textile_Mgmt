import { IsteachingChallanContent } from "@/components/production/isteaching-challan-content";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// --- Local Type Definitions to fix ts(7006) errors ---

// Define the structure for the quality_details element (q)
type QualityDetail = { quality_name?: string | null };

// Define the assumed structure for a WeaverChallan item (c) in the map function
type WeaverChallanItem = {
    quality_details: QualityDetail[] | null | undefined;
    batch_number: string;
    // Add other fields used (like vendor_amount, if needed elsewhere)
};

// This type accurately reflects the data returned by the Supabase query,
// acknowledging that weaver_challans is a single object, not an array.
type ShortingEntryWithChallan = {
    quality_name: string | null;
    shorting_qty: number;
    weaver_challan_qty: number;
    weaver_challans: {
        batch_number: string;
    } | null;
};
// --- End Local Type Definitions ---

export default async function IsteachingChallanPage() {
    // Await is already applied here
    const supabase = await createServerSupabaseClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Get user profile
    const { data: fetchedProfile } = await supabase
        .from("profiles")
        .select("user_role") 
        .eq("id", user.id)
        .single();

    // Workaround for untyped client: Assert profile data as 'any'
    const profile = fetchedProfile as any; 

    if (!profile) {
        redirect("/login");
    }

    // Fetch isteaching challans with pagination
    const { data: challans, count } = await supabase
        .from("isteaching_challans")
        .select(
            `
            *,
            ledgers (
                business_name
            ),
            products (
                product_name
            )
        `,
            { count: "exact" },
        )
        .order("created_at", { ascending: false });

    // Fetch ledgers for dropdown
    const { data: ledgers } = await supabase
        .from("ledgers")
        .select("*")
        .order("business_name", { ascending: true });

    // Fetch qualities from weaver_challans
    const { data: fetchedWeaverChallans } = await supabase
        .from("weaver_challans")
        .select("quality_details, batch_number");

    // Workaround for untyped client: Assert weaverChallans data as 'any'
    const weaverChallans = fetchedWeaverChallans as any; 

    // FIX for ts(7006): Explicitly type 'c' and 'q' parameters
    const qualities = weaverChallans
        ? [
              ...new Set(
                  (weaverChallans as WeaverChallanItem[]) // Cast to local type array
                      .flatMap((c: WeaverChallanItem) => // Fix for 'c' implicit any
                          Array.isArray(c.quality_details) ? c.quality_details : [],
                      )
                      .map((q: QualityDetail | null) => q?.quality_name) // Fix for 'q' implicit any
                      .filter(Boolean),
              ),
          ].map((name) => ({ product_name: name as string }))
        : [];

    const { data: products } = await supabase
        .from("products")
        .select("*")
        .eq("product_status", "Active")
        .order("product_name", { ascending: true });

    // Fetch batch numbers from weaver_challans
    const { data: fetchedBatchNumbers } = await supabase
        .from("weaver_challans")
        .select("batch_number, quality_details");

    // Workaround for untyped client: Assert batchNumbers data as 'any'
    const batchNumbers = fetchedBatchNumbers as any;

    // Fetch shorting entries
    const { data: shortingEntries } = await supabase
        .from("shorting_entries")
        .select(
            "quality_name, shorting_qty, weaver_challan_qty, weaver_challans ( batch_number )",
        );

    // Cast the fetched data to our specific type, then filter out any entries
    const formattedShortingEntries =
        (shortingEntries as ShortingEntryWithChallan[] | null)
            ?.filter((e) => e.quality_name && e.weaver_challans?.batch_number)
            .map((e) => ({
                quality_name: e.quality_name!,
                shorting_qty: e.shorting_qty,
                weaver_challan_qty: e.weaver_challan_qty,
                batch_number: e.weaver_challans!.batch_number,
            })) || [];

    return (
        <IsteachingChallanContent
            challans={challans || []}
            totalCount={count || 0}
            ledgers={ledgers || []}
            qualities={qualities || []}
            batchNumbers={batchNumbers || []}
            userRole={profile.user_role}
            products={products || []}
            weaverChallans={weaverChallans || []}
            shortingEntries={formattedShortingEntries}
        />
    );
}