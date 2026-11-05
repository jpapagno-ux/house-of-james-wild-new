import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/booking-live/supabase/server";
import { supabaseAdmin } from "@/lib/booking-live/supabase/admin";
import { ADVISOR_TIERS, type AdvisorTier } from "./commission";
import { ADVISOR_DESK } from "./flags";

// Who is signed in to the Advisor Desk (step 2). The advisor record is looked up on the server with the
// service key, because the database only shows an advisor their own record once they are active AND
// signed in with the authenticator code (private.my_advisor_id): before that we still need to know
// whether to send them to the code screen, to their onboarding, or away. Everything an advisor then
// reads (clients, quotes, bookings) goes through their own session, so the database rules decide.

export type AdvisorRecord = { id: string; adv_number: string; slug: string; display_name: string; status: "invited" | "active" | "paused" | "left"; house_advisor: boolean };
export type AdvisorContext = {
  sb: SupabaseClient; user: User; advisor: AdvisorRecord;
  /** "ok" once signed in with the authenticator code; "verify" when set up but not entered; "enroll" when not set up yet. */
  mfa: "ok" | "verify" | "enroll";
  tier: { key: AdvisorTier; label: string; shareBp: number; since: string | null; assigned: boolean };
};

export const loadAdvisor = cache(async (): Promise<AdvisorContext | null> => {
  if (!ADVISOR_DESK) return null;
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const admin = supabaseAdmin();
  if (!admin) return null;
  const { data: advisor } = await admin.from("advisors").select("id, adv_number, slug, display_name, status, house_advisor").eq("user_id", user.id).maybeSingle();
  if (!advisor) return null;
  const { data: { session } } = await sb.auth.getSession();
  const { data: aal } = await sb.auth.mfa.getAuthenticatorAssuranceLevel(session?.access_token);
  const mfa: AdvisorContext["mfa"] = aal?.currentLevel === "aal2" ? "ok" : aal?.nextLevel === "aal2" ? "verify" : "enroll";
  const today = new Date().toISOString().slice(0, 10);
  const { data: rows } = await admin.from("advisor_tier_assignments").select("tier, effective_from, effective_to")
    .eq("user_id", user.id).lte("effective_from", today).order("effective_from", { ascending: false }).limit(5);
  const current = (rows ?? []).find((r) => !r.effective_to || r.effective_to >= today);
  const def = ADVISOR_TIERS[1];
  const t = ADVISOR_TIERS.find((x) => x.key === current?.tier) ?? def;
  return {
    sb, user, advisor: advisor as AdvisorRecord, mfa,
    tier: { key: t.key, label: t.label, shareBp: t.shareBp, since: current?.effective_from ?? null, assigned: Boolean(current) },
  };
});

/** For every Advisor Desk page: signed in, an advisor, the authenticator code entered, and active. */
export async function requireAdvisor(returnTo: string): Promise<AdvisorContext> {
  if (!ADVISOR_DESK) notFound();
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect(`/advisor/login?next=${encodeURIComponent(returnTo)}`);
  const a = await loadAdvisor();
  if (!a) redirect("/advisor/no-access");
  if (a.advisor.status === "paused" || a.advisor.status === "left") redirect("/advisor/no-access");
  if (a.mfa !== "ok") redirect(`/partner/security?next=${encodeURIComponent(returnTo)}`);
  if (a.advisor.status === "invited") redirect("/advisor/welcome");
  return a;
}
