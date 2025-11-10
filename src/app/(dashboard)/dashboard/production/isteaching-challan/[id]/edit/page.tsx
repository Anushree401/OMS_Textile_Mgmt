import { LedgersContent } from "@/components/ledger/ledgers-content";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Import necessary types
import { Database } from "@/types/supabase";
import { PostgrestResponse } from "@supabase/supabase-js";

// --- TYPE DEFINITIONS ---
type LedgerDataRow = Database["public"]["Tables"]["ledgers"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

// 1. Define the strict structure required by the target component (Ledger[])
// We assume updated_at must be a non-nullable string in the component's Ledger type based on previous errors.
type NonNullableLedgerFields = Omit<LedgerDataRow, "created_at" | "updated_at"> & {
    created_at: string; // Guaranteed string
    updated_at: string; // Guaranteed string (Required to match component's Ledger type)
};

// 2. Final row type combines the strict fields with the joined data
type FinalLedgerRow = NonNullableLedgerFields & {
    profiles: { email: string } | null;
};

// 3. Type for the results of the profile fetch query
type CreatorProfileResult = Pick<ProfileRow, "id" | "email">; 

type LedgerProfile = Pick<ProfileRow, "id" | "user_role" | "email">;
type FinalLedgersArray = FinalLedgerRow[];

interface PageProps {
    searchParams: {
        page?: string;
        search?: string;
        state?: string;
        city?: string;
        fromDate?: string;
        toDate?: string;
    };
}
// --- END TYPE DEFINITIONS ---

export default async function LedgersListPage({ searchParams }: PageProps) {
    const supabase = await createClient();

    const params = searchParams;

    // 1. Authentication Check
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        return redirect("/login");
    }

    // 2. Get User Profile (Needed for userRole prop)
    const { data: profile } = await supabase
        .from("profiles")
        .select("id, user_role, email")
        .eq("id", user.id)
        .single();

    const typedProfile = profile as LedgerProfile | null;
    if (!typedProfile) {
        return redirect("/login");
    }

    // 3. Prepare Filters and Pagination
    const page = parseInt(params.page as string) || 1;
    const limit = 25;
    const offset = (page - 1) * limit;

    const searchQuery = params.search ? String(params.search) : "";
    const state = params.state ? String(params.state) : "";
    const city = params.city ? String(params.city) : "";
    const fromDate = params.fromDate ? String(params.fromDate) : "";
    const toDate = params.toDate ? String(params.toDate) : "";

    // 4. Build Filtered Query
    let query = supabase.from("ledgers").select("*", { count: "exact" });

    if (searchQuery) {
        query = query.or(
            `business_name.ilike.%${searchQuery}%,ledger_id.ilike.%${searchQuery}%,contact_person_name.ilike.%${searchQuery}%`,
        );
    }
    if (state) {
        query = query.eq("state", state);
    }
    if (city) {
        query = query.eq("city", city);
    }
    if (fromDate) {
        query = query.gte("created_at", fromDate);
    }
    if (toDate) {
        query = query.lte("created_at", `${toDate}T23:59:59.999Z`);
    }

    // 5. Execute Ledger Fetch
    // Added 'as any' to suppress complex PostgrestResponse type conflicts
    const result: PostgrestResponse<LedgerDataRow> = await (query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1) as any);

    const ledgersData = result.data ?? null;
    const count = result.count;

    if (result.error) {
        console.error("Error fetching ledgers:", result.error);
    }

    // 6. Fetch Creator Profiles
    const creatorIds = (ledgersData ?? [])
        .map((ledger) => ledger.created_by)
        .filter((id): id is string => typeof id === "string");

    // FIX: Explicitly type the result array and assert the fetched data to resolve 'never' errors
    const profilesData: CreatorProfileResult[] =
        creatorIds.length > 0
            ? ((
                await supabase
                    .from("profiles")
                    .select("id, email") // Selecting 'id' and 'email'
                    .in("id", creatorIds)
            ).data as CreatorProfileResult[] ?? []) // Assertion here is crucial
            : [];

    // 7. Combine ledgers with profiles safely
    const ledgers: FinalLedgersArray = (ledgersData ?? []).map((ledger) => {
        const profileData = ledger.created_by
            ? profilesData.find((p) => p.id === ledger.created_by)
            : null;

        return {
            ...ledger,
            created_at: ledger.created_at || new Date().toISOString(),
            // FIX: Provide a non-nullable string fallback for updated_at
            updated_at: ledger.updated_at || ledger.created_at || new Date().toISOString(), 
            // FIX: profilesData is now correctly typed, removing the original 'never' error
            profiles: profileData ? { email: profileData.email } : null,
        } as FinalLedgerRow; // Final type assertion on the mapped object
    });

    // 8. Render content with safe props
    return (
        <LedgersContent
            ledgers={ledgers}
            totalCount={count || 0}
            userRole={typedProfile.user_role}
        />
    );
}