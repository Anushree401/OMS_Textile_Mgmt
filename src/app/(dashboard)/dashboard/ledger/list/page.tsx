import { LedgersContent } from "@/components/ledger/ledgers-content";
import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/supabase";
import { PostgrestResponse } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type LedgerDataRow = Database["public"]["Tables"]["ledgers"]["Row"];
type CreatorProfile = { id: string; email: string }; // Only select these columns!
type FinalLedgerRow = Omit<LedgerDataRow, "created_at" | "updated_at"> & {
  created_at: string;
  updated_at: string;
  profiles: { email: string } | null;
};
type FinalLedgersArray = FinalLedgerRow[];
type LedgerProfile = Pick<ProfileRow, "id" | "user_role" | "email">;

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

// Helper: Map all required string fields for strict type
function toFinalLedgerRow(
  ledger: LedgerDataRow,
  profileData: CreatorProfile | undefined,
): FinalLedgerRow {
  return {
    ...ledger,
    created_at: ledger.created_at ?? new Date().toISOString(),
    updated_at: ledger.updated_at ?? new Date().toISOString(),
    business_name: ledger.business_name ?? "",
    pan_number: ledger.pan_number ?? "",
    address: ledger.address ?? "",
    city: ledger.city ?? "",
    country: ledger.country ?? "",
    contact_person_name: ledger.contact_person_name ?? "",
    district: ledger.district ?? "",
    email: ledger.email ?? "",
    gst_number: ledger.gst_number ?? "",
    ledger_id: ledger.ledger_id ?? "",
    mobile_number: ledger.mobile_number ?? "",
    business_logo: ledger.business_logo ?? "",
    state: ledger.state ?? "",
    zip_code: ledger.zip_code ?? "",
    profiles: profileData ? { email: profileData.email } : null,
  };
}

export default async function LedgersListPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const params = searchParams;

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  // User role check
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_role")
    .eq("id", user.id)
    .single();
  const typedProfile = profile as LedgerProfile | null;
  if (!typedProfile) return redirect("/login");

  // Filtering and pagination
  const page = parseInt(params.page as string) || 1;
  const limit = 25;
  const offset = (page - 1) * limit;
  const searchQuery = params.search ? String(params.search) : "";
  const state = params.state ? String(params.state) : "";
  const city = params.city ? String(params.city) : "";
  const fromDate = params.fromDate ? String(params.fromDate) : "";
  const toDate = params.toDate ? String(params.toDate) : "";

  let query = supabase.from("ledgers").select("*", { count: "exact" });
  if (searchQuery) {
    query = query.or(
      `business_name.ilike.%${searchQuery}%,ledger_id.ilike.%${searchQuery}%,contact_person_name.ilike.%${searchQuery}%`,
    );
  }
  if (state) query = query.eq("state", state);
  if (city) query = query.eq("city", city);
  if (fromDate) query = query.gte("created_at", fromDate);
  if (toDate) query = query.lte("created_at", `${toDate}T23:59:59.999Z`);

  const result: PostgrestResponse<LedgerDataRow> = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const ledgersData = (result.data as LedgerDataRow[]) || [];
  const count = result.count;

  // correct creator profiles fetch/casting
  const creatorIds = ledgersData
    .map((ledger) => ledger.created_by)
    .filter(Boolean) as string[];
  const profilesData: CreatorProfile[] =
    creatorIds.length > 0
      ? ((
          await supabase
            .from("profiles")
            .select("id, email")
            .in("id", creatorIds)
        ).data as CreatorProfile[]) || []
      : [];

  // Map all ledgers for component, fixing all nullable string fields!
  const ledgers: FinalLedgersArray = ledgersData.map((ledger) => {
    const profileData = profilesData.find((p) => p.id === ledger.created_by);
    return toFinalLedgerRow(ledger, profileData);
  });

  return (
    <LedgersContent
      ledgers={ledgers}
      totalCount={count || 0}
      userRole={typedProfile.user_role!}
    />
  );
}
