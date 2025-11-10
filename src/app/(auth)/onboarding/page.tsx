// src/app/(auth)/onboarding/page.tsx

import { createClient } from "@/lib/supabase/server"; // Correct import path for server client
import { Database } from "@/types/supabase"; // Import the generated Supabase types
import { redirect } from "next/navigation";
import OnboardingForm from "./OnboardingForm";

// Define the expected structure of the 'profiles' row for type safety
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export default async function OnboardingPage() {
  // 1. Initialize Server Supabase Client - FIX APPLIED HERE!
  const supabase = await createClient(); // <<< MUST BE AWAITED

  // 2. Authentication Check (Server-side)
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    // Redirect to login if not authenticated
    return redirect("/login");
  }

  // 3. Profile Existence and Completion Check
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Optional: Log profileError if it's not the expected 'no rows found' error
  if (profileError && profileError.code !== "PGRST116") {
    // PGRST116 is 'No rows returned'
    console.error("Error fetching profile:", profileError.message);
  }

  // Check if the profile exists AND the required fields are marked as completed
  const existingProfile = profile as Profile | null;

  if (existingProfile?.username && existingProfile?.onboarding_completed) {
    // Redirect to dashboard if the profile is complete
    return redirect("/dashboard");
  }

  // 4. Render Onboarding Form if not complete
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <OnboardingForm
        userId={user.id}
        userEmail={user.email ?? undefined}
        // Pass the existing partial profile data to the form
        existingProfile={existingProfile ?? undefined}
      />
    </div>
  );
}
