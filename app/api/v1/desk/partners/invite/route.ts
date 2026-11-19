import { createHash, randomBytes } from "node:crypto";
import { withHouse } from "@/lib/platform/membership";
import { error, invalid, jsonBody, ok, rpcError } from "@/lib/platform/api";
import { isUuid } from "@/lib/platform/validate";
import { partnerInviteMail } from "@/lib/platform/partner-mail";
import { sendDeskMail } from "@/lib/platform/advisor-alerts";

// POST /api/v1/desk/partners/invite: the house invites a partner (James, 19 Nov 2026).
// { application?, org?, orgName?, name?, email, role, propertyIds?, entityRole?, access?, send }
// org: an existing partner organization; otherwise orgName creates one (with its PAR- code). propertyIds connects
// Ledger entries to the organization; access narrows this one person to some of them (a lodge in a group).
// Only the token's SHA-256 is stored; the link is returned once so the house can pass it on by hand.
export const dynamic = "force-dynamic";

const ids = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && isUuid(x)).slice(0, 200) : []);
const ROLES = ["owner", "operator", "sales_representative", "dmc", "booking_partner", "marketing_representative", "guide", "ground_handler"];

export const POST = withHouse(async ({ req, desk, requestId }) => {
  const b = ((await jsonBody(req)) ?? {}) as Record<string, unknown>;
  const email = typeof b.email === "string" ? b.email.trim().toLowerCase() : "";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254) return invalid({ ok: false, message: "Give a valid email address", field: "email" }, requestId);
  const role = b.role === "partner_contributor" ? "partner_contributor" : "partner_admin";
  const org = typeof b.org === "string" && isUuid(b.org) ? b.org : null;
  const orgName = typeof b.orgName === "string" ? b.orgName.trim().slice(0, 160) : "";
  if (!org && !orgName) return invalid({ ok: false, message: "Choose the partner or give its name", field: "orgName" }, requestId);
  const application = typeof b.application === "string" && isUuid(b.application) ? b.application : null;
  const entityRole = typeof b.entityRole === "string" && ROLES.includes(b.entityRole) ? b.entityRole : "operator";
  const name = typeof b.name === "string" ? b.name.trim().slice(0, 120) : null;
  const token = randomBytes(32).toString("base64url");
  const token_hash = createHash("sha256").update(token).digest("hex");
  const { data, error: e } = await desk.sb.rpc("house_invite_partner", {
    p_application: application, p_org: org, p_org_name: orgName || null, p_email: email, p_role: role,
    p_property_ids: ids(b.propertyIds), p_entity_role: entityRole, p_token_hash: token_hash, p_access: ids(b.access),
  });
  if (e) return rpcError(e, requestId);
  const out = data as { organization: string; invitation: string; code: string | null };
  const link = `${new URL(req.url).origin}/partner/invite/${token}`;
  let emailed = false;
  if (b.send === true) {
    const { data: o } = await desk.sb.from("organizations").select("name").eq("id", out.organization).maybeSingle();
    const access = ids(b.access);
    let q = desk.sb.from("entity_partners").select("properties(name)").eq("organization_id", out.organization);
    if (access.length) q = q.in("property_id", access);
    const { data: ents } = await q;
    const entries = [...new Set((ents ?? []).map((r) => (r as unknown as { properties: { name: string } | null }).properties?.name).filter((x): x is string => !!x))];
    const sent = await sendDeskMail(email, partnerInviteMail({ name, org: o?.name ?? orgName, link, inviter: "James Papagno", role, entries }), "partner_invite");
    emailed = sent === "sent";
  }
  if (!out?.organization) return error("server_error", "The invitation was not created", requestId);
  return ok({ ...out, link, emailed }, requestId, 201);
});
