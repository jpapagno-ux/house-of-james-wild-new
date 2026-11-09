import { createHash, randomBytes } from "node:crypto";
import { withHouse } from "@/lib/platform/membership";
import { error, invalid, jsonBody, ok, rpcError } from "@/lib/platform/api";
import { isUuid } from "@/lib/platform/validate";
import { advisorInviteMail } from "@/lib/platform/advisor-mail";
import { sendDeskMail } from "@/lib/platform/advisor-alerts";

// POST /api/v1/desk/advisors/:id/invite { email, send }: the house invites an advisor. Only the token's SHA-256
// is stored. With send: true the invitation is emailed (when enquiries are live); either way the link is
// returned once, so the house can pass it on by hand. A newer invitation replaces one still open.
export const dynamic = "force-dynamic";

export const POST = withHouse(async ({ req, desk, requestId, params }) => {
  if (!isUuid(params.id)) return error("not_found", "Not found", requestId);
  const b = ((await jsonBody(req)) ?? {}) as Record<string, unknown>;
  const email = typeof b.email === "string" ? b.email.trim().toLowerCase() : "";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254) return invalid({ ok: false, message: "Give a valid email address", field: "email" }, requestId);
  const token = randomBytes(32).toString("base64url");
  const token_hash = createHash("sha256").update(token).digest("hex");
  const { data: id, error: e } = await desk.sb.rpc("invite_advisor", { p_advisor: params.id, p_email: email, p_token_hash: token_hash });
  if (e) return rpcError(e, requestId);
  const link = `${new URL(req.url).origin}/advisor/invite/${token}`;
  let emailed = false;
  if (b.send === true) {
    const { data: a } = await desk.sb.from("advisors").select("display_name").eq("id", params.id).maybeSingle();
    const sent = await sendDeskMail(email, advisorInviteMail({ name: a?.display_name ?? "Advisor", link, inviter: "James Papagno" }), "advisor_invite");
    emailed = sent === "sent";
    if (emailed) await desk.sb.rpc("advisor_invitation_emailed", { p_invitation: id });
  }
  return ok({ id, link, emailed }, requestId, 201);
});
