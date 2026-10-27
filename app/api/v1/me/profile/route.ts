import { withTraveler, ok, error, jsonBody, dbError } from "@/lib/booking-live/api";
import { parseProfile } from "@/lib/booking-live/validate";

// GET   /api/v1/me/profile
// PATCH /api/v1/me/profile { firstName?, lastName?, phone?, preferredCurrency?, timezone? }
// Email is not editable here; it follows the verified sign-in email.
export const dynamic = "force-dynamic";

export const GET = withTraveler("accounts", async ({ sb, user, requestId }) => {
  const { data, error: e } = await sb.from("profiles").select("first_name, last_name, email, phone, preferred_currency, timezone").eq("id", user.id).single();
  return e ? dbError(e, requestId) : ok(data, requestId);
});

export const PATCH = withTraveler("accounts", async ({ req, sb, user, requestId }) => {
  const parsed = parseProfile(await jsonBody(req));
  if (!parsed.ok) return error(parsed.code, parsed.message, requestId);
  const { error: e } = await sb.from("profiles").update(parsed.value).eq("id", user.id);
  return e ? dbError(e, requestId) : ok({ updated: Object.keys(parsed.value) }, requestId);
});
