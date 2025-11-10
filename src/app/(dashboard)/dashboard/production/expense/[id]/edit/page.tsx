import { ExpenseForm } from "@/components/production/expense-form";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { Database } from "@/types/database";
import { notFound, redirect } from "next/navigation";

// Define joined expense row type for type safety
type ExpenseRow = Database["public"]["Tables"]["expenses"]["Row"] & {
  ledgers?: { business_name?: string } | null;
  manual_ledgers?: { business_name?: string } | null;
};

interface EditExpensePageProps {
  params: { id: string };
}

export default async function EditExpensePage({
  params,
}: EditExpensePageProps) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // Fetch expense with joined ledgers and safe type assertion
  const { data: expenseRaw, error } = await supabase
    .from("expenses")
    .select(
      `
      *,
      ledgers:ledgers!expenses_ledger_id_fkey ( business_name ),
      manual_ledgers:ledgers!expenses_manual_ledger_id_fkey ( business_name )
    `,
    )
    .eq("id", params.id)
    .single();
  const expense = expenseRaw as ExpenseRow | null;

  if (error || !expense) {
    notFound();
  }

  // Fetch all ledgers
  const { data: ledgers } = await supabase.from("ledgers").select("*");

  return (
    <div className="p-6">
      <ExpenseForm
        ledgers={ledgers || []}
        userId={user.id}
        onSuccessRedirect={`/dashboard/production/expense/${params.id}`}
        expense={expense}
      />
    </div>
  );
}
