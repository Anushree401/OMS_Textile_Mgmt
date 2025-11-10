import { createClient } from "@/lib/supabase/server"; // Use standardized custom client
import { notFound } from "next/navigation";
// FIX 1: Use absolute path for centralized component directory
import BarcodeChallanClient from "@/components/production/barcode/BarcodeChallanClient";

// Define minimal required types
interface BarcodeChallanPageProps {
  params: { id: string }; // FIX 2: Simplify params structure (no Promise wrapper)
}

export default async function BarcodeChallanPage({
  params,
}: BarcodeChallanPageProps) {
  
  // FIX 3: Await the client initialization
  const supabase = await createClient();

  // We don't strictly need user auth, but if data is RLS protected, auth is required.
  // Assuming the user is already authenticated via middleware/layout for print routes.

  // Fetch the stitching challan with related data
  const { data: isteachingChallan, error } = await supabase
    .from("isteaching_challans")
    .select(
      `
      *,
      ledgers (*)
    `,
    )
    .eq("id", params.id) // Use params.id directly
    .single();

  if (error || !isteachingChallan) {
    console.error("Error fetching stitching challan:", error);
    notFound();
  }

  // Fetch related weaver challans for batch details
  const { data: weaverChallans } = await supabase
    .from("weaver_challans")
    .select("quality_details, batch_number");

  return (
    <BarcodeChallanClient
      isteachingChallan={isteachingChallan}
      weaverChallans={weaverChallans || []}
    />
  );
}