import { PaymentVoucherEditForm } from "@/components/production/payment-voucher-edit-form";
import { createClient } from "@/lib/supabase/server"; // Use standardized client import
import { notFound, redirect } from "next/navigation";

// FIX 1: Import Database and define the minimal required type
import { Database } from "@/types/supabase";
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type UserRoleProfile = Pick<ProfileRow, "user_role">; // Only need user_role for the check

interface PaymentVoucherEditPageProps {
  params: { id: string };
}

export default async function PaymentVoucherEditPage({
  params,
}: PaymentVoucherEditPageProps) {
  // Must await the custom client initialization
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  } // FIX 2: Only select the required field: user_role

  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("user_role")
    .eq("id", user.id)
    .single();

  // FIX 3: Cast the result to guarantee the type for the check
  const profile = profileRaw as UserRoleProfile | null; // Check if profile exists and if user has permission to edit

  const canEdit =
    profile?.user_role === "Admin" || profile?.user_role === "Manager";

  if (!profile) {
    return redirect("/login");
  }

  if (!canEdit) {
    return redirect("/dashboard/production/payment-voucher");
  } // Access ID directly from params object (Next.js standard)

  const id = parseInt(params.id);
  if (isNaN(id)) {
    return notFound();
  } // Fetch the specific payment voucher

  const { data: paymentVoucher, error } = await supabase
    .from("payment_vouchers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching payment voucher:", error);
    return (
      <div className="p-6 text-center">
        Error loading payment voucher: {error.message}
      </div>
    );
  }

  if (!paymentVoucher) {
    return notFound();
  } // Fetch ledgers (assuming this data is needed by the form)

  const { data: ledgers } = await supabase.from("ledgers").select("*");

  return (
    <PaymentVoucherEditForm
      paymentVoucher={paymentVoucher}
      ledgers={ledgers || []}
      userId={user.id}
    />
  );
}
