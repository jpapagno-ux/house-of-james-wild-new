import { createHash, randomBytes } from "node:crypto";
import { withTraveler, ok, error, jsonBody, dbError } from "@/lib/booking-live/api";
import { isUuid, parseInvite } from "@/lib/booking-live/validate";
import { absoluteUrl } from "@/lib/seo";

// POST /api/v1/me/folios/:id/invitations { email, role } — owner only.
// Creates a single-use, 14-day link. Only the SHA-256 hash is stored; the raw
// token is returned once so the owner can send it. (Phase 1 returns the link;
// house-branded invite emails arrive with the email provider in Phase 2.)
export const dynamic = "force-dynamic";

export const POST = withTraveler("share", async ({ req, sb, user, params, requestId }) => {
  if (!isUuid(params.id)) return error("not_found", "Not found", requestId);
  const parsed = parseInvite(await jsonBody(req));
  if (!parsed.ok) return error(parsed.code, parsed.message, requestId);
  if (parsed.value.email === user.email?.toLowerCase()) return error("invalid_input", "That's your own email", requestId);
  const token = randomBytes(32).toString("base64url");
  const token_hash = createHash("sha256").update(token).digest("hex");
  const { error: e } = await sb.from("folio_invitations").insert({
    folio_id: params.id, invited_email: parsed.value.email, role: parsed.value.role, token_hash, invited_by: user.id,
  });
  if (e) return dbError(e, requestId);
  return ok({ link: absoluteUrl(`/account/invite/${token}`), email: parsed.value.email, role: parsed.value.role, expiresInDays: 14 }, requestId, 201);
});
