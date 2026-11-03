import { withMember } from "@/lib/platform/membership";
import { dbError, error, invalid, jsonBody, ok } from "@/lib/platform/api";
import { parseCurrencies } from "@/lib/platform/commercial";

// PATCH /api/v1/partner/company/currencies { primaryCurrency, otherCurrencies[] } (D-26).
// Partner members and house editors; the database checks the same rule as company details.
export const dynamic = "force-dynamic";

export const PATCH = withMember(async ({ req, desk, requestId }) => {
  if (!desk.org) return error("not_found", "No organization in view", requestId);
  const p = parseCurrencies(((await jsonBody(req)) ?? {}) as Record<string, unknown>);
  if (!p.ok) return invalid(p, requestId);
  const { data, error: e } = await desk.sb.from("organizations").update(p.value).eq("id", desk.org.id).select("id");
  if (e) return dbError(e, requestId);
  if (!data?.length) return error("forbidden", "You can't change this company's currencies", requestId);
  return ok({ id: desk.org.id }, requestId);
});
