import { NextResponse } from "next/server";
import { withMember } from "@/lib/platform/membership";
import { error } from "@/lib/platform/api";
import { isUuid } from "@/lib/platform/validate";

// GET /api/v1/partner/documents/:id/file — a 60-second signed link to the file, issued only if the
// register row is visible to this person (RLS) and the storage rule agrees. Never a public URL.
export const dynamic = "force-dynamic";

export const GET = withMember(async ({ desk, requestId, params }) => {
  if (!isUuid(params.id)) return error("not_found", "Not found", requestId);
  const { data: doc } = await desk.sb.from("partner_documents").select("storage_path, title").eq("id", params.id).maybeSingle();
  if (!doc) return error("not_found", "Not found", requestId);
  const { data, error: e } = await desk.sb.storage.from("partner-documents").createSignedUrl(doc.storage_path, 60, { download: true });
  if (e || !data?.signedUrl) return error("not_found", "Not found", requestId);
  const res = NextResponse.redirect(data.signedUrl, 302);
  res.headers.set("cache-control", "no-store");
  res.headers.set("referrer-policy", "no-referrer");
  return res;
});
