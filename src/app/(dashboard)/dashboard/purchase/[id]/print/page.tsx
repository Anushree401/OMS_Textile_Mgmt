import { createClient } from "@/lib/supabase/server"; // Use standardized custom client
import { notFound, redirect } from "next/navigation";
import PrintPageClient from "./PrintPageClient";

// Define minimal required types (removed Promise wrapper from PageProps)
interface PrintPurchaseOrderPageProps {
  params: { id: string };
}

// FIX 1: Make helper function asynchronous and use the standardized client name
async function getPurchaseOrder(id: string) {
  // FIX 2: Await the client creation (Resolves the 'auth' and 'from' errors)
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const { data: purchaseOrder, error } = await supabase
    .from("purchase_orders")
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

  if (error || !purchaseOrder) {
    notFound();
  }

  return purchaseOrder;
}

export default async function PrintPurchaseOrderPage({
  params,
}: PrintPurchaseOrderPageProps) {
  // FIX 3: Pass ID directly (no longer need to resolve a Promise)
  const purchaseOrder = await getPurchaseOrder(params.id);

  return <PrintPageClient purchaseOrder={purchaseOrder} />;
}
