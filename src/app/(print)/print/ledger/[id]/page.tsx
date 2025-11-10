import { createClient } from "@/lib/supabase/server"; // Use standardized custom client
import { notFound, redirect } from "next/navigation";
import PrintLedgerClient from "./PrintLedgerClient";

// Define minimal required types
interface PrintLedgerPageProps {
  params: { id: string };
}

// FIX 1: Make helper function asynchronous
async function getLedgerData(id: string) {
  
  // FIX 2: Await the client creation (Resolves the 'auth' and 'from' errors)
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // Fetch ledger details
  const { data: ledger, error } = await supabase
    .from("ledgers")
    .select("*")
    .eq("ledger_id", id)
    .single();

  if (error || !ledger) {
    notFound();
  }

  // Fetch related transactions for passbook
  const { data: challans } = await supabase
    .from("weaver_challans")
    .select(
      "challan_no, challan_date, transport_charge, vendor_amount, sgst, cgst, igst",
    )
    .eq("ledger_id", id);

  const { data: paymentVouchers } = await supabase
    .from("payment_vouchers")
    .select("id, date, payment_for, payment_type, amount")
    .eq("ledger_id", id);

  return {
    ledger,
    challans: challans || [],
    paymentVouchers: paymentVouchers || [],
  };
}

export default async function PrintLedgerPage({
  params,
}: PrintLedgerPageProps) {
    // FIX 3: Access ID directly (no longer need to resolve a Promise)
  const ledgerData = await getLedgerData(params.id);

  return <PrintLedgerClient ledgerData={ledgerData} />;
}