import { createClient } from "@/lib/supabase/server"; // Use standardized custom client
import { notFound, redirect } from "next/navigation";
import PrintChallanClient from "./PrintChallanClient";

// Define minimal required types
interface PrintWeaverChallanPageProps {
  params: { id: string };
}

// FIX 1: Make helper function asynchronous and use the standardized client name
async function getWeaverChallan(id: string) {
  
  // FIX 2: Await the client creation (Resolves the 'auth' and 'from' errors)
  const supabase = await createClient(); 

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const { data: weaverChallan, error } = await supabase
    .from("weaver_challans")
    .select(
      `
      *,
      ledgers:ledgers!weaver_challans_ledger_id_fkey (
        business_name,
        contact_person_name,
        mobile_number,
        email,
        address,
        city,
        district,
        state,
        zip_code,
        gst_number
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error || !weaverChallan) {
    notFound();
  }

  return weaverChallan;
}

export default async function PrintWeaverChallanPage({
  params,
}: PrintWeaverChallanPageProps) {
    // FIX 3: Access ID directly (no longer need to resolve a Promise)
  const weaverChallan = await getWeaverChallan(params.id);

  return <PrintChallanClient weaverChallan={weaverChallan} />;
}