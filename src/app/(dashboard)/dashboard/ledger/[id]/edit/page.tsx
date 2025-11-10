import { LedgerForm } from "@/components/ledger/ledger-form";
import { Button } from "@/components/ui/button";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { Database } from "@/types/supabase";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

// Types from generated Supabase types
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type LedgerRow = Database["public"]["Tables"]["ledgers"]["Row"];

// Helper: convert all required fields to non-null
function cleanupLedger(row: LedgerRow) {
  return {
    ...row,
    created_at: row.created_at ?? new Date().toISOString(),
    pan_number: row.pan_number ?? "", // If your form allows null, leave as is.
    business_name: row.business_name ?? "",
    address: row.address ?? "",
    business_logo: row.business_logo ?? "",
    city: row.city ?? "",
    contact_person_name: row.contact_person_name ?? "",
    country: row.country ?? "",
    district: row.district ?? "",
    edit_logs: row.edit_logs ?? "",
    email: row.email ?? "",
    gst_number: row.gst_number ?? "",
    ledger_id: row.ledger_id ?? "",
    mobile_number: row.mobile_number ?? "",
    state: row.state ?? "",
    updated_at: row.updated_at ?? new Date().toISOString(),
    zip_code: row.zip_code ?? "",
    // Add any other `string | null` field here, converting to "" or a safe default
  };
}

interface LedgerEditPageProps {
  params: { id: string };
}

export default async function LedgerEditPage({ params }: LedgerEditPageProps) {
  const { id } = params;
  const supabase = await createServerSupabaseClient();

  // Fetch current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  // Fetch profile for user
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = profileData as ProfileRow | null;
  if (profileError || !profile) {
    redirect("/login");
  }

  // Only allow Admin or Manager
  if (profile.user_role !== "Admin" && profile.user_role !== "Manager") {
    redirect("/dashboard/ledger/list");
  }

  // Fetch ledger by id
  const { data: ledgerData, error: ledgerError } = await supabase
    .from("ledgers")
    .select("*")
    .eq("ledger_id", id)
    .single();

  const ledgerRaw = ledgerData as LedgerRow | null;
  if (ledgerError || !ledgerRaw) {
    notFound();
  }

  // Safe for LedgerForm: all required string fields are guaranteed to be string
  const ledger = cleanupLedger(ledgerRaw);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href={`/dashboard/ledger/${ledger.ledger_id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Ledger
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Ledger</h1>
          <p className="text-gray-600 mt-1">
            Update business partner information
          </p>
        </div>
      </div>
      <LedgerForm userId={user.id} ledger={ledger} isEdit={true} />
    </div>
  );
}
