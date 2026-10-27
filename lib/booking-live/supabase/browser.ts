"use client";
import { createBrowserClient } from "@supabase/ssr";

// Browser client, used only for the sign-in form (sending the magic link).
// Everything else goes through the versioned /api/v1 routes.
export function supabaseBrowser() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}
