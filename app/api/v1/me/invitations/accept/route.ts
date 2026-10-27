import { withTraveler, ok, error, jsonBody } from "@/lib/booking-live/api";

// POST /api/v1/me/invitations/accept { token } — joins a shared Folio.
// The database function checks the token hash, expiry, single use and that
// the signed-in email matches the invitation.
export const dynamic = "force-dynamic";

export const POST = withTraveler("share", async ({ req, sb, requestId }) => {
  const body = (await jsonBody(req)) as { token?: unknown } | undefined;
  const token = typeof body?.token === "string" && /^[A-Za-z0-9_-]{20,100}$/.test(body.token) ? body.token : null;
  if (!token) return error("invite_invalid", "This invitation link isn't valid", requestId);
  const { data, error: e } = await sb.rpc("accept_folio_invitation", { raw_token: token });
  if (e) {
    if (e.code === "42501") return error("forbidden", "This invitation was sent to a different email. Sign in with that address.", requestId);
    return error("invite_invalid", "This invitation has expired or was already used. Ask for a new link.", requestId);
  }
  return ok({ folioId: data }, requestId);
});
