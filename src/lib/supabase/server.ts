import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !supabaseUrl ||
    !supabaseKey ||
    supabaseUrl.includes("your_supabase_project_url")
  ) {
    throw new Error(`
      ❌ Supabase configuration missing!

      Please follow these steps:
      1. Create a Supabase project at https://supabase.com
      2. Update your .env.local file with real credentials
      3. See QUICK_START.md for detailed instructions

      Current URL: ${supabaseUrl || "undefined"}
    `);
  }

  // 👇 cookies() is async in Next 15 — await it here
  const cookieStore = await cookies();

  // 👇 hand the resolved cookie store to Supabase
  return createServerComponentClient({
    cookies: () => cookieStore,
  });
}