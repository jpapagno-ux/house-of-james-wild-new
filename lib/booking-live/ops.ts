import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

// House operations (Booking Live's /api/v1/ops routes and /desk/bookings): who may hold, confirm, record
// and refund. Advisor Desk step 1 (5 Nov 2026): the house, as jw_admin, jw_portfolio_manager or admin in
// the internal organization, signed in with the authenticator code (aal2), the same rule the database
// applies (private.is_house_ops). Advisors are no longer house operations: they act on their own clients
// from the Advisor Desk. Read with the caller's own session, so RLS applies.
export const HOUSE_OPS_ROLES = ["jw_admin", "jw_portfolio_manager", "admin"] as const;

export type HouseOps = "ok" | "needs_code" | "no";

export async function houseOps(sb: SupabaseClient, userId: string): Promise<HouseOps> {
  const { data } = await sb.from("organization_memberships").select("role, status, organization:organizations(type, status)")
    .eq("user_id", userId).eq("status", "active");
  const rows = (data ?? []) as unknown as { role: string; organization: { type: string; status: string } | null }[];
  const house = rows.some((r) => r.organization?.type === "internal" && r.organization.status === "active" && (HOUSE_OPS_ROLES as readonly string[]).includes(r.role));
  if (!house) return "no";
  const { data: { session } } = await sb.auth.getSession();
  const { data: aal } = await sb.auth.mfa.getAuthenticatorAssuranceLevel(session?.access_token);
  return aal?.currentLevel === "aal2" ? "ok" : "needs_code";
}

/** True only for house operations signed in with the authenticator code. */
export async function isHouseOps(sb: SupabaseClient, userId: string): Promise<boolean> {
  return (await houseOps(sb, userId)) === "ok";
}
