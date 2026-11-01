import { createHash, randomBytes } from "node:crypto";
import { withMember } from "@/lib/platform/membership";
import { dbError, error, invalid, jsonBody, ok } from "@/lib/platform/api";
import { inviteEmail } from "@/lib/platform/invite-email";
import { ROLE_LABEL } from "@/lib/platform/roles";
import { parseInvite } from "@/lib/platform/validate";

// POST /api/v1/partner/invitations — a partner admin invites a teammate (admin or
// contributor, optionally narrowed to some properties). Only the token's SHA-256 is
// stored. The email goes out through Resend when enquiries are live; the link is also
// returned once to the inviting admin so it can be passed on by hand.
export const dynamic = "force-dynamic";

export const POST = withMember(async ({ req, desk, requestId }) => {
  if (!desk.org) return error("not_found", "No organization in view", requestId);
  if (!desk.canAdmin && !desk.house) return error("forbidden", "Only a partner admin can invite", requestId);
  const p = parseInvite(await jsonBody(req));
  if (!p.ok) return invalid(p, requestId);
  const token = randomBytes(32).toString("base64url");
  const token_hash = createHash("sha256").update(token).digest("hex");
  const { data, error: e } = await desk.sb.from("org_invitations").insert({
    organization_id: desk.org.id, email: p.value.email, role: p.value.role, entity_ids: p.value.entities, token_hash,
  }).select("id, expires_at").single();
  if (e) return dbError(e, requestId);

  const link = `${new URL(req.url).origin}/partner/invite/${token}`;
  let emailed = false;
  const key = process.env.RESEND_API_KEY, from = process.env.ENQUIRY_FROM;
  if (process.env.ENQUIRY_LIVE === "on" && key && from && !p.value.email.endsWith(".test")) {
    const m = inviteEmail({ org: desk.org.name, role: ROLE_LABEL[p.value.role], link, inviter: desk.user.email ?? null });
    try {
      const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
        body: JSON.stringify({ from, to: [p.value.email], subject: m.subject, text: m.text, html: m.html }) });
      emailed = r.ok;
      if (!r.ok) console.error(JSON.stringify({ requestId, resend: r.status }));
    } catch (x) { console.error(JSON.stringify({ requestId, resend: x instanceof Error ? x.message : String(x) })); }
  }
  return ok({ id: data.id, expiresAt: data.expires_at, emailed, link }, requestId, 201);
});
