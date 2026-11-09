import { currentUser } from "@/lib/booking-live/supabase/server";
import { error, jsonBody, newRequestId, rateLimited } from "@/lib/booking-live/api";
import { ok, rpcError } from "@/lib/platform/api";
import { ADVISOR_DESK } from "@/lib/platform/flags";
import { houseAlert } from "@/lib/platform/advisor-alerts";

// POST /api/v1/advisor/invitations/accept { token }: the signed-in person accepts an advisor invitation sent to
// their email. The database checks the token, expiry, single use and email, then links the account.
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const requestId = newRequestId();
  if (!ADVISOR_DESK) return error("feature_off", "Not found", requestId);
  if (rateLimited(req, 10)) return error("rate_limited", "Too many attempts, try again in a minute", requestId);
  const { sb, user } = await currentUser();
  if (!user) return error("sign_in_required", "Sign in to accept", requestId);
  const body = (await jsonBody(req)) as { token?: unknown } | undefined;
  const token = typeof body?.token === "string" && /^[A-Za-z0-9_-]{20,100}$/.test(body.token) ? body.token : null;
  if (!token) return error("invite_invalid", "This invitation link isn't valid", requestId);
  const { data, error: e } = await sb.rpc("accept_advisor_invitation", { raw_token: token });
  if (e) {
    if (e.code === "P0002") return error("invite_invalid", "This invitation has expired, was replaced, or has already been used", requestId);
    if (e.code === "42501") return error("forbidden", e.message || "This invitation was sent to a different email address", requestId);
    return rpcError(e, requestId);
  }
  await houseAlert({ kind: "invitation_accepted", advisor: user.email ?? "An advisor" }, req, `/desk/advisors/${data}`);
  return ok({ advisorId: data }, requestId);
}
