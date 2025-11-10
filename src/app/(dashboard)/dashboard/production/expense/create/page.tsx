import { ExpenseForm } from "@/components/production/expense-form";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { Database } from "@/types/database";
import { redirect } from "next/navigation";

type Ledger = Database["public"]["Tables"]["ledgers"]["Row"];

export default async function CreateExpensePage() {
  const supabase = await createServerSupabaseClient(); // Await client

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const { data: ledgers } = await supabase.from("ledgers").select("*");

  return (
    <div className="p-6">
      <ExpenseForm
        ledgers={ledgers ?? []} // Handles null ledgers case
        userId={user.id}
        onSuccessRedirect="/dashboard/production/expense"
      />
    </div>
  );
}
