import { redirect } from "next/navigation";

// FIX 1: Import your custom ASYNCHRONOUS server client
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { createClient } from "@/lib/supabase/server";

// Note: The 'cookies' and 'createServerComponentClient' imports are no longer needed
// because they are handled internally by your custom createClient function.

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // FIX 2: Initialize Supabase using await with your custom client
  const supabase = await createClient();

  // Get current authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    // Must return redirect() in an async component
    return redirect("/login");
  }

  // Get user profile
  // Note: We should fetch only necessary fields or handle type safety if needed here.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    // If profile is missing (e.g., new user), send them to onboarding instead of login
    // If you don't have an onboarding page, /login is a safe fallback.
    // Assuming you have an onboarding page based on prior context:
    return redirect("/onboarding");
  }

  return <DashboardLayout profile={profile}>{children}</DashboardLayout>;
}
