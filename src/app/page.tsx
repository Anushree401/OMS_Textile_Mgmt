import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// FIX: Renamed the imported function to match your custom client
// and ensured it is correctly awaited.
export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // User is authenticated, redirect to the main protected area
    return redirect("/dashboard");
  } else {
    // User is not authenticated, send them to the login/signup gateway
    // We are no longer using an unconditional redirect inside a client router,
    // which prevents the loop.
    return redirect("/login");
  }
}
