import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { currentUser } from "@/lib/booking-live/supabase/server";
import { error, newRequestId, rateLimited } from "@/lib/booking-live/api";
import { PARTNER_DESK } from "./flags";
import { isHouse, isHouseEditor, isPartnerAdmin, partnerMemberships, type Membership } from "./roles";

// Who is at the desk, and for which organization. The database decides what they
// may read and write (RLS); this only picks the screen and the organization in view.

export const ORG_COOKIE = "jw_pd_org";
type Sb = Awaited<ReturnType<typeof currentUser>>["sb"];

export type OrgSummary = { id: string; name: string; slug: string | null; partner_code: string | null };
export type DeskContext = {
  sb: Sb;
  user: User;
  memberships: Membership[];
  house: boolean;        // James Wild & Co staff (any house role)
  houseEditor: boolean;  // may approve / request
  org: OrgSummary | null;          // the partner organization in view
  membership: Membership | null;   // the viewer's own membership in it (null when the house is viewing)
  canAdmin: boolean;               // partner admin of the org in view
  orgs: OrgSummary[];              // organizations the viewer can switch between
};

/** Once per request (React cache), shared by the layout and the page. */
export const loadDesk = cache(async (): Promise<DeskContext | null> => {
  const { sb, user } = await currentUser();
  if (!user) return null;
  const { data } = await sb.from("organization_memberships")
    .select("id, role, status, organization:organizations(id, name, slug, type, partner_code)")
    .eq("user_id", user.id).eq("status", "active");
  const memberships = ((data ?? []) as unknown as Membership[]).filter((m) => m.organization);
  const house = isHouse(memberships), houseEditor = isHouseEditor(memberships);
  const mine = partnerMemberships(memberships);
  let orgs: OrgSummary[] = mine.map((m) => ({ id: m.organization.id, name: m.organization.name, slug: m.organization.slug, partner_code: m.organization.partner_code }));
  if (house) {
    const { data: all } = await sb.from("organizations").select("id, name, slug, partner_code").eq("type", "partner").eq("status", "active").order("name");
    orgs = (all ?? []) as OrgSummary[];
  }
  const wanted = (await cookies()).get(ORG_COOKIE)?.value;
  const org = orgs.find((o) => o.slug === wanted) ?? orgs[0] ?? null;
  const membership = org ? mine.find((m) => m.organization.id === org.id) ?? null : null;
  return { sb, user, memberships, house, houseEditor, org, membership, canAdmin: isPartnerAdmin(membership), orgs };
});

/** Partner Desk pages: 404 while the flag is off; sign-in when needed; a quiet
 * "no access" page for signed-in people with no partner (or house) membership. */
export async function requireDesk(returnTo: string): Promise<DeskContext & { org: OrgSummary }> {
  if (!PARTNER_DESK) notFound();
  const desk = await loadDesk();
  if (!desk) redirect(`/partner/login?next=${encodeURIComponent(returnTo)}`);
  if (!desk.org) redirect("/partner/no-access");
  return desk as DeskContext & { org: OrgSummary };
}

/** House desk pages (/desk/*): James Wild & Co editors only. */
export async function requireHouse(returnTo: string): Promise<DeskContext> {
  if (!PARTNER_DESK) notFound();
  const desk = await loadDesk();
  if (!desk) redirect(`/partner/login?next=${encodeURIComponent(returnTo)}`);
  if (!desk.houseEditor) notFound();
  return desk;
}

type Handler = (ctx: { req: Request; desk: DeskContext; requestId: string; params: Record<string, string> }) => Promise<Response>;

/** Wraps a Partner Desk API route: flag on? rate limit (writes)? signed in? */
export function withMember(handler: Handler, opts: { house?: boolean } = {}) {
  return async (req: Request, route: { params: Promise<Record<string, string>> }) => {
    const requestId = newRequestId();
    if (!PARTNER_DESK) return error("feature_off", "Not found", requestId);
    if (req.method !== "GET" && rateLimited(req, 40)) return error("rate_limited", "Too many requests, try again in a minute", requestId);
    // Same-origin writes only (cookie-authenticated API).
    if (req.method !== "GET") {
      const origin = req.headers.get("origin");
      if (origin && new URL(origin).host !== new URL(req.url).host) return error("forbidden", "Cross-site request refused", requestId);
    }
    try {
      const desk = await loadDesk();
      if (!desk) return error("sign_in_required", "Sign in to continue", requestId);
      if (opts.house && !desk.houseEditor) return error("forbidden", "James Wild & Co editors only", requestId);
      const params = (await route?.params) ?? {};
      return await handler({ req, desk, requestId, params });
    } catch (e) {
      console.error(JSON.stringify({ requestId, route: new URL(req.url).pathname, error: e instanceof Error ? e.message : String(e) }));
      return error("server_error", "Something went wrong; the house has been notified", requestId);
    }
  };
}
export const withHouse = (handler: Handler) => withMember(handler, { house: true });
