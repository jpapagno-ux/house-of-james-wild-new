import { withMember } from "@/lib/platform/membership";
import { dbError, error, jsonBody, ok } from "@/lib/platform/api";

// PATCH /api/v1/partner/profile — { firstName, lastName, phone } for the signed-in person.
export const dynamic = "force-dynamic";

export const PATCH = withMember(async ({ req, desk, requestId }) => {
  const b = (await jsonBody(req)) as Record<string, unknown> | undefined;
  if (!b || typeof b !== "object" || Object.keys(b).some((k) => !["firstName", "lastName", "phone"].includes(k))) return error("invalid_input", "Unexpected field", requestId);
  const t = (v: unknown, n: number) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ").slice(0, n) || null : null);
  const phone = t(b.phone, 40);
  if (phone && !/^[+0-9 ()\-.]{4,40}$/.test(phone)) return error("invalid_input", "Use digits, spaces and + only", requestId);
  const { error: e } = await desk.sb.from("profiles").update({ first_name: t(b.firstName, 80), last_name: t(b.lastName, 80), phone }).eq("id", desk.user.id);
  if (e) return dbError(e, requestId);
  return ok({ saved: true }, requestId);
});
