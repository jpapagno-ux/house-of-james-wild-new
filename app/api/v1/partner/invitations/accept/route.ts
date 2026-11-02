import { currentUser } from "@/lib/booking-live/supabase/server";
import { error, jsonBody, newRequestId, rateLimited } from "@/lib/booking-live/api";
import { ok, rpcError } from "@/lib/platform/api";
import { PARTNER_DESK } from "@/lib/platform/flags";

// POST /api/v1/partner/invitations/accept — { token }. The signed-in person accepts an
// invitation addressed to their email; the database checks the token, expiry, email and
// single use, then creates the membership (and any property narrowing).
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const requestId = newRequestId();
  if (!PARTNER_DESK) return error("feature_off", "Not found", requestId);
  if (rateLimited(req, 10)) return error("rate_limited", "Too many attempts, try again in a minute", requestId);
  const { sb, user } = await currentUser();
  if (!user) return error("sign_in_required", "Sign in to accept", requestId);
  const body = (await jsonBody(req)) as { token?: unknown } | undefined;
  const token = typeof body?.token === "string" && /^[A-Za-z0-9_-]{20,100}$/.test(body.token) ? body.token : null;
  if (!token) return error("invite_invalid", "This invitation link isn't valid", requestId);
  const { data, error: e } = await sb.rpc("accept_org_invitation", { raw_token: token });
  if (e) {
    if (e.code === "P0002") return error("invite_invalid", "This invitation has expired, was revoked, or has already been used", requestId);
    if (e.code === "42501") return error("forbidden", "This invitation was sent to a different email address", requestId);
    return rpcError(e, requestId);
  }
  return ok({ organizationId: data }, requestId);
}
