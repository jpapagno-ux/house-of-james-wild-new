import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/booking-live/supabase/server";
import { error, newRequestId } from "@/lib/booking-live/api";
import { ADVISOR_DESK } from "@/lib/platform/flags";
import { isUuid } from "@/lib/platform/validate";

// GET /api/v1/advisor/documents/:id/file: a 60-second signed link, issued only when the register row is
// visible to the caller (the advisor, or the house with the code). Never a public URL.
export const dynamic = "force-dynamic";

export async function GET(_req: Request, route: { params: Promise<{ id: string }> }) {
  const requestId = newRequestId();
  const { id } = await route.params;
  if (!ADVISOR_DESK || !isUuid(id)) return error("not_found", "Not found", requestId);
  const sb = await supabaseServer();
  const { data: doc } = await sb.from("advisor_documents").select("storage_path").eq("id", id).maybeSingle();
  if (!doc) return error("not_found", "Not found", requestId);
  const { data, error: e } = await sb.storage.from("advisor-files").createSignedUrl(doc.storage_path, 60, { download: true });
  if (e || !data?.signedUrl) return error("not_found", "Not found", requestId);
  const res = NextResponse.redirect(data.signedUrl, 302);
  res.headers.set("cache-control", "no-store");
  res.headers.set("referrer-policy", "no-referrer");
  return res;
}
