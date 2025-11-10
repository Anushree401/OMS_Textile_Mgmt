import { PaymentVoucherView } from "@/components/production/payment-voucher-view";
import { createClient } from "@/lib/supabase/server"; // Use standardized custom client
import { Database } from "@/types/supabase"; // Import Database for typing
import { notFound, redirect } from "next/navigation";

// --- TYPE DEFINITIONS ---
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type PaymentVoucherRow =
  Database["public"]["Tables"]["payment_vouchers"]["Row"];
type LedgerRow = Database["public"]["Tables"]["ledgers"]["Row"];

// Define types for the joined data structure
type LedgerJoin = Pick<
  LedgerRow,
  | "business_name"
  | "business_logo"
  | "contact_person_name"
  | "mobile_number"
  | "email"
  | "address"
  | "city"
  | "state"
  | "country"
  | "zip_code"
  | "gst_number"
>;

// FIX 1: Define the full fetched structure, ensuring created_by is known
type PaymentVoucherWithLedgersRaw = Omit<PaymentVoucherRow, "ledgers"> & {
  ledgers: LedgerJoin;
  created_by: string | null;
};

// FIX 2: Define the FINAL structure required by the component (guaranteeing non-null strings for date/time)
type FinalPaymentVoucher = Omit<
  PaymentVoucherWithLedgersRaw,
  "created_at" | "updated_at"
> & {
  created_at: string; // GUARANTEED NON-NULL
  updated_at: string; // Assuming updated_at is also expected as non-null string
  creator: CreatorProfile | null;
};

type CreatorProfile = Pick<ProfileRow, "first_name" | "last_name">;
type UserRoleProfile = Pick<ProfileRow, "user_role">;

interface PaymentVoucherDetailPageProps {
  params: { id: string };
}
// --- END TYPE DEFINITIONS ---

export default async function PaymentVoucherDetailPage({
  params,
}: PaymentVoucherDetailPageProps) {
  // Must await the custom client initialization
  const supabase = await createClient(); // 1. Authentication Check

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  } // 2. Fetch Profile for Role

  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("user_role")
    .eq("id", user.id)
    .single(); // Assert type for role check

  const profile = profileRaw as UserRoleProfile | null;

  if (!profile) {
    return redirect("/login");
  } // 3. ID Validation

  const id = parseInt(params.id);
  if (isNaN(id)) {
    return notFound();
  } // 4. Fetch the payment voucher and join ledgers

  const { data: voucherRaw, error: voucherError } = await supabase
    .from("payment_vouchers")
    .select(
      `
      *,
      ledgers (
        business_name,
        business_logo,
        contact_person_name,
        mobile_number,
        email,
        address,
        city,
        state,
        country,
        zip_code,
        gst_number
      )
    `,
    )
    .eq("id", id)
    .single();

  if (voucherError) {
    console.error("Error fetching payment voucher:", voucherError);
    return (
      <div className="p-6 text-center">
                Error loading payment voucher: {voucherError.message}     {" "}
      </div>
    );
  } // Cast the raw fetched result to the defined raw structure

  const paymentVoucherRaw = voucherRaw as PaymentVoucherWithLedgersRaw | null;

  if (!paymentVoucherRaw) {
    return notFound();
  } // 5. Fetch creator profile separately

  let creatorProfile: CreatorProfile | null = null;
  if (paymentVoucherRaw.created_by) {
    const { data: dataRaw, error: profileError } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", paymentVoucherRaw.created_by)
      .single();

    if (!profileError && dataRaw) {
      creatorProfile = dataRaw as CreatorProfile;
    }
  } // 6. Merge and Finalize the Payment Voucher data
  // FIX 3: Convert potentially null dates to guaranteed strings

  const paymentVoucherWithCreator: FinalPaymentVoucher = {
    ...paymentVoucherRaw,
    creator: creatorProfile, // Ensure created_at and updated_at are treated as strings
    created_at: paymentVoucherRaw.created_at || new Date().toISOString(),
    updated_at: paymentVoucherRaw.updated_at || new Date().toISOString(),
  }; // 7. Render view

  return (
    <PaymentVoucherView
      paymentVoucher={paymentVoucherWithCreator as any} // Cast to any as final escape hatch
      userRole={profile.user_role!}
      userId={user.id}
    />
  );
}
