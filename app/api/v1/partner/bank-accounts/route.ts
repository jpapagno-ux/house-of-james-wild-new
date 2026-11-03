import { withMember } from "@/lib/platform/membership";
import { dbError, error, invalid, jsonBody, ok } from "@/lib/platform/api";
import { parseBankAccount } from "@/lib/platform/commercial";

// POST /api/v1/partner/bank-accounts — a partner admin (or house finance) submits banking details (D-26).
// Always arrives as "pending": the house verifies before anything is paid. Changing details means
// submitting new ones; nothing is edited in place. The database enforces who may.
export const dynamic = "force-dynamic";

export const POST = withMember(async ({ req, desk, requestId }) => {
  if (!desk.org) return error("not_found", "No organization in view", requestId);
  const p = parseBankAccount(((await jsonBody(req)) ?? {}) as Record<string, unknown>);
  if (!p.ok) return invalid(p, requestId);
  const { data, error: e } = await desk.sb.from("partner_bank_accounts")
    .insert({ ...p.value, organization_id: desk.org.id, submitted_by: desk.user.id }).select("id").single();
  if (e) return dbError(e, requestId);
  return ok({ id: data.id }, requestId);
});
