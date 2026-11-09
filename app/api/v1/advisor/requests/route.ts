import { withAdvisor } from "@/lib/platform/advisor-api";
import { invalid, jsonBody, ok, rpcError } from "@/lib/platform/api";
import { error } from "@/lib/booking-live/api";
import { parseRequest } from "@/lib/platform/advisor-requests";
import { estimateFor } from "@/lib/platform/advisor-estimate";
import { STAYS } from "@/lib/content/stays";
import { houseAlert } from "@/lib/platform/advisor-alerts";

// POST /api/v1/advisor/requests: an active advisor asks the house to price and hold a stay for a client.
// The stay, its Ledger ID and the estimate come from the site's own records, never from the browser.
export const dynamic = "force-dynamic";

export const POST = withAdvisor(async ({ req, a, requestId }) => {
  if (a.advisor.status !== "active") return error("forbidden", "Your desk opens once the house activates your file", requestId);
  const today = new Date().toISOString().slice(0, 10);
  const p = parseRequest(((await jsonBody(req)) ?? {}) as Record<string, unknown>, today);
  if (!p.ok) return invalid({ ok: false, message: p.message, field: p.field }, requestId);
  const stay = STAYS.find((s) => s.slug === p.value.stay);
  if (!stay) return invalid({ ok: false, message: "That stay isn't in the Ledger", field: "stay" }, requestId);
  const est = estimateFor(stay.slug, p.value.arrival, p.value.departure, { adults: p.value.adults, childAges: p.value.child_ages });
  const { data, error: e } = await a.sb.rpc("create_advisor_request", {
    p: { ...p.value, stay_slug: stay.slug, ledger_id: stay.ledgerId, stay_name: stay.name, estimate: est ?? null },
  });
  if (e) return rpcError(e, requestId);
  const made = (data ?? {}) as { id?: string; ref?: string };
  if (made.id) await houseAlert({ kind: "request_sent", advisor: a.advisor.display_name, ref: made.ref ?? "New request", stay: stay.name, dates: `${p.value.arrival} to ${p.value.departure}` }, req, `/desk/advisor-requests/${made.id}`);
  return ok(data, requestId, 201);
});
