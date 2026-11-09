import { withHouse } from "@/lib/platform/membership";
import { invalid, jsonBody, ok, rpcError } from "@/lib/platform/api";

// POST /api/v1/desk/advisors { name, house }: the house adds an advisor. The database issues the ADV number
// and the slug; the advisor starts as invited, with no access until they accept an invitation.
export const dynamic = "force-dynamic";

export const POST = withHouse(async ({ req, desk, requestId }) => {
  const b = ((await jsonBody(req)) ?? {}) as Record<string, unknown>;
  const name = typeof b.name === "string" ? b.name.trim().replace(/\s+/g, " ") : "";
  if (name.length < 2 || name.length > 120 || !name.includes(" ")) return invalid({ ok: false, message: "Give the advisor's first and last name", field: "name" }, requestId);
  const { data, error: e } = await desk.sb.rpc("create_advisor", { p_name: name, p_house: b.house === true });
  if (e) return rpcError(e, requestId);
  return ok({ id: data }, requestId, 201);
});
