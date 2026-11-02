import { withMember } from "@/lib/platform/membership";
import { dbError, error, invalid, jsonBody, ok } from "@/lib/platform/api";
import { parseCompany } from "@/lib/platform/validate";

// PATCH /api/v1/partner/company — partner admins and contributors update their company's administrative
// details directly (website, phone, general email, address, preferred contact, media kit).
// The name, partner code and type are never writable from the desk.
export const dynamic = "force-dynamic";

export const PATCH = withMember(async ({ req, desk, requestId }) => {
  if (!desk.org) return error("not_found", "No organization in view", requestId);
  const p = parseCompany(await jsonBody(req));
  if (!p.ok) return invalid(p, requestId);
  const { data, error: e } = await desk.sb.from("organizations").update(p.value).eq("id", desk.org.id).select("id");
  if (e) return dbError(e, requestId);
  if (!data?.length) return error("forbidden", "You can't change this company's details", requestId);
  return ok({ id: desk.org.id }, requestId);
});
