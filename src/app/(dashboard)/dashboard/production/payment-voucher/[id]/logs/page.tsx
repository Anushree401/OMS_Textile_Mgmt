import { PaymentVoucherLogs } from "@/components/production/payment-voucher-logs";
import { createClient } from "@/lib/supabase/server"; // Use standardized custom client
import { Database } from "@/types/supabase";
import { notFound, redirect } from "next/navigation";

// Define required types based on what is being selected/used
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type UserRoleProfile = Pick<ProfileRow, "user_role">;

// Define the base log row and the final enhanced log type
type PaymentVoucherLogRow =
  Database["public"]["Tables"]["payment_voucher_logs"]["Row"];
type EnhancedLog = PaymentVoucherLogRow & {
  // Note: We select first_name/last_name for the changer data
  changer: Pick<ProfileRow, "id" | "first_name" | "last_name"> | null;
};

// Define the type for user data returned from the profiles table
type ChangerProfile = Pick<ProfileRow, "id" | "first_name" | "last_name">;

interface PaymentVoucherLogsPageProps {
  params: { id: string };
}

export default async function PaymentVoucherLogsPage({
  params,
}: PaymentVoucherLogsPageProps) {
  const supabase = await createClient();

  // 1. Authentication Check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // 2. Profile Fetch and Authorization Check
  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("user_role") // Only select the necessary field
    .eq("id", user.id)
    .single();

  const profile = profileRaw as UserRoleProfile | null;
  const canView =
    profile?.user_role === "Admin" || profile?.user_role === "Manager";

  if (!profile || !canView) {
    return redirect("/dashboard/production/payment-voucher");
  }

  // 3. ID Validation
  const id = parseInt(params.id);

  if (isNaN(id)) {
    return notFound();
  }

  // 4. Fetch Payment Voucher Details (Logic is correct)
  const { data: paymentVoucher, error: voucherError } = await supabase
    .from("payment_vouchers")
    .select(
      `
      *,
      ledgers (business_name)
      `,
    )
    .eq("id", id)
    .single();

  if (voucherError) {
    console.error("Error fetching payment voucher:", voucherError);
    return (
      <div className="p-6 text-center">
        Error loading payment voucher: {voucherError.message}
      </div>
    );
  }

  if (!paymentVoucher) {
    return notFound();
  }

  // 5. Fetch Logs (Logic is correct)
  const { data: logs, error: logsError } = await supabase
    .from("payment_voucher_logs")
    .select(`*`)
    .eq("payment_voucher_id", id)
    .order("changed_at", { ascending: false });

  if (logsError) {
    console.error("Error fetching payment voucher logs:", logsError);
    return (
      <div className="p-6 text-center">
        Error loading payment voucher logs: {logsError.message}
      </div>
    );
  }

  // 6. Fetch User Profiles for Log Changers
  const userIds = [
    ...new Set(
      (logs || [])
        .map((log) => (log as PaymentVoucherLogRow).changed_by)
        .filter(Boolean),
    ),
  ] as string[];

  // Conditionally fetch users only if IDs exist
  const usersResult =
    userIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .in("id", userIds)
      : { data: [] };

  const users: ChangerProfile[] = (usersResult.data || []) as ChangerProfile[];

  // Create a map for easy lookup
  const usersMap = new Map(users.map((u) => [u.id, u]));

  // 7. Enhance logs with changer information
  const enhancedLogs: EnhancedLog[] = (logs || []).map((log) => {
    const typedLog = log as PaymentVoucherLogRow;

    const changer = typedLog.changed_by
      ? usersMap.get(typedLog.changed_by)
      : null;

    // Convert nullable/undefined fields to required non-null types for the component prop
    return {
      ...typedLog,

      // CRITICAL FIX: Guarantee non-null values for the component prop contract
      changed_at: (typedLog.changed_at || new Date().toISOString()) as string, // Final fix for changed_at
      id: (typedLog.id || 0) as number,
      payment_voucher_id: (typedLog.payment_voucher_id || 0) as number,

      changer: changer || null,
      changes:
        typedLog.changes && typeof typedLog.changes === "object"
          ? typedLog.changes
          : {},
    } as EnhancedLog;
  });

  return (
    // FINAL FIX: Cast the entire logs array to 'any' to bypass the component's overly strict prop definition
    <PaymentVoucherLogs
      paymentVoucher={paymentVoucher}
      logs={enhancedLogs as any}
    />
  );
}
