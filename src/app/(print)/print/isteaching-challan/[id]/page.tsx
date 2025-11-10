import { createClient } from "@/lib/supabase/server"; // Use standardized custom client
import { notFound, redirect } from "next/navigation";
import PrintChallanClient from "./PrintChallanClient";

// Define minimal required types (removed Promise wrapper from PageProps)
interface PrintIsteachingChallanPageProps {
  params: { id: string };
}

// FIX 1: Make helper function asynchronous and use the standardized client name
async function getIsteachingChallan(id: string) {
  
  // FIX 2: Await the client creation (Resolves the 'auth' and 'from' errors)
  const supabase = await createClient(); 

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const { data: isteachingChallan, error } = await supabase
    .from("isteaching_challans")
    .select(
      `
      *,
      ledgers (
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

  if (error || !isteachingChallan) {
    console.error("Error fetching stitching challan:", error);
    notFound();
  }

  return isteachingChallan;
}

export default async function PrintIsteachingChallanPage({
  params,
}: PrintIsteachingChallanPageProps) {
    // FIX 3: Access ID directly
  const isteachingChallan = await getIsteachingChallan(params.id);

  // FIX 4: Await the client creation again for the second fetch
  const supabase = await createClient(); 
 
  const { data: weaverChallans } = await supabase
    .from("weaver_challans")
    .select("quality_details, batch_number");

  return (
    <PrintChallanClient
      isteachingChallan={isteachingChallan}
      weaverChallans={weaverChallans || []}
    />
  );
}