// src/middleware.ts

import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"; // Or @supabase/ssr
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // 1. Create a Supabase client configured to refresh the session
  const supabase = createMiddlewareClient({ req, res });

  // 2. Refresh the session. This reads the auth cookie and writes a fresh one.
  //    This action is crucial for keeping the session alive and accessible.
  await supabase.auth.getSession();

  // 3. Pass the response back.
  //    Any redirection logic (like checking for /login or /onboarding) should now be in the Server Components (page.tsx/layout.tsx).
  return res;
}

// Only run the middleware on routes you want to handle session refreshing for
export const config = {
  // Use a matcher that covers all routes where you need the session refreshed.
  // If you only have auth on the dashboard, this is fine.
  matcher: ["/", "/login", "/signup", "/dashboard/:path*", "/onboarding"],
};
