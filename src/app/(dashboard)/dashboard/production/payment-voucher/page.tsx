import { PaymentVoucherContent } from "@/components/production/payment-voucher-content";
import { createClient } from "@/lib/supabase/server"; // Use standardized custom client
import { redirect } from "next/navigation";
// Import Database type for profile access, assuming path is correct
import { Database } from "@/types/supabase";

// Define profile role type
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type UserRoleProfile = Pick<ProfileRow, "user_role">;

export default async function PaymentVoucherPage() {
  // FIX: Await the client initialization to resolve the TypeError
  const supabase = await createClient(); // 1. Authentication Check

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  } // 2. Profile Fetch (Needed for userRole)

  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("user_role") // Only select necessary fields
    .eq("id", user.id)
    .single(); // Assert type for safer access

  const profile = profileRaw as UserRoleProfile | null;

  if (!profile) {
    return redirect("/login");
  } // 3. Fetch payment vouchers with ledger details

  const { data: paymentVouchers, count } = await supabase
    .from("payment_vouchers")
    .select(
      `
      *,
      ledgers (
        business_name,
        business_logo
      )
    `,
      { count: "exact" },
    )
    .order("created_at", { ascending: false }); // 4. Fetch ledgers for dropdown

  const { data: ledgers } = await supabase.from("ledgers").select("*"); // 5. Fetch stitching challans

  const { data: stitchingChallans } = await supabase
    .from("isteaching_challans")
    .select("*"); // 6. Render Content

  return (
    <PaymentVoucherContent
      userId={user.id}
      ledgers={ledgers || []}
      userRole={profile.user_role!}
      paymentVouchers={paymentVouchers || []}
      totalCount={count || 0}
      stitchingChallans={stitchingChallans || []}
    />
  );
}
