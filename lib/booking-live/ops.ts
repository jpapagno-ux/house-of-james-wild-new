import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

// House-side checks shared by the /api/v1/ops routes (spec §8): the caller's
// organisation role, read with their own session so RLS applies.
export async function isAdvisor(sb: SupabaseClient, userId: string): Promise<boolean> {
  const { data } = await sb.from("organization_memberships").select("role, status").eq("user_id", userId).eq("status", "active");
  return Boolean(data?.some((r) => r.role === "advisor" || r.role === "admin"));
}
