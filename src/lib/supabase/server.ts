// src/lib/supabase/server.ts

import { Database } from "@/types/supabase"; // Assuming this import is correct
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

// Use a descriptive name if you are switching from the old one, e.g., createServerSupabaseClient
// The function must be async because it uses await internally.
export const createClient = async () => {
  // FIX APPLIED HERE: Await the cookies() function
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // Or NEXT_PUBLIC_SUPABASE_ANON_KEY! for standard auth checks
    {
      cookies: {
        get(name: string) {
          // No change needed here, it uses the awaited cookieStore
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // This error is sometimes logged due to redirects; it can often be ignored
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // This error is sometimes logged due to redirects; it can often be ignored
          }
        },
      },
    },
  );
};
