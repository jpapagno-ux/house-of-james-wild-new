import "server-only";
import { createClient } from "@supabase/supabase-js";

// Service-role Supabase client: SERVER ONLY. Used for the few writes a browser
// must never make — storing a quote's price snapshot, the Airtable sync, and
// advisor decisions. The key lives in Vercel as SUPABASE_SERVICE_ROLE_KEY
// (type: Sensitive) and is never prefixed NEXT_PUBLIC_.
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
