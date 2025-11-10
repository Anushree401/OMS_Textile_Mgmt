import { WeaverChallanEditForm } from "@/components/production/weaver-challan-edit-form";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server"; // Use standardized client import
import { Database } from "@/types/supabase";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

// --- TYPE DEFINITIONS ---
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type WeaverChallanRow = Database["public"]["Tables"]["weaver_challans"]["Row"];
type LedgerDataRow = Database["public"]["Tables"]["ledgers"]["Row"];

type UserProfile = Pick<ProfileRow, "user_role" | "first_name">;

// Define the shape of the final normalized WeaverChallan object (only required properties listed)
type NormalizedChallan = {
  [K in keyof WeaverChallanRow]: K extends
    | "id"
    | "total_grey_mtr"
    | "fold_cm"
    | "width_inch"
    | "taka"
    | "transport_charge"
    | "vendor_amount"
    ? number // Force numeric types to number
    : K extends "challan_date" | "created_at" | "updated_at"
      ? string // Force dates/timestamps to string
      : K extends "quality_details" | "taka_details"
        ? any // Allow jsonb as any/object
        : string; // Default remaining text fields to string
};

// Define the shape of the normalized AppLedger object
interface AppLedger {
  address: string | null;
  business_logo: string | null;
  business_name: string;
  city: string | null;
  contact_person_name: string | null;
  country: string | null;
  created_at: string;
  created_by: string;
  district: string | null;
  email: string | null;
  gst_number: string | null;
  id: string; // Maps to ledger_id
  ledger_id: string;
  mobile_number: string | null;
  pan_number: string | null;
  state: string | null;
  updated_at: string;
  zip_code: string | null;
}
interface WeaverChallanEditPageProps {
  params: { id: string };
}
// --- END TYPE DEFINITIONS ---

export default async function WeaverChallanEditPage({
  params,
}: WeaverChallanEditPageProps) {
  const supabase = await createClient(); // Use standardized client import
  // 1. Authentication & Authorization Checks

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("user_role, first_name")
    .eq("id", user.id)
    .single();

  const profile = profileRaw as UserProfile | null;
  if (!profile) return redirect("/login");
  if (profile.user_role !== "Admin" && profile.user_role !== "Manager") {
    return redirect("/dashboard/production/weaver-challan");
  } // 2. Main DB fetch

  const { data: rawChallan, error } = await supabase
    .from("weaver_challans")
    .select("*")
    .eq("id", params.id)
    .single();
  if (error || !rawChallan) notFound(); // 3. FIX: Absolute normalization for strict TS and component

  const raw = rawChallan as WeaverChallanRow;

  const weaverChallan: NormalizedChallan = {
    id: raw.id ?? 0,
    challan_date: raw.challan_date ?? new Date().toISOString().split("T")[0],
    batch_number: raw.batch_number ?? "",
    challan_no: raw.challan_no ?? "",
    ms_party_name: raw.ms_party_name ?? "",
    ledger_id: raw.ledger_id ?? "",
    delivery_at: raw.delivery_at ?? "",
    bill_no: raw.bill_no ?? "",
    total_grey_mtr: raw.total_grey_mtr ?? 0,
    fold_cm: raw.fold_cm ?? 0,
    width_inch: raw.width_inch ?? 0,
    taka: raw.taka ?? 0,
    transport_name: raw.transport_name ?? "",
    lr_number: raw.lr_number ?? "",
    transport_charge: raw.transport_charge ?? 0,
    quality_details: raw.quality_details ?? {},
    created_by: raw.created_by ?? "",
    created_at: raw.created_at ?? new Date().toISOString(),
    updated_at: raw.updated_at ?? new Date().toISOString(),
    edit_logs: raw.edit_logs ?? "",
    taka_details: raw.taka_details ?? {},
    vendor_ledger_id: raw.vendor_ledger_id ?? "",
    vendor_invoice_number: raw.vendor_invoice_number ?? "",
    vendor_amount: raw.vendor_amount ?? 0,
    sgst: raw.sgst ?? "",
    cgst: raw.cgst ?? "",
    igst: raw.igst ?? "",
  }; // 4. Ledgers for dropdown

  const { data: ledgersRaw } = await supabase
    .from("ledgers")
    .select("*")
    .order("business_name", { ascending: true }); // FIX: Explicitly map and guarantee required ledger properties

  const ledgers: AppLedger[] = (ledgersRaw ?? []).map((l: LedgerDataRow) => ({
    address: l.address ?? null,
    business_logo: l.business_logo ?? null,
    business_name: l.business_name ?? "",
    city: l.city ?? null,
    contact_person_name: l.contact_person_name ?? null,
    country: l.country ?? null,
    created_at: l.created_at ?? new Date().toISOString(), // Guaranteed string
    created_by: l.created_by ?? "",
    district: l.district ?? null,
    email: l.email ?? null,
    gst_number: l.gst_number ?? null,
    id: l.ledger_id ?? "", // Using ledger_id as 'id' for the component
    ledger_id: l.ledger_id ?? "",
    mobile_number: l.mobile_number ?? null,
    pan_number: l.pan_number ?? null,
    state: l.state ?? null,
    updated_at: l.updated_at ?? new Date().toISOString(), // Guaranteed string
    zip_code: l.zip_code ?? null,
  }));

  return (
    <div className="space-y-6">
           {" "}
      <div className="flex items-center space-x-4">
               {" "}
        <Link href={`/dashboard/production/weaver-challan/${weaverChallan.id}`}>
                   {" "}
          <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />            Back
            to Challan          {" "}
          </Button>
                 {" "}
        </Link>
               {" "}
        <div>
                   {" "}
          <h1 className="text-3xl font-bold text-gray-900">
            Edit Weaver Challan
          </h1>
                 {" "}
        </div>
             {" "}
      </div>
           {" "}
      <WeaverChallanEditForm
        weaverChallan={weaverChallan}
        ledgers={ledgers}
        userId={user.id}
        userName={profile.first_name || "User"}
      />
         {" "}
    </div>
  );
}
