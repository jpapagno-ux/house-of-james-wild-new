import { withMember } from "@/lib/platform/membership";
import { dbError, error, invalid, jsonBody, ok } from "@/lib/platform/api";
import { parseHostProposal } from "@/lib/platform/hosts";

// POST /api/v1/partner/hosts — propose who hosts one of this partner's pages ("Meet your host").
// It goes to the house; nothing reaches the page until a house editor approves it.
export const dynamic = "force-dynamic";

export const POST = withMember(async ({ req, desk, requestId }) => {
  if (!desk.org) return error("not_found", "No organization in view", requestId);
  const [{ data: pages }, { data: contacts }] = await Promise.all([
    desk.sb.from("host_pages").select("page_key").eq("organization_id", desk.org.id),
    desk.sb.from("contacts").select("id, first_name, last_name, title").eq("organization_id", desk.org.id).neq("status", "archived"),
  ]);
  const p = parseHostProposal(await jsonBody(req), (pages ?? []).map((x) => x.page_key as string),
    (contacts ?? []).map((c) => ({ id: c.id as string, name: [c.first_name, c.last_name].filter(Boolean).join(" "), title: (c.title as string) ?? null })));
  if (!p.ok) return invalid(p, requestId);
  const v = p.value;
  const { data: page } = await desk.sb.from("host_pages").select("place").eq("page_key", v.pageKey).maybeSingle();
  const { data, error: e } = await desk.sb.from("site_hosts").insert({
    page_key: v.pageKey, organization_id: desk.org.id, contact_id: v.contactId, name: v.name, job_title: v.jobTitle, company: v.company,
    card_line: v.cardLine, place: v.place ?? page?.place ?? null, partner_note: v.note,
  }).select("id").single();
  if (e) return dbError(e, requestId);
  return ok({ id: data.id }, requestId);
});
