import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

// Client-side (uses the Next.js helper that auto-infers credentials)
export const createBrowserClient = () => createClientComponentClient()

// Server-side (explicitly uses env vars)
export const createServerClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

// Default client for client-side use
export const supabase = createBrowserClient()
export { createClient }
