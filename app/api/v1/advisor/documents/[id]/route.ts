import { withAdvisor } from "@/lib/platform/advisor-api";
import { error, ok, rpcError } from "@/lib/platform/api";
import { isUuid } from "@/lib/platform/validate";

// DELETE /api/v1/advisor/documents/:id: withdraws a document still waiting for the house (archived,
// never erased; the house keeps its history).
export const dynamic = "force-dynamic";

export const DELETE = withAdvisor(async ({ a, requestId, params }) => {
  if (!isUuid(params.id)) return error("not_found", "Not found", requestId);
  const { data, error: e } = await a.sb.from("advisor_documents").update({ status: "archived" }).eq("id", params.id).eq("status", "submitted").select("id");
  if (e) return rpcError(e, requestId);
  if (!data?.length) return error("not_found", "Only a document still waiting for the house can be withdrawn", requestId);
  return ok({ withdrawn: true }, requestId);
});
